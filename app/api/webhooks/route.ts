import { context, admin, database, errorResponse } from '@/lib/server';
export async function GET(req: Request) { try {
    const c = await context(new URL(req.url).searchParams.get('org') || undefined);
    admin(c);
    const r = await database().prepare('SELECT id,webhook_id,event_id,status,attempts,next_at,last_error,response_code,created_at FROM webhook_deliveries WHERE org_id=? ORDER BY created_at DESC LIMIT 100').bind(c.orgId).all();
    return Response.json({ deliveries: r.results }, { headers: { 'Cache-Control': 'no-store' } });
}
catch (e) {
    return errorResponse(e);
} }
