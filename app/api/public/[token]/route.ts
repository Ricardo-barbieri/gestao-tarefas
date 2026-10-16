import { publicContext, save, errorResponse, fail, readJson, limit, emailInput, textInput, dateInput, numberInput, bucket, sameOrigin } from '@/lib/server';
import { uid, now, log, newTask, isDelivered } from '@/lib/model';
import { uploadFile } from '@/lib/files';
export async function GET(req: Request, { params }: {
    params: Promise<{
        token: string;
    }>;
}) { try {
    const { token } = await params;
    const { c, r } = await publicContext(token);
    if (r.kind === 'form') {
        const f = c.s.forms.find(x => x.id === r.resource_id && x.published);
        if (!f)
            fail(404, 'Formulário desativado.');
        return Response.json({ kind: 'form', company: c.s.org.name, form: { name: f!.name, questions: f!.questions, confirmation: f!.confirmation, version: f!.version } }, { headers: { 'Cache-Control': 'no-store' } });
    }
    const sh = c.s.shares.find(x => x.id === r.resource_id && !x.revoked && x.expiresAt > now());
    if (!sh)
        fail(404, 'Acesso revogado.');
    const t = c.s.tasks.find(x => x.id === sh!.taskId);
    if (!t)
        fail(404, 'Tarefa indisponível.');
    const b = c.s.boards.find(x => x.id === t!.boardId);
    return Response.json({ kind: 'share', company: c.s.org.name, recipient: sh!.email, expiresAt: sh!.expiresAt, task: { id: t!.id, number: t!.number, title: t!.title, locked: isDelivered(c.s, t!), description: sh!.fields.includes('description') ? t!.description : undefined, submission: sh!.fields.includes('submission') && t!.submission ? { ...t!.submission, answers: Object.fromEntries(Object.entries(t!.submission.answers).filter(([key, value]) => typeof value !== 'object' || !value?.id || sh!.attachments.includes(value.id))) } : undefined, stage: sh!.fields.includes('stage') ? b?.stages.find(x => x.id === t!.stageId)?.name : undefined, due: sh!.fields.includes('due') ? t!.due : undefined, desiredDue: sh!.fields.includes('desiredDue') ? t!.desiredDue : undefined, fields: Object.fromEntries(c.s.customFields.filter(f => sh!.fields.includes('custom:' + f.id)).map(f => [f.name, t!.fields[f.id] ?? ''])), attachments: t!.attachments.filter(x => sh!.attachments.includes(x.id)).map(({ key, ...x }) => x), comments: t!.comments.filter(x => (sh!.fields.includes('conversation') && x.audience === 'external') || (x.audience === 'file' && sh!.attachments.includes(x.attachmentId || ''))), approvals: sh!.fields.includes('approvals') ? t!.approvals.filter(x => sh!.attachments.includes(x.attachmentId) && x.approver === sh!.email) : [], canComment: sh!.fields.includes('conversation') } }, { headers: { 'Cache-Control': 'no-store' } });
}
catch (e) {
    return errorResponse(e);
} }
export async function POST(req: Request, { params }: {
    params: Promise<{
        token: string;
    }>;
}) {
    const keys: string[] = [];
    try {
        sameOrigin(req);
        const { token } = await params;
        const { c, r } = await publicContext(token);
        await limit('public:' + token, 20);
        if (r.kind === 'form') {
            if (Number(req.headers.get('content-length') || 0) > 11 * 1024 * 1024)
                fail(413, 'Envio muito grande.');
            const formdata = await req.formData();
            const f = c.s.forms.find(x => x.id === r.resource_id && x.published);
            if (!f)
                fail(404, 'Formulário desativado.');
            if (formdata.get('website'))
                fail(400, 'Solicitação recusada.');
            if (Number(formdata.get('version')) !== f!.version)
                fail(409, 'O formulário foi atualizado. Recarregue antes de enviar.');
            const receipt = textInput(formdata.get('receipt'), 100);
            if (!receipt || receipt.length < 16)
                fail(400, 'Identificador de envio inválido.');
            const existing = c.s.receipts.find(x => x.key === token + receipt);
            if (existing)
                return Response.json({ ok: true, message: f!.confirmation, taskId: existing.taskId });
            const answers: Record<string, any> = {};
            const attachments: any[] = [];
            for (const q of f!.questions) {
                const value = formdata.get(q.id);
                if (q.required && (!value || (value instanceof File && value.size === 0)))
                    fail(400, 'Preencha: ' + q.label);
                if (q.type === 'file') {
                    if (value instanceof File && value.size) {
                        const att = await uploadFile(value, 'solicitante', 'request');
                        keys.push(att.key);
                        attachments.push(att);
                        answers[q.id] = { name: att.name, id: att.id };
                    }
                    continue;
                }
                let v = String(value || '');
                if (q.required && !v.trim())
                    fail(400, 'Preencha: ' + q.label);
                if (v) {
                    if (q.type === 'email')
                        v = emailInput(v);
                    if (q.type === 'date')
                        dateInput(v);
                    if (q.type === 'number')
                        numberInput(v, -1000000, 1000000);
                    if (q.type === 'select' && !q.options.split(',').map(x => x.trim()).includes(v))
                        fail(400, 'Opção inválida.');
                }
                if (q.type === 'multiselect') {
                    const vals = formdata.getAll(q.id).map(v => String(v));
                    if (vals.some(v => !q.options.split(',').map(x => x.trim()).includes(v)))
                        fail(400, 'Opção inválida.');
                    answers[q.id] = vals;
                }
                else
                    answers[q.id] = textInput(v, 20000);
            }
            const fields: Record<string, any> = {};
            let description = '', desiredDue = '';
            for (const q of f!.questions) {
                if (q.target === 'description')
                    description = String(answers[q.id] || '');
                else if (q.target === 'desiredDue')
                    desiredDue = String(answers[q.id] || '');
                else if (q.target && q.type !== 'file') {
                    const def = c.s.customFields.find(f => f.id === q.target);
                    const val = answers[q.id];
                    if (def && ['rating', 'nps', 'number', 'currency'].includes(def.type) && val !== '')
                        fields[q.target] = numberInput(val, def.min, def.max);
                    else
                        fields[q.target] = val;
                }
            }
            let missing = false;
            const generated = f!.titleTemplate.replace(/\{([^}]+)\}/g, (_, id) => { const value = answers[id]; if (typeof value !== 'string' || !value.trim()) {
                missing = true;
                return '';
            } return value.slice(0, 100); }).trim();
            const title = (missing || !generated ? f!.fallback : generated).slice(0, 300);
            const t = newTask(c.s, 'solicitante', { title, description, boardId: f!.boardId, stageId: f!.stageId, typeId: f!.typeId, typeSnapshot: c.s.types.find(x => x.id === f!.typeId)?.name || '', estimate: c.s.types.find(x => x.id === f!.typeId)?.estimate || 0, assignee: f!.assignee, tags: [...f!.tags], fields, desiredDue, due: f!.useDesiredDue ? desiredDue : '', attachments, submission: { questions: f!.questions.map(q => ({ id: q.id, label: q.label, type: q.type })), at: now(), version: f!.version, formId: f!.id, answers } });
            c.s.tasks.push(t);
            c.s.receipts.push({ key: token + receipt, taskId: t.id });
            if (t.assignee)
                c.s.notifications.push({ id: uid(), userId: t.assignee, text: 'Nova solicitação: ' + t.title, taskId: t.id, read: false, at: now() });
            await save(c);
            return Response.json({ ok: true, message: f!.confirmation, taskId: t.id });
        }
        const sh = c.s.shares.find(x => x.id === r.resource_id && !x.revoked && x.expiresAt > now());
        if (!sh)
            fail(404, 'Acesso revogado.');
        const t = c.s.tasks.find(x => x.id === sh!.taskId);
        if (!t)
            fail(404, 'Tarefa indisponível.');
        if (isDelivered(c.s, t!))
            fail(409, 'A tarefa foi entregue. A consulta e o histórico continuam disponíveis.');
        if (req.headers.get('content-type')?.includes('multipart/form-data')) {
            if (!sh!.fields.includes('conversation'))
                fail(403, 'Envio de arquivo não habilitado.');
            if (Number(req.headers.get('content-length') || 0) > 11 * 1024 * 1024)
                fail(413, 'Arquivo muito grande.');
            const fd = await req.formData();
            const file = fd.get('file');
            if (!(file instanceof File))
                fail(400, 'Selecione um arquivo.');
            const att = await uploadFile(file as File, sh!.email, 'request', 'Convidado');
            keys.push(att.key);
            t!.attachments.push(att);
            sh!.attachments.push(att.id);
            t!.history.push(log(sh!.email, 'Arquivo externo enviado', att.name));
            t!.revision++;
            await save(c);
            return Response.json({ ok: true });
        }
        const d = await readJson(req);
        if (d.action === 'comment') {
            if (d.attachmentId) {
                if (!sh!.attachments.includes(d.attachmentId))
                    fail(403, 'Arquivo não compartilhado.');
            }
            else if (!sh!.fields.includes('conversation'))
                fail(403, 'Conversa não habilitada.');
            const text = textInput(d.text, 10000).trim();
            if (!text)
                fail(400, 'Escreva sua mensagem.');
            t!.comments.push({ id: uid(), author: sh!.email, at: now(), text, audience: d.attachmentId ? 'file' : 'external', attachmentId: d.attachmentId || undefined });
        }
        else if (d.action === 'approve') {
            if (!sh!.fields.includes('approvals'))
                fail(403, 'Aprovação não compartilhada.');
            const ap = t!.approvals.find(x => x.id === d.id && x.approver === sh!.email && sh!.attachments.includes(x.attachmentId));
            if (!ap || ap.status !== 'pending')
                fail(409, 'Aprovação indisponível.');
            if (!['approved', 'changes'].includes(d.status))
                fail(400, 'Decisão inválida.');
            ap!.status = d.status;
            ap!.comment = textInput(d.comment || '', 2000);
            ap!.decidedAt = now();
            ap!.decidedBy = sh!.email;
            t!.history.push(log(sh!.email, 'Aprovação externa', ap!.status));
        }
        else
            fail(400, 'Ação não permitida.');
        t!.revision++;
        await save(c);
        return Response.json({ ok: true });
    }
    catch (e) {
        for (const key of keys)
            await bucket().delete(key);
        return errorResponse(e);
    }
}
