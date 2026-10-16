import { context, readJson, sameOrigin, save, visible, errorResponse, fail, limit } from '@/lib/server';
import { action } from '@/lib/actions';
export async function POST(req: Request) { try {
    sameOrigin(req);
    const body = await readJson(req);
    const c = await context(body.orgId);
    await limit('action:' + c.p.id, 120);
    if (body.revision !== c.revision)
        fail(409, 'Os dados foram alterados. Atualize antes de salvar; seu texto será preservado.');
    const result = await action(c, body.action, body.data || {});
    await save(c, { name: body.action, taskId: body.data?.id || result.id || '' });
    return Response.json({ ...visible(c), result }, { headers: { 'X-Vamo-Process-Webhooks': '1' } });
}
catch (e) {
    return errorResponse(e);
} }
