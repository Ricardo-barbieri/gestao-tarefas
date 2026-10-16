'use client';
import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck, FileText, Download, Send, Paperclip, Clock } from 'lucide-react';
export default function PublicPortal({ token }: {
    token: string;
}) {
    const [data, setData] = useState<any>(null), [error, setError] = useState(''), [busy, setBusy] = useState(false), [receipt, setReceipt] = useState(''), [success, setSuccess] = useState(''), [text, setText] = useState(''), [fileId, setFileId] = useState(''), [decision, setDecision] = useState<Record<string, string>>({});
    async function load() { const r = await fetch('/api/public/' + token); const d: any = await r.json(); if (!r.ok)
        throw Error(d.error); setData(d); }
    useEffect(() => { setReceipt(crypto.randomUUID()); load().catch(e => setError(e.message)); }, [token]);
    async function guestAction(body: any) { setError(''); setBusy(true); try {
        const r = await fetch('/api/public/' + token, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const d: any = await r.json();
        if (!r.ok)
            throw Error(d.error);
        await load();
        setText('');
    }
    catch (e: any) {
        setError(e.message);
    }
    finally {
        setBusy(false);
    } }
    const task = data?.task;
    return <main className="public-shell"><a className="public-brand" href="/"><span className="logo-symbol">v</span>vamo.</a><section className="public-card">{!data ? <><h1>{error ? 'Não foi possível abrir' : 'Preparando seu espaço…'}</h1>{error && <p className="error">{error}</p>}</> : data.kind === 'form' ? <><p className="eyebrow">{data.company} · SOLICITAÇÕES</p><h1>{data.form.name}</h1><p>Conte o que precisa. Vamos organizar os próximos passos.</p>{success ? <div className="success-state"><CheckCircle2 size={42}/><h2>Solicitação recebida</h2><p>{success}</p><button className="secondary" onClick={() => { setSuccess(''); setReceipt(crypto.randomUUID()); }}>Enviar outra solicitação</button></div> : <form onSubmit={async (e) => { e.preventDefault(); const target = e.currentTarget; setError(''); setBusy(true); try {
        const fd = new FormData(target);
        fd.set('receipt', receipt);
        fd.set('version', data.form.version);
        const r = await fetch('/api/public/' + token, { method: 'POST', body: fd });
        const d: any = await r.json();
        if (!r.ok)
            throw Error(d.error);
        setSuccess(d.message);
        target.reset();
    }
    catch (e: any) {
        setError(e.message);
    }
    finally {
        setBusy(false);
    } }}><label className="honeypot" aria-hidden="true"><span>Website</span><input tabIndex={-1} name="website" autoComplete="off"/></label>{data.form.questions.map((q: any) => <label key={q.id} className={q.type === 'checkbox' ? 'check-label' : ''}><span>{q.label}{q.required ? ' *' : ''}</span>{q.instruction && <small>{q.instruction}</small>}{q.type === 'textarea' ? <textarea name={q.id} required={q.required} maxLength={20000}/> : ['select', 'multiselect'].includes(q.type) ? <select name={q.id} required={q.required} multiple={q.type === 'multiselect'}><option value="">Selecione</option>{q.options.split(',').map((x: string) => <option key={x} value={x.trim()}>{x.trim()}</option>)}</select> : <input name={q.id} type={['email', 'date', 'number', 'file', 'checkbox'].includes(q.type) ? q.type : 'text'} required={q.required} maxLength={q.type === 'text' ? 20000 : undefined} accept={q.type === 'file' ? '.pdf,.png,.jpg,.jpeg,.webp,.txt,.csv' : undefined}/>}</label>)}{error && <p className="error" role="alert">{error}</p>}<button className="primary" disabled={busy}>{busy ? 'Enviando…' : 'Enviar solicitação'}<ArrowRight size={16}/></button><p className="hint"><ShieldCheck size={12}/> Seu envio e a versão deste formulário serão preservados.</p></form>}</> : <><p className="eyebrow">{data.company} · PORTAL DO CONVIDADO</p><div className="info-callout"><ShieldCheck size={18}/><p>Acesso destinado a {data.recipient}. Expira em {new Date(data.expiresAt).toLocaleDateString('pt-BR')}. Este link dá acesso somente ao conteúdo selecionado desta tarefa.</p></div><h1>{task.title}</h1><p>VM-{task.number} {task.stage && '· ' + task.stage}</p>{task.locked && <div className="info-callout"><CheckCircle2 size={19}/><p>Entrega concluída. Consulta e histórico disponíveis; novas interações exigem reabertura pela equipe.</p></div>}{task.description !== undefined && <div className="subsection"><h3>Briefing</h3><p style={{ whiteSpace: 'pre-wrap', fontSize: 12, marginTop: 12 }}>{task.description}</p></div>}{task.submission && <div className="submission"><h3>Solicitação original · v{task.submission.version}</h3>{Object.entries(task.submission.answers).map(([key, value]) => <div key={key}><b>{task.submission.questions?.find((q: any) => q.id === key)?.label || key}</b><p>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</p></div>)}</div>}<div className="field-pair">{task.desiredDue !== undefined && <p className="hint">Prazo desejado<br /><strong>{task.desiredDue || 'Não informado'}</strong></p>}{task.due !== undefined && <p className="hint">Prazo assumido<br /><strong>{task.due || 'A confirmar'}</strong></p>}</div>{Object.keys(task.fields || {}).length > 0 && <div className="subsection"><h3>Informações compartilhadas</h3>{Object.entries(task.fields).map(([name, value]) => <p className="hint" key={name}><b>{name}</b>: {String(value)}</p>)}</div>}{task.attachments.length > 0 && <div className="subsection"><h3>Arquivos compartilhados</h3>{task.attachments.map((a: any) => <div className="attachment-card" key={a.id}><FileText size={22}/><div><a href={'/api/files/' + a.id + '?token=' + encodeURIComponent(token)}>{a.name}<Download size={14}/></a><small>Versão {a.version} · {(a.size / 1024).toFixed(1)} KB · {new Date(a.at).toLocaleDateString('pt-BR')}</small></div></div>)}</div>}{task.approvals.map((a: any) => <section className="approval-card" key={a.id}><div><ShieldCheck size={20}/><span><strong>{task.attachments.find((f: any) => f.id === a.attachmentId)?.name} · v{a.version}</strong><small>{a.status === 'pending' ? 'Aguardando sua decisão' : a.status === 'approved' ? 'Aprovado' : 'Ajustes solicitados'}</small></span></div>{a.status === 'pending' && !task.locked ? <><label><span>Comentário da decisão</span><textarea value={decision[a.id] || ''} onChange={e => setDecision({ ...decision, [a.id]: e.target.value })}/></label><div className="button-row"><button className="primary" disabled={busy} onClick={() => guestAction({ action: 'approve', id: a.id, status: 'approved', comment: decision[a.id] || '' })}><CheckCircle2 size={15}/>Aprovar versão</button><button className="secondary" disabled={busy} onClick={() => guestAction({ action: 'approve', id: a.id, status: 'changes', comment: decision[a.id] || '' })}>Solicitar ajustes</button></div></> : <><p>{a.comment}</p><small>{a.decidedBy} · {a.decidedAt && new Date(a.decidedAt).toLocaleString('pt-BR')}</small></>}</section>)}{(task.canComment || task.attachments.length > 0) && <div className="subsection"><h3>Conversa compartilhada</h3>{task.comments.map((m: any) => <article className="comment" key={m.id}><div><header><strong>{m.author.includes('@') ? m.author : 'Equipe'}</strong><small>{new Date(m.at).toLocaleString('pt-BR')}</small><span className="tag">{m.attachmentId ? 'Arquivo: ' + task.attachments.find((f: any) => f.id === m.attachmentId)?.name : 'Conversa externa'}</span></header><p>{m.text}</p></div></article>)}{!task.locked && <form onSubmit={e => { e.preventDefault(); guestAction({ action: 'comment', text, attachmentId: fileId || undefined }); }}><label><span>Contexto da mensagem</span><select value={fileId} onChange={e => setFileId(e.target.value)}>{task.canComment && <option value="">Conversa da tarefa</option>}{!task.canComment && <option value="">Selecione um arquivo</option>}{task.attachments.map((f: any) => <option key={f.id} value={f.id}>{f.name} · v{f.version}</option>)}</select></label><label><span>Mensagem</span><textarea required value={text} onChange={e => setText(e.target.value)}/></label><button className="primary" disabled={busy || (!task.canComment && !fileId)}>Enviar mensagem<Send size={14}/></button></form>}</div>}{task.canComment && !task.locked && <label><span>Anexar material para a equipe</span><small>PDF, imagem, TXT ou CSV · até 10 MB. Visível para você e para a equipe.</small><input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.csv" disabled={busy} onChange={async (e) => { const file = e.target.files?.[0]; if (!file)
        return; setBusy(true); setError(''); try {
        const fd = new FormData();
        fd.set('file', file);
        const r = await fetch('/api/public/' + token, { method: 'POST', body: fd });
        const d: any = await r.json();
        if (!r.ok)
            throw Error(d.error);
        await load();
    }
    catch (e: any) {
        setError(e.message);
    }
    finally {
        setBusy(false);
    } }}/></label>}{error && <p className="error" role="alert">{error}</p>}</>}</section><p className="public-footer">vamo. · Trabalho com propósito.</p></main>;
}
