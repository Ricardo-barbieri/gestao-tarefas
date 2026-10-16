import {adminEmail} from './auth';
import { Context, admin, manager, taskAccess, boardAccess, fail, textInput, numberInput, dateInput, emailInput, audit, link, hash } from './server';
import { validWebhookUrl, allowedWebhookUrl } from './webhooks';
import { database } from './server';
import { uid, now, log, newTask, moveTask, isDelivered, canBoard, relativeDue, Task, FormDef, Board } from './model';
const choices = (v: any, allowed: string[]) => { if (!allowed.includes(v))
    fail(400, 'Opção inválida.'); return v; };
export async function action(c: Context, a: string, d: any) {
    const s = c.s, p = c.p;
    let out: any = {};
    const taskActions = ['updateTask', 'move', 'archiveTask', 'restoreTask', 'duplicateTask', 'timerStart', 'timerStop', 'manualTime', 'comment', 'checklist', 'dependency', 'requestApproval', 'decideApproval', 'reopen', 'share', 'revokeShare', 'follow', 'createSubtask', 'transferTask', 'recurrence'];
    if (taskActions.includes(a) && a !== 'timerStop') {
        const t = taskAccess(c, d.id);
        if (d.taskRevision !== undefined && d.taskRevision !== t.revision)
            fail(409, 'A tarefa foi alterada por outra pessoa. Atualize antes de salvar.');
    }
    switch (a) {
        case 'createTask': {
            const b = boardAccess(c, d.boardId);
            const title = textInput(d.title, 300).trim();
            if (!title)
                fail(400, 'Informe um título.');
            const ty = s.types.find(x => x.id === d.typeId && x.active);
            const t = newTask(s, p.id, { title, boardId: b.id, typeId: ty?.id || '', typeSnapshot: ty?.name || '', estimate: ty?.estimate || 0, assignee: p.id });
            s.tasks.push(t);
            out = { id: t.id };
            break;
        }
        case 'updateTask': {
            const t = taskAccess(c, d.id, true);
            const fields = d.fields || {};
            for (const [k, v] of Object.entries(fields)) {
                if (['title', 'description'].includes(k)) {
                    const val = textInput(v, k === 'title' ? 300 : 30000);
                    if (k === 'title' && !val.trim())
                        fail(400, 'Informe um título.');
                    (t as any)[k] = val;
                }
                else if (['due', 'start', 'desiredDue'].includes(k))
                    (t as any)[k] = dateInput(v);
                else if (k === 'priority')
                    t.priority = choices(v, ['Baixa', 'Normal', 'Alta', 'Urgente']);
                else if (k === 'assignee') {
                    if (v && !s.people.some(x => x.id === v))
                        fail(400, 'Responsável inválido.');
                    t.assignee = v as string;
                    if (v)
                        s.notifications.push({ id: uid(), userId: v as string, text: `Você recebeu a tarefa ${t.title}`, taskId: t.id, read: false, at: now() });
                }
                else if (k === 'estimate')
                    t.estimate = numberInput(v);
                else if (k === 'projectId' || k === 'clientId') {
                    if (v && !(k === 'projectId' ? s.projects : s.clients).some(x => x.id === v))
                        fail(400, 'Referência inválida.');
                    (t as any)[k] = v;
                }
                else if (k === 'tags') {
                    if (!Array.isArray(v) || v.length > 30)
                        fail(400, 'Tags inválidas.');
                    t.tags = (v as any[]).map(x => textInput(x, 60));
                }
                else if (k === 'typeId') {
                    const ty = s.types.find(x => x.id === v && x.active);
                    if (!ty)
                        fail(400, 'Tipo inválido.');
                    t.typeId = ty!.id;
                    t.typeSnapshot = ty!.name;
                    if (!t.estimate || d.replaceEstimate === true)
                        t.estimate = ty!.estimate;
                }
                else if (k === 'fields') {
                    for (const [id, value] of Object.entries(v as any)) {
                        const def = s.customFields.find(f => f.id === id);
                        if (!def)
                            fail(400, 'Campo inexistente.');
                        if (['rating', 'nps', 'number', 'currency'].includes(def!.type))
                            t.fields[id] = numberInput(value, def!.type === 'nps' ? 0 : def!.min, def!.type === 'nps' ? 10 : def!.max);
                        else
                            t.fields[id] = typeof value === 'boolean' ? value : textInput(value, 2000);
                    }
                }
                else
                    fail(400, 'Campo não editável.');
            }
            t.revision++;
            t.history.push(log(p.id, 'Atualizada', Object.keys(fields).join(', ')));
            break;
        }
        case 'move': {
            const t = taskAccess(c, d.id, true);
            moveTask(s, t, d.stageId, p);
            if (isDelivered(s, t) && t.recurrence) {
                const r = t.recurrence;
                const count = r.frequency === 'daily' ? 1 : r.frequency === 'weekly' ? 7 : 30;
                const due = relativeDue(s, now(), count, false);
                const next = newTask(s, p.id, { title: t.title, description: t.description, boardId: t.boardId, typeId: t.typeId, typeSnapshot: t.typeSnapshot, estimate: t.estimate, assignee: t.assignee, projectId: t.projectId, clientId: t.clientId, tags: [...t.tags], due, recurrence: { frequency: r.frequency, nextDue: '' } });
                next.history.push(log(p.id, 'Recorrência', 'Gerada após entrega de VM-' + t.number));
                s.tasks.push(next);
                t.recurrence = undefined;
            }
            break;
        }
        case 'follow': {
            const t = taskAccess(c, d.id, true);
            t.followers = t.followers.includes(p.id) ? t.followers.filter(x => x !== p.id) : [...t.followers, p.id];
            break;
        }
        case 'createSubtask': {
            const t = taskAccess(c, d.id, true);
            const title = textInput(d.title, 300).trim();
            if (!title)
                fail(400, 'Informe um título.');
            const sub = newTask(s, p.id, { title, boardId: t.boardId, parentId: t.id, projectId: t.projectId, clientId: t.clientId, assignee: p.id });
            s.tasks.push(sub);
            t.history.push(log(p.id, 'Subtarefa criada', 'VM-' + sub.number + ' · ' + title));
            out = { id: sub.id };
            break;
        }
        case 'recurrence': {
            const t = taskAccess(c, d.id, true);
            if (d.frequency === 'none')
                t.recurrence = undefined;
            else
                t.recurrence = { frequency: choices(d.frequency, ['daily', 'weekly', 'monthly30']), nextDue: '' };
            t.history.push(log(p.id, 'Recorrência configurada', d.frequency));
            break;
        }
        case 'transferTask': {
            manager(c);
            const t = taskAccess(c, d.id, true);
            const from = boardAccess(c, t.boardId), to = boardAccess(c, d.boardId);
            const st = to.stages.find(x => x.id === d.stageId && x.kind !== 'delivery');
            if (!st)
                fail(400, 'Selecione uma etapa aberta no quadro de destino.');
            const assignee = s.people.find(x => x.id === t.assignee);
            if (assignee && !canBoard(s, to, assignee)) {
                if (!d.unassign)
                    fail(409, 'O responsável não acessa o quadro de destino. Confirme a remoção da atribuição.');
                t.assignee = '';
            }
            t.boardId = to.id;
            t.stageId = '';
            moveTask(s, t, st!.id, p);
            t.history.push(log(p.id, 'Transferida', from.name + ' → ' + to.name + ' · campos da empresa preservados'));
            break;
        }
        case 'reopen': {
            manager(c);
            const t = taskAccess(c, d.id);
            if (!isDelivered(s, t))
                fail(400, 'A tarefa já está aberta.');
            const reason = textInput(d.reason, 2000).trim();
            if (!reason)
                fail(400, 'A justificativa é obrigatória.');
            const stage = boardAccess(c, t.boardId).stages.find(x => x.id === d.stageId && x.kind !== 'delivery');
            if (!stage)
                fail(400, 'Escolha uma etapa aberta.');
            t.stageId = stage!.id;
            t.deliveredAt = undefined;
            t.deliveredBy = undefined;
            t.revision++;
            t.history.push({ ...log(p.id, 'Reaberta', reason), toStageId: stage!.id });
            break;
        }
        case 'archiveTask':
        case 'restoreTask': {
            const t = taskAccess(c, d.id, true);
            if (s.timers.some(x => x.taskId === t.id))
                fail(409, 'Pare o cronômetro antes de arquivar.');
            t.archived = a === 'archiveTask';
            t.revision++;
            t.history.push(log(p.id, t.archived ? 'Arquivada' : 'Restaurada', ''));
            break;
        }
        case 'duplicateTask': {
            const t = taskAccess(c, d.id);
            const copy = newTask(s, p.id, { title: t.title + ' (cópia)', description: t.description, boardId: t.boardId, typeId: t.typeId, typeSnapshot: t.typeSnapshot, estimate: t.estimate, tags: [...t.tags], projectId: t.projectId, clientId: t.clientId });
            s.tasks.push(copy);
            out = { id: copy.id };
            break;
        }
        case 'bulkMove': {
            if (!Array.isArray(d.ids) || d.ids.length > 100)
                fail(400, 'Seleção inválida.');
            for (const id of d.ids) {
                const t = taskAccess(c, id, true);
                moveTask(s, t, d.stageId, p);
            }
            break;
        }
        case 'timerStart': {
            const t = taskAccess(c, d.id, true);
            if (s.timers.some(x => x.userId === p.id))
                fail(409, 'Você já possui um cronômetro ativo.');
            s.timers.push({ userId: p.id, taskId: t.id, start: now() });
            t.history.push(log(p.id, 'Cronômetro iniciado', ''));
            break;
        }
        case 'timerStop': {
            const timer = s.timers.find(x => x.userId === p.id);
            if (!timer)
                fail(409, 'Nenhum cronômetro ativo.');
            const t = taskAccess(c, timer!.taskId, true);
            const end = now();
            s.time.push({ id: uid(), taskId: t.id, userId: p.id, start: timer!.start, end, seconds: Math.max(1, Math.round((Date.parse(end) - Date.parse(timer!.start)) / 1000)), note: 'Cronômetro' });
            s.timers = s.timers.filter(x => x.userId !== p.id);
            t.history.push(log(p.id, 'Tempo registrado', 'Cronômetro encerrado'));
            break;
        }
        case 'manualTime': {
            const t = taskAccess(c, d.id, true);
            const seconds = numberInput(d.minutes, 1, 1440) * 60;
            const end = new Date(d.end || now());
            if (!Number.isFinite(end.getTime()) || end.getTime() > Date.now() + 1000)
                fail(400, 'Horário inválido ou futuro.');
            const start = new Date(end.getTime() - seconds * 1000).toISOString();
            const endStr = end.toISOString();
            if (s.time.some(x => x.userId === p.id && start < x.end && endStr > x.start) || s.timers.some(x => x.userId === p.id && endStr > x.start))
                fail(409, 'Este registro sobrepõe outro período ou cronômetro ativo.');
            s.time.push({ id: uid(), taskId: t.id, userId: p.id, start, end: endStr, seconds, note: textInput(d.note || '', 1000) });
            t.history.push(log(p.id, 'Tempo registrado', `${d.minutes} minutos`));
            break;
        }
        case 'comment': {
            const t = taskAccess(c, d.id, true);
            const audience = choices(d.audience, ['internal', 'external', 'file']);
            if (audience === 'file' && !t.attachments.some(x => x.id === d.attachmentId))
                fail(400, 'Anexo inválido.');
            const text = textInput(d.text, 10000).trim();
            if (!text)
                fail(400, 'Escreva sua mensagem.');
            t.comments.push({ id: uid(), author: p.id, at: now(), text, audience, attachmentId: audience === 'file' ? d.attachmentId : undefined });
            for (const recipient of s.people.filter(x => x.id !== p.id && (text.includes('@' + x.email) || t.followers.includes(x.id)))) {
                const b = s.boards.find(b => b.id === t.boardId)!;
                if (canBoard(s, b, recipient))
                    s.notifications.push({ id: uid(), userId: recipient.id, text: text.includes('@' + recipient.email) ? 'Você foi mencionado em ' + t.title : 'Nova mensagem em ' + t.title, taskId: t.id, read: false, at: now() });
            }
            break;
        }
        case 'checklist': {
            const t = taskAccess(c, d.id, true);
            if (d.itemId) {
                const item = t.checklist.find(x => x.id === d.itemId);
                if (!item)
                    fail(404, 'Item inexistente.');
                item!.done = !!d.done;
            }
            else
                t.checklist.push({ id: uid(), text: textInput(d.text, 500), done: false });
            t.revision++;
            break;
        }
        case 'dependency': {
            const t = taskAccess(c, d.id, true);
            const dep = taskAccess(c, d.dependencyId);
            if (dep.id === t.id)
                fail(400, 'Uma tarefa não depende de si mesma.');
            const visited = new Set<string>();
            function reaches(id: string): boolean { if (id === t.id)
                return true; if (visited.has(id))
                return false; visited.add(id); return s.tasks.find(x => x.id === id)?.dependencies.some(reaches) || false; }
            if (reaches(dep.id))
                fail(400, 'Esta dependência criaria um ciclo.');
            t.dependencies = d.remove ? t.dependencies.filter(x => x !== dep.id) : Array.from(new Set([...t.dependencies, dep.id]));
            t.revision++;
            break;
        }
        case 'requestApproval': {
            const t = taskAccess(c, d.id, true);
            const f = t.attachments.find(x => x.id === d.attachmentId);
            if (!f)
                fail(400, 'Selecione a versão de um arquivo.');
            const approver = emailInput(d.approver);
            t.approvals.push({ id: uid(), attachmentId: f!.id, version: f!.version, approver, due: dateInput(d.due || ''), required: !!d.required, status: 'pending', comment: '' });
            t.history.push(log(p.id, 'Aprovação solicitada', `${f!.name} · v${f!.version} · ${approver}`));
            const person = s.people.find(x => x.email.toLowerCase() === approver);
            if (person)
                s.notifications.push({ id: uid(), userId: person.id, text: 'Uma entrega aguarda sua aprovação', taskId: t.id, read: false, at: now() });
            break;
        }
        case 'decideApproval': {
            const t = taskAccess(c, d.id, true);
            const ap = t.approvals.find(x => x.id === d.approvalId);
            if (!ap || ap.status !== 'pending')
                fail(409, 'Aprovação não está pendente.');
            if (ap!.approver.toLowerCase() !== p.email.toLowerCase())
                fail(403, 'Somente o aprovador indicado pode decidir.');
            ap!.status = choices(d.status, ['approved', 'changes']);
            ap!.comment = textInput(d.comment || '', 2000);
            ap!.decidedAt = now();
            ap!.decidedBy = p.email;
            t.history.push(log(p.id, 'Aprovação respondida', ap!.status));
            break;
        }
        case 'share': {
            manager(c);
            const t = taskAccess(c, d.id, true);
            const email = emailInput(d.email);
            const allowed = ['description', 'submission', 'stage', 'desiredDue', 'due', 'fields', 'conversation', 'approvals', ...s.customFields.map(f => 'custom:' + f.id)];
            const fields = (d.fields || []).map((x: any) => choices(x, allowed));
            const attachments = (d.attachments || []).filter((id: string) => t.attachments.some(x => x.id === id));
            const expiresAt = new Date(Date.now() + numberInput(d.days || 7, 1, 90) * 86400000).toISOString();
            const id = uid();
            const token = await link(c, 'share', id, expiresAt);
            s.shares.push({ id, taskId: t.id, email, fields, attachments, futureDeliveries: !!d.futureDeliveries, expiresAt, revoked: false });
            out = { token, url: '/convidado/' + token, delivery: 'E-mail não configurado. Link disponível para entrega manual ao destinatário.' };
            t.history.push(log(p.id, 'Compartilhada', email));
            break;
        }
        case 'revokeShare': {
            manager(c);
            const sh = s.shares.find(x => x.id === d.shareId);
            if (!sh)
                fail(404, 'Compartilhamento inexistente.');
            taskAccess(c, sh!.taskId);
            sh!.revoked = true;
            break;
        }
        case 'createBoard': {
            manager(c);
            const name = textInput(d.name, 100).trim();
            if (!name)
                fail(400, 'Nome obrigatório.');
            const b: Board = { id: uid(), name, description: textInput(d.description || '', 2000), color: '#e47251', access: d.access === 'all' ? 'all' : 'selected', teams: (d.teams || []).filter((id: string) => s.teams.some(t => t.id === id)), users: Array.from(new Set([p.id, ...(d.users || []).filter((id: string) => s.people.some(t => t.id === id))])), stages: ['Entrada', 'Fazendo', 'Em aprovação', 'Entregue'].map((name, i) => ({ id: uid(), name, kind: i === 0 ? 'entry' : i === 3 ? 'delivery' : 'work', limit: 0 })), archived: false, fieldOrder: ['description', 'assignee', 'due', 'estimate', 'type'] };
            s.boards.push(b);
            out = { id: b.id };
            break;
        }
        case 'updateBoard': {
            manager(c);
            const b = boardAccess(c, d.id);
            if (d.name !== undefined)
                b.name = textInput(d.name, 100);
            if (d.access)
                b.access = choices(d.access, ['all', 'selected']);
            if (d.teams)
                b.teams = d.teams.filter((id: string) => s.teams.some(t => t.id === id));
            if (d.users)
                b.users = d.users.filter((id: string) => s.people.some(t => t.id === id));
            if (d.archived !== undefined)
                b.archived = !!d.archived;
            if (d.fieldOrder) {
                const allowed = ['description', 'assignee', 'due', 'estimate', 'type'];
                if (d.fieldOrder.length !== 5 || new Set(d.fieldOrder).size !== 5 || !d.fieldOrder.every((x: string) => allowed.includes(x)))
                    fail(400, 'Ordem de campos inválida.');
                b.fieldOrder = d.fieldOrder;
            }
            break;
        }
        case 'duplicateBoard': {
            manager(c);
            const b = boardAccess(c, d.id);
            const copy = structuredClone(b);
            copy.id = uid();
            copy.name += ' (cópia)';
            copy.stages = copy.stages.map(x => ({ ...x, id: uid() }));
            s.boards.push(copy);
            out = { id: copy.id };
            break;
        }
        case 'saveStages': {
            manager(c);
            const b = boardAccess(c, d.id);
            if (!Array.isArray(d.stages) || d.stages.length < 2 || d.stages.length > 20)
                fail(400, 'Configure entre 2 e 20 etapas.');
            const stages = d.stages.map((x: any) => ({ id: b.stages.some(y => y.id === x.id) ? x.id : uid(), name: textInput(x.name, 80), kind: choices(x.kind, ['entry', 'work', 'delivery']), limit: numberInput(x.limit, 0, 1000) }));
            if (!stages.some((x: any) => x.kind === 'delivery') || !stages.some((x: any) => x.kind !== 'delivery'))
                fail(400, 'Mantenha ao menos uma etapa aberta e uma de entrega.');
            for (const old of b.stages) {
                if (!stages.some((x: any) => x.id === old.id) && s.tasks.some(t => t.boardId === b.id && t.stageId === old.id)) {
                    const dest = stages.find((x: any) => x.id === d.destination && x.kind !== 'delivery');
                    if (!dest)
                        fail(400, 'Escolha uma etapa aberta de destino para preservar as tarefas.');
                    for (const t of s.tasks.filter(t => t.boardId === b.id && t.stageId === old.id)) {
                        if (isDelivered(s, t))
                            fail(409, 'Reabra tarefas entregues antes de excluir a etapa.');
                        t.stageId = dest.id;
                        t.history.push(log(p.id, 'Etapa removida', 'Transferida para ' + dest.name));
                    }
                }
            }
            for (const st of stages) {
                const old = b.stages.find(x => x.id === st.id);
                if (old && old.kind !== st.kind && s.tasks.some(t => t.boardId === b.id && t.stageId === old.id))
                    fail(409, 'Mova as tarefas antes de alterar a classificação da etapa.');
            }
            b.stages = [...stages.filter((x: any) => x.kind !== 'delivery'), ...stages.filter((x: any) => x.kind === 'delivery')];
            break;
        }
        case 'saveType': {
            manager(c);
            const ty = { id: d.id || uid(), name: textInput(d.name, 100), color: /^#[0-9a-f]{6}$/i.test(d.color) ? d.color : '#e47251', description: textInput(d.description || '', 2000), estimate: numberInput(d.estimate), active: d.active !== false };
            const i = s.types.findIndex(x => x.id === ty.id);
            if (i < 0)
                s.types.push(ty);
            else
                s.types[i] = ty;
            break;
        }
        case 'saveProject': {
            manager(c);
            if (d.clientId && !s.clients.some(x => x.id === d.clientId))
                fail(400, 'Cliente inválido.');
            s.projects.push({ id: uid(), name: textInput(d.name, 200), description: textInput(d.description || '', 5000), clientId: d.clientId || '', manager: p.id, status: 'Em andamento', start: dateInput(d.start || ''), end: dateInput(d.end || ''), budgetCents: p.role === 'admin' ? Math.round(numberInput(d.budget || 0) * 100) : 0 });
            break;
        }
        case 'saveClient': {
            manager(c);
            s.clients.push({ id: uid(), name: textInput(d.name, 200), email: d.email ? emailInput(d.email) : '', contact: textInput(d.contact || '', 500) });
            break;
        }
        case 'saveTeam': {
            admin(c);
            s.teams.push({ id: uid(), name: textInput(d.name, 100) });
            break;
        }
        case 'updatePerson': {
            admin(c);
            const person = s.people.find(x => x.id === d.id);
            if (!person)
                fail(404, 'Pessoa inexistente.');
            if (d.role !== undefined || d.active !== undefined) {
                const role = d.role !== undefined ? choices(d.role, ['admin', 'manager', 'member']) : person!.role;
                if(person!.email.toLowerCase()===adminEmail()&&(d.active===false||(d.role!==undefined&&d.role!=='admin')))fail(409,'O administrador principal deve permanecer ativo com perfil de administrador.');
                const active = d.active !== undefined ? !!d.active : person!.active !== false;
                if (person!.role === 'admin' && (role !== 'admin' || !active) && !s.people.some(x => x.id !== person!.id && x.role === 'admin' && x.active !== false))
                    fail(409, 'Mantenha ao menos um administrador ativo.');
                person!.role = role;
                person!.active = active;
            }
            if (d.teams)
                person!.teams = d.teams.filter((id: string) => s.teams.some(t => t.id === id));
            if (d.hours !== undefined)
                person!.hours = numberInput(d.hours, 0, 168);
            if (d.hourlyCents !== undefined)
                person!.hourlyCents = Math.round(numberInput(d.hourlyCents));
            if (d.absences)
                person!.absences = d.absences.map(dateInput);
            break;
        }
        case 'settings': {
            admin(c);
            if (d.name)
                s.org.name = textInput(d.name, 200);
            if (d.timezone) {
                try {
                    new Intl.DateTimeFormat('pt-BR', { timeZone: d.timezone }).format();
                }
                catch {
                    fail(400, 'Fuso horário inválido.');
                }
                s.org.timezone = d.timezone;
            }
            if (d.workdays) {
                if (!Array.isArray(d.workdays) || !d.workdays.length || !d.workdays.every((n: any) => Number.isInteger(n) && n >= 0 && n <= 6))
                    fail(400, 'Dias úteis inválidos.');
                s.org.workdays = Array.from(new Set(d.workdays));
            }
            if (d.holidays)
                s.org.holidays = d.holidays.map(dateInput);
            if (d.hours !== undefined)
                s.org.hours = numberInput(d.hours, 1, 24);
            if (d.onboarding !== undefined)
                s.org.onboarding = numberInput(d.onboarding, 0, 6);
            if (d.help !== undefined)
                s.org.help = !!d.help;
            break;
        }
        case 'saveForm': {
            manager(c);
            const existing = s.forms.find(x => x.id === d.id);
            const b = boardAccess(c, d.boardId);
            const stage = b.stages.find(x => x.id === d.stageId && x.kind !== 'delivery');
            if (!stage)
                fail(400, 'Escolha uma etapa aberta de entrada.');
            if (!s.types.some(x => x.id === d.typeId && x.active))
                fail(400, 'Tipo de tarefa inválido.');
            if (!Array.isArray(d.questions) || !d.questions.length || d.questions.length > 30)
                fail(400, 'Inclua de 1 a 30 perguntas.');
            const questions = d.questions.map((q: any) => ({ id: q.id || uid(), label: textInput(q.label, 300), instruction: textInput(q.instruction || '', 1000), type: choices(q.type, ['text', 'textarea', 'number', 'date', 'select', 'multiselect', 'checkbox', 'email', 'file']), required: !!q.required, target: textInput(q.target || '', 100), options: textInput(q.options || '', 1000) }));
            if (new Set(questions.map((q: any) => q.id)).size !== questions.length || questions.some((q: any) => !/^[-a-zA-Z0-9_]{1,80}$/.test(q.id)))
                fail(400, 'Use IDs únicos com letras, números, hífen ou sublinhado.');
            const destinations = ['', 'description', 'desiredDue', 'email', 'attachment', ...s.customFields.map(x => x.id)];
            if (questions.some((q: any) => !destinations.includes(q.target)))
                fail(400, 'Campo de destino inválido.');
            const form: FormDef = { id: existing?.id || uid(), name: textInput(d.name, 200), boardId: b.id, stageId: stage!.id, typeId: d.typeId, tags: (d.tags || []).map((x: any) => textInput(x, 60)), assignee: s.people.some(x => x.id === d.assignee) ? d.assignee : '', titleTemplate: textInput(d.titleTemplate || '', 500), fallback: textInput(d.fallback || 'Nova solicitação', 300), published: existing?.published || false, token: existing?.token, version: (existing?.version || 0) + 1, confirmation: textInput(d.confirmation || 'Recebemos sua solicitação.', 1000), useDesiredDue: !!d.useDesiredDue, questions };
            const i = s.forms.findIndex(x => x.id === form.id);
            if (i < 0)
                s.forms.push(form);
            else
                s.forms[i] = form;
            out = { id: form.id };
            break;
        }
        case 'publishForm': {
            manager(c);
            const f = s.forms.find(f => f.id === d.id);
            if (!f)
                fail(404, 'Formulário inexistente.');
            boardAccess(c, f!.boardId);
            f!.published = !!d.published;
            if (f!.published && !f!.token)
                f!.token = await link(c, 'form', f!.id, new Date(Date.now() + 365 * 86400000).toISOString());
            out = { token: f!.token };
            break;
        }
        case 'saveRule': {
            manager(c);
            const b = boardAccess(c, d.boardId);
            if (!b.stages.some(x => x.id === d.stageId && x.kind !== 'delivery'))
                fail(400, 'Etapa inválida.');
            const rule = { id: d.id || uid(), name: textInput(d.name, 200), boardId: b.id, stageId: d.stageId, days: numberInput(d.days, 1, 365), business: !!d.business, cutoff: '18:00', existing: choices(d.existing || 'preserve', ['preserve', 'replace']), reentry: choices(d.reentry || 'preserve', ['preserve', 'reapply']), active: d.active !== false };
            const i = s.rules.findIndex(x => x.id === rule.id);
            if (i < 0)
                s.rules.push(rule);
            else
                s.rules[i] = rule;
            break;
        }
        case 'toggleRule': {
            manager(c);
            const r = s.rules.find(x => x.id === d.id);
            if (!r)
                fail(404, 'Regra inexistente.');
            boardAccess(c, r!.boardId);
            r!.active = !r!.active;
            break;
        }
        case 'saveView': {
            boardAccess(c, d.boardId);
            s.views.push({ id: uid(), userId: p.id, name: textInput(d.name, 100), boardId: d.boardId, query: textInput(d.query || '', 500), priority: d.priority || '', sort: choices(d.sort || 'due', ['due', 'priority', 'title']) });
            break;
        }
        case 'dashboard': {
            s.dashboards[p.id] = (d.cards || []).map((x: any) => choices(x, ['open', 'late', 'hours', 'approved', 'external', 'done']));
            break;
        }
        case 'readNotification': {
            for (const n of s.notifications.filter(n => n.userId === p.id && (!d.id || n.id === d.id)))
                n.read = true;
            break;
        }
        case 'customField': {
            manager(c);
            const type = choices(d.type, ['text', 'number', 'date', 'select', 'multiselect', 'boolean', 'currency', 'rating', 'nps']);
            s.customFields.push({ id: uid(), name: textInput(d.name, 100), type, options: textInput(d.options || '', 1000), min: type === 'nps' ? 0 : numberInput(d.min || 0, -100000), max: type === 'nps' ? 10 : numberInput(d.max || 10, -100000) });
            break;
        }
        case 'invite': {
            admin(c);
            const email = emailInput(d.email), id = uid(), token = uid() + uid();
            const invite = { id, email, role: choices(d.role || 'member', ['admin', 'manager', 'member']), teams: (d.teams || []).filter((x: string) => s.teams.some(t => t.id === x)), expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(), hash: await hash(token), used: false };
            s.invites.push(invite);
            out = { token, orgId: c.orgId, email, delivery: 'Envio de e-mail não configurado. Convite disponível para cópia manual.' };
            break;
        }
        case 'createWebhook': {
            admin(c);
            const url = validWebhookUrl(textInput(d.url, 2000)).toString(), id = uid(), secret = uid() + uid();
            s.webhooks ??= [];
            const events = (d.events || ['createTask', 'move']).map((x: any) => choices(x, ['createTask', 'updateTask', 'move', 'reopen', 'comment', 'requestApproval', 'decideApproval']));
            await database().prepare('INSERT INTO webhook_secrets (id,org_id,secret) VALUES (?,?,?)').bind(id, c.orgId, secret).run();
            s.webhooks.push({ id, name: textInput(d.name, 100), url, events, active: false });
            out = { secret };
            break;
        }
        case 'toggleWebhook': {
            admin(c);
            const hook = s.webhooks?.find(x => x.id === d.id);
            if (!hook)
                fail(404, 'Webhook não encontrado.');
            if (!hook!.active)
                allowedWebhookUrl(hook!.url);
            hook!.active = !hook!.active;
            break;
        }
        case 'retryWebhooks': {
            admin(c);
            break;
        }
        case 'createApiToken': {
            admin(c);
            const id = uid(), expiresAt = new Date(Date.now() + numberInput(d.days || 30, 1, 90) * 86400000).toISOString();
            const token = await link(c, 'api', id, expiresAt);
            s.apiTokens ??= [];
            s.apiTokens.push({ id, userId: p.id, name: textInput(d.name, 100), scope: choices(d.scope || 'read', ['read', 'write']), expiresAt, revoked: false });
            out = { token };
            break;
        }
        case 'revokeApiToken': {
            admin(c);
            const token = s.apiTokens?.find(x => x.id === d.id);
            if (!token)
                fail(404, 'Token não encontrado.');
            token!.revoked = true;
            break;
        }
        case 'saveAgent': {
            admin(c);
            s.agents.push({ id: uid(), name: textInput(d.name, 100), purpose: textInput(d.purpose || '', 1000), instructions: textInput(d.instructions || '', 10000), provider: textInput(d.provider || 'OpenAI', 100), model: textInput(d.model || '', 100) });
            break;
        }
        case 'runAgent': fail(503, 'IA não configurada. Configure um provedor e credenciais no servidor antes de executar.');
        default: fail(400, 'Ação desconhecida.');
    }
    audit(c, a, d.id || d.name || '');
    return out;
}
