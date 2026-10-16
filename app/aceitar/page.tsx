'use client';
import { useEffect, useState } from 'react';
export default function Accept() { const [message, setMessage] = useState('Entre na sua conta para aceitar o convite.'), [busy, setBusy] = useState(false); return <main className="public-shell"><div className="public-brand"><span className="logo-symbol">v</span>vamo.</div><section className="public-card"><h1>Vamos trabalhar juntos</h1><p>{message}</p><div className="button-row spaced"><a className="secondary" href={'/signin-with-chatgpt?return_to=' + encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/aceitar')} target="_top">Entrar com ChatGPT</a><button className="primary" disabled={busy} onClick={async () => { setBusy(true); try {
    const q = new URLSearchParams(location.search);
    const r = await fetch('/api/invite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orgId: q.get('org'), token: q.get('token') }) });
    const d: any = await r.json();
    if (!r.ok)
        throw Error(d.error);
    location.href = '/?org=' + d.orgId;
}
catch (e: any) {
    setMessage(e.message);
}
finally {
    setBusy(false);
} }}>Aceitar convite</button></div></section></main>; }
