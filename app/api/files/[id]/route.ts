import { context, taskAccess, bucket, errorResponse, fail, publicContext } from '@/lib/server';
export async function GET(req: Request, { params }: {
    params: Promise<{
        id: string;
    }>;
}) { try {
    const { id } = await params;
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    let att: any;
    if (token) {
        const { c, r } = await publicContext(token, 'share');
        const sh = c.s.shares.find(x => x.id === r.resource_id && !x.revoked && x.expiresAt > new Date().toISOString());
        if (!sh || !sh.attachments.includes(id))
            fail(404, 'Arquivo não compartilhado.');
        att = c.s.tasks.find(t => t.id === sh!.taskId)?.attachments.find(x => x.id === id);
    }
    else {
        const c = await context(url.searchParams.get('org') || undefined);
        const t = c.s.tasks.find(t => t.attachments.some(x => x.id === id));
        if (!t)
            fail(404, 'Arquivo não encontrado.');
        taskAccess(c, t!.id);
        att = t!.attachments.find(x => x.id === id);
    }
    if (!att)
        fail(404, 'Arquivo não encontrado.');
    const object = await bucket().get(att.key);
    if (!object)
        fail(404, 'Arquivo indisponível.');
    return new Response(object!.body, { headers: { 'Content-Type': att.mime, 'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(att.name)}`, 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'; sandbox" } });
}
catch (e) {
    return errorResponse(e);
} }
