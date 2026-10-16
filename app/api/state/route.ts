import { context, visible, errorResponse } from '@/lib/server';
export async function GET(req: Request) { try {
    return Response.json(visible(await context(new URL(req.url).searchParams.get('org') || undefined)), { headers: { 'Cache-Control': 'no-store' } });
}
catch (e) {
    return errorResponse(e);
} }
