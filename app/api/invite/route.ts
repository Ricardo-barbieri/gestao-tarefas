import { identity, database, readJson, errorResponse, sameOrigin, fail, hash, save } from '@/lib/server';
import { now, log } from '@/lib/model';
export async function POST(req: Request) { try {
    sameOrigin(req);
    const u = await identity();
    const d = await readJson(req);
    const row: any = await database().prepare('SELECT * FROM organizations WHERE id=?').bind(d.orgId).first();
    if (!row)
        fail(404, 'Convite não encontrado.');
    const s = JSON.parse(row.state);
    const tokenHash = await hash(String(d.token || ''));
    const invite = s.invites.find((x: any) => x.hash === tokenHash && !x.used && x.expiresAt > now());
    if (!invite || invite.email !== u.email.toLowerCase())
        fail(403, 'Convite expirado, utilizado ou destinado a outro e-mail.');
    if (s.people.some((x: any) => x.id === u.userId))
        fail(409, 'Você já participa desta empresa.');
    invite.used = true;
    const person = { id: u.userId, name: u.fullName || u.email, email: u.email, role: invite.role, teams: invite.teams, hours: 40, hourlyCents: 0, absences: [] };
    s.people.push(person);
    s.audit.push(log(u.userId, 'Convite aceito', u.email));
    const result = await database().batch([database().prepare('UPDATE organizations SET state=?,revision=revision+1 WHERE id=? AND revision=?').bind(JSON.stringify(s), d.orgId, row.revision), database().prepare('INSERT INTO memberships (id,org_id,user_id,email,role) SELECT ?,?,?,?,? WHERE EXISTS (SELECT 1 FROM organizations WHERE id=? AND revision=? AND state=?)').bind(d.orgId + ':' + u.userId, d.orgId, u.userId, u.email, invite.role, d.orgId, row.revision + 1, JSON.stringify(s))]);
    if (!result[0].meta.changes)
        fail(409, 'Outro convite foi processado. Tente novamente.');
    return Response.json({ ok: true, orgId: d.orgId });
}
catch (e) {
    return errorResponse(e);
} }
