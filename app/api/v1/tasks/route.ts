import { apiContext, visible, readJson, errorResponse, fail, save } from '@/lib/server';
import { action } from '@/lib/actions';
export async function GET(req: Request) { try {
    const c = await apiContext(req);
    const q = new URL(req.url).searchParams;
    const page = Number(q.get('page') || 1), pageSize = Number(q.get('pageSize') || 25);
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100)
        fail(400, 'Paginação inválida. page >= 1 e pageSize entre 1 e 100.');
    const tasks = visible(c).state.tasks.filter(t => (!q.get('boardId') || t.boardId === q.get('boardId')) && (!q.get('q') || t.title.toLowerCase().includes(q.get('q')!.toLowerCase()))).sort((a, b) => a.number - b.number);
    return Response.json({ data: tasks.slice((page - 1) * pageSize, page * pageSize), page, pageSize, total: tasks.length, revision: c.revision }, { headers: { 'ETag': '"' + c.revision + '"', 'Cache-Control': 'no-store' } });
}
catch (e) {
    return errorResponse(e);
} }
export async function POST(req: Request) { try {
    const c = await apiContext(req, true);
    const match = req.headers.get('if-match');
    if (!match)
        fail(428, 'Envie If-Match com a revisão retornada na leitura.');
    if (Number(match!.replace(/"/g, '')) !== c.revision)
        fail(409, 'Revisão desatualizada. Leia os dados e tente novamente.');
    const d = await readJson(req);
    if (!['createTask', 'updateTask', 'move', 'archiveTask', 'restoreTask', 'comment', 'manualTime'].includes(d.action))
        fail(403, 'Ação fora do escopo da API de tarefas.');
    const result = await action(c, d.action, d.data || {});
    await save(c, { name: d.action, taskId: d.data?.id || result.id || '' });
    return Response.json({ result, revision: c.revision }, { headers: { 'ETag': '"' + c.revision + '"', 'X-Vamo-Process-Webhooks': '1' } });
}
catch (e) {
    return errorResponse(e);
} }
