import { env } from 'cloudflare:workers';
import type { State } from './model';
export function validWebhookUrl(value: string) { let u: URL; try {
    u = new URL(value);
}
catch {
    throw Error('URL inválida.');
} if (u!.protocol !== 'https:' || u!.username || u!.password || (u!.port && u!.port !== '443') || !/^([a-z0-9-]+\.)+[a-z]{2,63}$/i.test(u!.hostname) || /\.(local|internal|localhost|test|invalid|example)$/i.test(u!.hostname))
    throw Error('Use HTTPS em um domínio público, sem credenciais e na porta 443.'); return u!; }
export function allowedWebhookUrl(value: string) { const u = validWebhookUrl(value); const allowed = String((env as any).WEBHOOK_ALLOWED_HOSTS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean); if (!allowed.includes(u.hostname.toLowerCase()))
    throw Error('Destino não autorizado no servidor. Configure WEBHOOK_ALLOWED_HOSTS com o domínio exato.'); return u; }
function isPublicAddress(ip: string) { if (ip.includes(':'))
    return /^[23][0-9a-f]{3}:/i.test(ip) && !/^2001:db8:/i.test(ip); const parts = ip.split('.').map(Number); if (parts.length !== 4 || parts.some(n => !Number.isInteger(n) || n < 0 || n > 255))
    return false; const [a, b] = parts; return !(a === 0 || a === 10 || a === 127 || a >= 224 || a === 169 && b === 254 || a === 172 && b >= 16 && b <= 31 || a === 192 && (b === 168 || b === 0) || a === 100 && b >= 64 && b <= 127 || a === 198 && (b === 18 || b === 19 || b === 51) || a === 203 && b === 0); }
async function publicDNS(host: string) { for (const type of ['A', 'AAAA']) {
    const r = await fetch('https://cloudflare-dns.com/dns-query?name=' + encodeURIComponent(host) + '&type=' + type, { headers: { Accept: 'application/dns-json' }, signal: AbortSignal.timeout(5000) });
    if (!r.ok)
        throw Error('Não foi possível validar DNS do destino.');
    const d: any = await r.json();
    if (d.Status !== 0)
        throw Error('DNS do destino indisponível.');
    const ips = (d.Answer || []).filter((a: any) => a.type === 1 || a.type === 28).map((a: any) => a.data);
    if (ips.some((ip: string) => !isPublicAddress(ip)))
        throw Error('Destino de rede privado ou reservado.');
    if (type === 'A' && !ips.length)
        throw Error('Destino sem endereço IPv4 público.');
} }
async function signature(secret: string, value: string) { const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']); return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value)))).map(b => b.toString(16).padStart(2, '0')).join(''); }
export async function processWebhooks(db: D1Database) { const now = new Date().toISOString(); const rows = await db.prepare("SELECT id FROM webhook_deliveries WHERE status IN ('pending','retry','sending') AND next_at<=? ORDER BY next_at LIMIT 10").bind(now).all<{
    id: string;
}>(); for (const row of rows.results) {
    const lease = new Date(Date.now() + 60000).toISOString();
    const delivery: any = await db.prepare("UPDATE webhook_deliveries SET status='sending',next_at=? WHERE id=? AND status IN ('pending','retry','sending') AND next_at<=? RETURNING *").bind(lease, row.id, now).first();
    if (!delivery)
        continue;
    let error = '', code = null;
    try {
        const org: any = await db.prepare('SELECT state FROM organizations WHERE id=?').bind(delivery.org_id).first();
        if (!org)
            throw Error('Empresa indisponível.');
        const state: State = JSON.parse(org.state);
        const hook = state.webhooks?.find(h => h.id === delivery.webhook_id && h.active);
        if (!hook)
            throw Error('Webhook desativado.');
        const url = allowedWebhookUrl(hook.url);
        await publicDNS(url.hostname);
        const secret: any = await db.prepare('SELECT secret FROM webhook_secrets WHERE id=? AND org_id=?').bind(hook.id, delivery.org_id).first();
        if (!secret)
            throw Error('Chave de assinatura indisponível.');
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const sig = await signature(secret.secret, timestamp + '.' + delivery.payload);
        const response = await fetch(url.toString(), { method: 'POST', redirect: 'manual', headers: { 'Content-Type': 'application/json', 'X-Vamo-Event-Id': delivery.event_id, 'X-Vamo-Timestamp': timestamp, 'X-Vamo-Signature': 'sha256=' + sig }, body: delivery.payload, signal: AbortSignal.timeout(10000) });
        code = response.status;
        if (response.body)
            await response.body.cancel();
        if (!response.ok)
            throw Error('Resposta HTTP ' + response.status);
    }
    catch (e: any) {
        error = String(e.message || 'Falha de envio').slice(0, 500);
    }
    const attempts = delivery.attempts + 1;
    const status = error ? (attempts >= 5 ? 'failed' : 'retry') : 'delivered';
    const nextAt = new Date(Date.now() + Math.min(3600, 2 ** attempts * 30) * 1000).toISOString();
    await db.prepare('UPDATE webhook_deliveries SET status=?,attempts=?,next_at=?,last_error=?,response_code=? WHERE id=?').bind(status, attempts, nextAt, error, code, delivery.id).run();
} }
