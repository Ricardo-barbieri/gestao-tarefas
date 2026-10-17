import assert from 'node:assert/strict';
const base=process.env.TEST_URL||'http://127.0.0.1:8787';
if(!['127.0.0.1','localhost'].includes(new URL(base).hostname))throw Error('Somente ambiente fictício local.');
let checks=0;const ip='qa-account-'+crypto.randomUUID();
async function call(path,body,cookie=''){const r=await fetch(base+path,{method:body?'POST':'GET',headers:{'cf-connecting-ip':ip,...(body?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{})},body:body?JSON.stringify(body):undefined});const d=await r.json();return {r,d,cookie:r.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ')}}
function ok(value,label){assert.ok(value,label);checks++;console.log('✓ '+label)}
let out=await call('/api/auth/profile',{name:'Visitante'});ok(out.r.status===403,'Visitante não altera cadastro');
out=await call('/api/auth/login',{email:'seedy@sites.test',password:'Senha-local-para-testes-2026!'});assert.equal(out.r.status,200,'Prepare o administrador com test:auth.');const cookie=out.cookie;
const before=(await call('/api/auth/me',null,cookie)).d.account;
out=await call('/api/auth/profile',{name:'Outro usuário',id:'outra-conta'},cookie);ok(out.r.status===400,'ID de outra conta não é aceito no cadastro pessoal');
out=await call('/api/auth/profile',{name:'Tentativa',role:'admin',email:'outro@example.com'},cookie);ok(out.r.status===400,'Cadastro não permite alterar perfil ou e-mail de autorização');
out=await call('/api/auth/profile',{name:'   '},cookie);ok(out.r.status===400,'Nome vazio é recusado');
out=await call('/api/auth/profile',{name:'Nome pessoal de teste'},cookie);ok(out.r.status===200,'Usuário edita o próprio nome');
out=await call('/api/auth/me',null,cookie);ok(out.d.account.name==='Nome pessoal de teste'&&out.d.account.email===before.email,'Nome atualizado mantém o e-mail da conta');
out=await call('/api/state',null,cookie);ok(out.d.state.people.find(p=>p.id===out.d.me).name==='Nome pessoal de teste','Workspace reflete cadastro atualizado');
await call('/api/auth/profile',{name:before.name},cookie);
out=await call('/api/auth/logout',{},cookie);ok(out.r.status===200&&out.r.headers.getSetCookie().some(c=>c.startsWith('vamo_session=;')&&c.includes('Max-Age=0')),'Logout remove cookie e encerra sessão');
out=await call('/api/state',null,cookie);ok(out.r.status===401,'Sessão encerrada não consulta tarefas');
out=await call('/api/auth/profile',{name:'Após sair'},cookie);ok(out.r.status===403,'Sessão encerrada não edita cadastro');
out=await call('/api/auth/login',{email:'seedy@sites.test',password:'Senha-local-para-testes-2026!'});ok(out.r.status===200&&out.cookie!==cookie,'É possível entrar novamente com uma sessão nova');
console.log(`\n${checks} verificações de cadastro e sessão passaram.`);
