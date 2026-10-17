import {ensureStructure,StructureError} from './organization';
import {catalogTypes,professionalRoles} from './catalog';
import { env } from 'cloudflare:workers';
import {getApplicationUser,adminEmail,AuthError} from './auth';
import { State, Person, seed, createCompany, hasPermission, canBoard, uid, now, log } from './model';
export class HttpError extends Error {
    constructor(public status: number, message: string) { super(message); }
}
export const fail = (status: number, message: string): never => { throw new HttpError(status, message); };
export async function hash(value: string) { const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)); return Array.from(new Uint8Array(d)).map(x => x.toString(16).padStart(2, '0')).join(''); }
export async function identity() { const u = await getApplicationUser(); if (!u)
    fail(401, 'Entre para acessar sua empresa.'); return u!; }
export function database() { return (env as any).DB as D1Database; }
export function bucket() { return (env as any).BUCKET as R2Bucket; }
export async function context(orgId?: string) {
    const u = await identity();
    const db = database();
    let membership: any = orgId ? await db.prepare('SELECT * FROM memberships WHERE user_id=? AND org_id=?').bind(u.userId, orgId).first() : await db.prepare("SELECT m.* FROM memberships m WHERE m.user_id=? ORDER BY CASE WHEN EXISTS (SELECT 1 FROM memberships principal WHERE principal.org_id=m.org_id AND lower(principal.email)=? AND principal.role='admin') THEN 0 ELSE 1 END,m.id LIMIT 1").bind(u.userId,adminEmail()).first();
    if (!membership) {
        if (orgId)
            fail(403, 'Sem acesso a esta empresa.');
        if(u.email.toLowerCase()!==adminEmail())fail(403,'Seu cadastro aguarda aprovação e vínculo com a empresa.');
        const id = 'org-' + await hash(u.userId);
        const s = createCompany(u.userId, u.email, u.fullName || 'Você');
        await db.batch([db.prepare('INSERT OR IGNORE INTO organizations (id,name,state,revision,created_at) VALUES (?,?,?,1,?)').bind(id, s.org.name, JSON.stringify(s), now()), db.prepare('INSERT OR IGNORE INTO memberships (id,org_id,user_id,email,role) VALUES (?,?,?,?,?)').bind(id + ':' + u.userId, id, u.userId, u.email, 'admin')]);
        membership = { org_id: id, role: 'admin' };
    }
    const row: any = await db.prepare('SELECT * FROM organizations WHERE id=?').bind(membership.org_id).first();
    if (!row)
        fail(404, 'Empresa não encontrada.');
    const s: State = JSON.parse(row.state);s.jobTitles ||= [...professionalRoles];for(const type of catalogTypes())if(!s.types.some(t=>t.id===type.id||t.name===type.name))s.types.push(type);
    ensureStructure(s);
    const p = s.people.find(x => x.id === u.userId);
    if (!p || p.active === false)
        fail(403, 'Vínculo inativo.');
    const names=await db.prepare('SELECT a.user_id,a.name FROM auth_accounts a JOIN memberships m ON m.user_id=a.user_id WHERE m.org_id=?').bind(row.id).all<{user_id:string;name:string}>();
    for(const account of names.results){const person=s.people.find(x=>x.id===account.user_id);if(person)person.name=account.name;}
    p!.role = membership.role;
    return { s, p: p!, orgId: row.id, revision: row.revision, u };
}
export type Context = Awaited<ReturnType<typeof context>>;
export function manager(c: Context) { if (!['admin', 'manager'].includes(c.p.role))
    fail(403, 'Ação disponível para administradores e gestores.'); }
export function admin(c: Context) { if (c.p.role !== 'admin')
    fail(403, 'Ação disponível para administradores.'); }
export function taskAccess(c: Context, id: string, edit = false) { const t = c.s.tasks.find(t => t.id === id); const b = t && c.s.boards.find(b => b.id === t.boardId); if (!t || !b || !canBoard(c.s, b, c.p))
    fail(404, 'Tarefa não encontrada.'); if(edit&&!hasPermission(c.p,'editTasks'))fail(403,'Seu perfil não permite editar tarefas.'); if(edit&&c.p.role==='member'&&t!.assignee!==c.p.id&&t!.creator!==c.p.id)fail(403,'Edite somente tarefas atribuídas a você ou criadas por você.'); if (edit && b!.stages.find(x => x.id === t!.stageId)?.kind === 'delivery')
    fail(409, 'Tarefa entregue. Reabra para realizar alterações operacionais.'); return t!; }
export function boardAccess(c: Context, id: string) { const b = c.s.boards.find(b => b.id === id); if (!b || !canBoard(c.s, b, c.p))
    fail(404, 'Quadro não encontrado.'); return b!; }
export async function save(c: Context, event?: {
    name: string;
    taskId: string;
}) { if (c.s.audit.length > 2000)
    c.s.audit = c.s.audit.slice(-2000); const serialized = JSON.stringify(c.s); const eventId = uid(); const payload = JSON.stringify({ id: eventId, event: event?.name, at: now(), organizationId: c.orgId, taskId: event?.taskId }); const hooks = event ? (c.s.webhooks || []).filter(h => h.active && h.events.includes(event.name)) : []; const batch = await database().batch([database().prepare('UPDATE organizations SET state=?,name=?,revision=revision+1 WHERE id=? AND revision=?').bind(serialized, c.s.org.name, c.orgId, c.revision), database().prepare("INSERT INTO calendar_jobs(org_id,revision,next_at) SELECT ?,?,? WHERE EXISTS (SELECT 1 FROM organizations WHERE id=? AND revision=? AND state=?) ON CONFLICT(org_id) DO UPDATE SET revision=excluded.revision,next_at=excluded.next_at,attempts=0,last_error=''").bind(c.orgId,c.revision+1,now(),c.orgId,c.revision+1,serialized), ...c.s.people.map(person => database().prepare('UPDATE memberships SET role=? WHERE org_id=? AND user_id=? AND EXISTS (SELECT 1 FROM organizations WHERE id=? AND revision=? AND state=?)').bind(person.role, c.orgId, person.id, c.orgId, c.revision + 1, serialized)), ...hooks.map(h => database().prepare("INSERT INTO webhook_deliveries (id,org_id,webhook_id,event_id,payload,status,attempts,next_at,last_error,created_at) SELECT ?,?,?,?,?, 'pending',0,?,'',? WHERE EXISTS (SELECT 1 FROM organizations WHERE id=? AND revision=? AND state=?)").bind(uid(), c.orgId, h.id, eventId, payload, now(), now(), c.orgId, c.revision + 1, serialized))]); if (!batch[0].meta.changes)
    fail(409, 'Outra pessoa alterou os dados. Seu conteúdo foi preservado; atualize e tente novamente.'); c.revision++; }
export function visible(c: Context) { const s = structuredClone(c.s); s.boards = s.boards.filter(b => canBoard(s, b, c.p)); const boards = new Set(s.boards.map(b => b.id)); s.tasks = s.tasks.filter(t => boards.has(t.boardId)); const tasks = new Set(s.tasks.map(t => t.id)); s.time = s.time.filter(t => tasks.has(t.taskId)); s.timers = s.timers.filter(t => tasks.has(t.taskId)); s.runs = s.runs.filter(t => tasks.has(t.taskId)); s.forms = s.forms.filter(f => boards.has(f.boardId)); s.rules = s.rules.filter(r => boards.has(r.boardId)); s.shares = s.shares.filter(r => tasks.has(r.taskId)); s.projects = s.projects.filter(p => s.tasks.some(t => t.projectId === p.id) || p.manager === c.p.id || c.p.role === 'admin'); s.clients = s.clients.filter(p => s.tasks.some(t => t.clientId === p.id) || s.projects.some(x => x.clientId === p.id) || c.p.role === 'admin'); s.notifications = s.notifications.filter(n => n.userId === c.p.id); if(!hasPermission(c.p,'viewReports')){s.time=s.time.filter(t=>t.userId===c.p.id);s.timers=s.timers.filter(t=>t.userId===c.p.id);}s.views = s.views.filter(n => n.userId === c.p.id); s.dashboards = { [c.p.id]: s.dashboards[c.p.id] || ['open', 'late', 'hours', 'approved'] }; s.receipts = []; s.apiTokens = c.p.role === 'admin' ? s.apiTokens : []; s.webhooks = c.p.role === 'admin' ? s.webhooks : []; s.invites = s.invites.map(i => ({ ...i, hash: '' })); if (!hasPermission(c.p,'viewFinance')) {const financial=new Set(s.customFields.filter(f=>f.type==='currency').map(f=>f.id));s.customFields=s.customFields.filter(f=>!financial.has(f.id));for(const task of s.tasks)for(const key of financial)delete task.fields[key];
    s.people = s.people.map(p => ({ ...p, hourlyCents: 0 }));
    s.projects = s.projects.map(p => ({ ...p, budgetCents: 0 }));
    s.audit = [];
    s.invites = [];
} if(!hasPermission(c.p,'managePeople'))s.people=s.people.map(({permissions,allowedBoards,deniedBoards,...person})=>person);return { state: s, revision: c.revision, me: c.p.id, role:c.p.role,isMaster:c.p.email.toLowerCase()===adminEmail(),orgId:c.orgId }; }
export function textInput(v: unknown, max = 1000) { if (typeof v !== 'string' || v.length > max)
    fail(400, 'Texto inválido ou muito longo.'); return v as string; }
export function dateInput(v: any) { if (v !== '' && (!/^\d{4}-\d{2}-\d{2}$/.test(v) || (!Number.isFinite(Date.parse(v + 'T12:00:00Z')) || new Date(v + 'T12:00:00Z').toISOString().slice(0, 10) !== v)))
    fail(400, 'Data inválida.'); return v; }
export function numberInput(v: any, min = 0, max = 100000) { const n = Number(v); if (!Number.isFinite(n) || n < min || n > max)
    fail(400, 'Número fora do intervalo permitido.'); return n; }
export function emailInput(v: any) { if (typeof v !== 'string' || v.length > 254 || !/^\S+@\S+\.\S+$/.test(v))
    fail(400, 'E-mail inválido.'); return v.toLowerCase(); }
export async function readJson(req: Request) { if (Number(req.headers.get('content-length') || 0) > 1048576)
    fail(413, 'Requisição muito grande.'); const text = await req.text(); if (text.length > 1048576)
    fail(413, 'Requisição muito grande.'); try {
    return JSON.parse(text);
}
catch {
    fail(400, 'JSON inválido.');
} }
export function sameOrigin(req: Request) { const o = req.headers.get('origin'); if (o && o !== new URL(req.url).origin)
    fail(403, 'Origem não autorizada.'); }
export function errorResponse(e: any) { const status = (e instanceof HttpError||e instanceof AuthError||e instanceof StructureError) ? e.status : 400; return Response.json({ error: status >= 500 ? 'Não foi possível concluir a operação.' : e.message || 'Operação inválida.' }, { status }); }
export async function limit(key: string, max = 30) { const bucket = Math.floor(Date.now() / 60000); const id = key + ':' + bucket; const r: any = await database().prepare('INSERT INTO rate_limits (id,count,expires) VALUES (?,1,?) ON CONFLICT(id) DO UPDATE SET count=count+1 RETURNING count').bind(id, bucket + 2).first(); if (r.count > max)
    fail(429, 'Muitas tentativas. Aguarde um minuto.'); if (Math.random() < .02)
    await database().prepare('DELETE FROM rate_limits WHERE expires < ?').bind(bucket).run(); }
export async function link(c: Context, kind: string, resourceId: string, expiresAt: string) { const token = uid() + uid(); await database().prepare('INSERT INTO public_links (hash,org_id,kind,resource_id,expires_at,revoked) VALUES (?,?,?,?,?,0)').bind(await hash(token), c.orgId, kind, resourceId, expiresAt).run(); return token; }
export async function publicContext(token: string, kind?: string) { const r: any = await database().prepare('SELECT * FROM public_links WHERE hash=? AND revoked=0 AND expires_at>?').bind(await hash(token), now()).first(); if (!r || (kind && r.kind !== kind))
    fail(404, 'Link expirado ou revogado.'); const row: any = await database().prepare('SELECT * FROM organizations WHERE id=?').bind(r.org_id).first(); if (!row)
    fail(404, 'Link indisponível.'); return { r, c: { s: JSON.parse(row.state), p: { id: 'external', role: 'member' } as Person, orgId: r.org_id, revision: row.revision, u: null } as unknown as Context }; }
export function audit(c: Context, event: string, detail: string) { c.s.audit.push(log(c.p.id, event, detail)); }
export async function apiContext(req: Request, write = false) { const authorization = req.headers.get('authorization') || ''; if (!authorization.startsWith('Bearer '))
    fail(401, 'Informe um token Bearer válido.'); const token = authorization.slice(7); const { c, r } = await publicContext(token, 'api'); const record = c.s.apiTokens?.find(t => t.id === r.resource_id && !t.revoked && t.expiresAt > now()); if (!record)
    fail(401, 'Token expirado ou revogado.'); if (write && record!.scope !== 'write')
    fail(403, 'Token sem permissão de escrita.'); const membership: any = await database().prepare('SELECT * FROM memberships WHERE org_id=? AND user_id=?').bind(c.orgId, record!.userId).first(); const person = c.s.people.find(x => x.id === record!.userId); if (!membership || !person || person.active === false)
    fail(403, 'Vínculo inativo.'); c.p = person!; c.p.role = membership.role; await limit('api:' + r.resource_id, 60); return c; }
