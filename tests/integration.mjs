import assert from 'node:assert/strict';
const base=process.env.TEST_URL||'http://127.0.0.1:8787';
const suffix=crypto.randomUUID();const user=process.env.TEST_ADMIN_ID||'local_seedy';const email=process.env.TEST_ADMIN_EMAIL||'seedy@sites.test';
const auth={'oai-authenticated-user-id':user,'oai-authenticated-user-email':email};let snap;
let checks=0;
function ok(cond,message){assert.ok(cond,message);checks++;console.log('✓ '+message)}
async function json(path,options={}){const r=await fetch(base+path,options);return {status:r.status,body:await r.json()}}
async function read(headers=auth,org){return json('/api/state'+(org?'?org='+org:''),{headers})}
async function action(action,data={},expected=200,headers=auth,revision=snap.revision){const r=await json('/api/action',{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({action,data,orgId:snap.orgId,revision})});assert.equal(r.status,expected,JSON.stringify(r.body));if(r.status===200)snap=r.body;return r.body;}
const unauth=await read({});ok(unauth.status===401,'API exige identidade');
snap=(await read()).body;ok(snap.state.tasks.length>=7,'Banco inicializa demonstração persistente');const orgId=snap.orgId;
const other={'oai-authenticated-user-id':'other-'+suffix,'oai-authenticated-user-email':'other@example.com'};
const otherState=await read(other);ok(otherState.status===403&&!otherState.body.state,'Identidade não aprovada não cria empresa nem acessa dados');
ok((await read(other,orgId)).status===403,'Leitura direta da empresa alheia é bloqueada');
await action('createTask',{boardId:'marketing',title:'Ataque entre empresas'},403,other);ok(true,'Escrita em empresa alheia é bloqueada');
await action('publishForm',{id:'briefing',published:true});const token=snap.result.token;
const publicForm=await json('/api/public/'+token);ok(publicForm.status===200&&publicForm.body.form.questions.length===5,'Formulário publicado disponível sem identidade interna');
const receipt=crypto.randomUUID();async function submit(){const fd=new FormData();fd.set('receipt',receipt);fd.set('version','1');fd.set('email','requester@example.com');fd.set('briefing','Arte da campanha de validação');fd.set('impacto','5');fd.set('prazo','2026-11-05');fd.set('arquivo',new File(['%PDF-1.4\nDemonstração de teste\n%%EOF'],'briefing.pdf',{type:'application/pdf'}));return json('/api/public/'+token,{method:'POST',body:fd});}
const submission=await submit();assert.equal(submission.status,200,JSON.stringify(submission.body));const id=submission.body.taskId;const repeat=await submit();ok(repeat.body.taskId===id,'Reenvio idempotente não duplica tarefa');snap=(await read()).body;let task=()=>snap.state.tasks.find(x=>x.id===id);ok(task().typeId==='arte'&&task().estimate===4&&task().tags.includes('Solicitação externa')&&task().fields.impacto===5,'Solicitação cria tarefa com tipo, estimativa, tags e mapeamento');ok(task().submission.version===1&&task().attachments.length===1&&task().due==='','Submissão original e arquivo preservados; prazo desejado separado');
const original=JSON.stringify(task().submission);
await action('move',{id,stageId:'fazendo'});ok(task().due!==''&&snap.state.runs.some(x=>x.taskId===id),'Movimentação executa automação real de dias úteis');
await action('timerStart',{id});const reloaded=(await read()).body;ok(reloaded.state.timers.some(x=>x.taskId===id),'Cronômetro sobrevive a nova leitura do banco');
await action('timerStart',{id:snap.state.tasks[0].id},409);await action('move',{id,stageId:'entregue'},400);ok(true,'Segundo cronômetro e entrega com timer ativo bloqueados');await action('timerStop');
await action('comment',{id,text:'Comentário interno secreto',audience:'internal'});await action('comment',{id,text:'Mensagem externa visível',audience:'external'});
async function upload(previousId){const fd=new FormData();fd.set('orgId',orgId);fd.set('revision',snap.revision);fd.set('taskId',id);fd.set('kind','delivery');if(previousId)fd.set('previousId',previousId);fd.set('file',new File(['%PDF-1.4\nArte de validação\n%%EOF'],'entrega.pdf',{type:'application/pdf'}));const r=await json('/api/upload',{method:'POST',headers:auth,body:fd});assert.equal(r.status,200,JSON.stringify(r.body));snap=r.body;return task().attachments.at(-1)}
const file=await upload();await action('requestApproval',{id,attachmentId:file.id,approver:'requester@example.com',required:true});await action('move',{id,stageId:'entregue'},400);ok(true,'Entrega bloqueada enquanto aprovação obrigatória está pendente');
await action('share',{id,email:'requester@example.com',fields:['description','stage','due','conversation','approvals'],attachments:[file.id],days:7});const guestToken=snap.result.token; const shareId=snap.state.shares.at(-1).id;
let guest=await json('/api/public/'+guestToken);ok(!JSON.stringify(guest.body).includes('Comentário interno secreto')&&!JSON.stringify(guest.body).includes('hourlyCents')&&guest.body.task.attachments.length===1,'Portal externo omite comentários internos, custos e arquivos não selecionados');
const unshared=task().attachments[0];const blocked=await fetch(base+'/api/files/'+unshared.id+'?token='+guestToken);ok(blocked.status===404,'Download externo de arquivo não compartilhado é bloqueado');
const download=await fetch(base+'/api/files/'+file.id+'?token='+guestToken);ok(download.status===200&&(await download.text()).startsWith('%PDF-'),'Arquivo compartilhado baixa do R2 com autorização');
await json('/api/public/'+guestToken,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'comment',text:'Ajuste de cor no arquivo',attachmentId:file.id})});let approval=guest.body.task.approvals[0];const decision=await json('/api/public/'+guestToken,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'approve',id:approval.id,status:'approved',comment:'Versão aprovada'})});ok(decision.status===200,'Convidado identificado aprova versão compartilhada');
snap=(await read()).body;const version2=await upload(file.id);ok(version2.version===2&&task().approvals.some(x=>x.attachmentId===version2.id&&x.status==='pending'),'Nova versão cria aprovação obrigatória pendente');
await action('move',{id,stageId:'entregue'},400);ok(true,'Aprovação antiga não autoriza entrega da nova versão');
await action('share',{id,email:'requester@example.com',fields:['approvals'],attachments:[version2.id],days:7});const token2=snap.result.token;guest=await json('/api/public/'+token2);await json('/api/public/'+token2,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'approve',id:guest.body.task.approvals[0].id,status:'approved',comment:'Nova versão aprovada'})});snap=(await read()).body;
await action('move',{id,stageId:'entregue'});ok(task().deliveredAt&&task().deliveredBy===user,'Entrega registra data e autor');await action('updateTask',{id,fields:{title:'Alteração bloqueada'}},409);ok(true,'Alteração operacional em entregue é rejeitada pelo servidor');
await action('reopen',{id,reason:'Novo ajuste solicitado',stageId:'entrada'});ok(task().history.some(x=>x.event==='Reaberta')&&JSON.stringify(task().submission)===original,'Reabertura preserva histórico e submissão original');
const old=snap.revision;await action('updateTask',{id,fields:{description:'Atualização válida'}});await action('updateTask',{id,fields:{description:'Sobrescrita antiga'}},409,auth,old);ok(true,'Revisão global desatualizada rejeita sobrescrita silenciosa');
await action('revokeShare',{id,shareId});ok((await json('/api/public/'+guestToken)).status===404,'Revogação encerra o acesso ao portal');

await action('createApiToken',{name:'Teste somente leitura',scope:'read',days:1});const apiToken=snap.result.token;const apiId=snap.state.apiTokens.at(-1).id;
let api=await json('/api/v1/tasks?page=1&pageSize=2',{headers:{Authorization:'Bearer '+apiToken}});ok(api.status===200&&api.body.data.length===2&&api.body.total>=8,'API de tarefas aplica token e paginação');
api=await json('/api/v1/tasks',{method:'POST',headers:{Authorization:'Bearer '+apiToken,'Content-Type':'application/json','If-Match':'"'+snap.revision+'"'},body:JSON.stringify({action:'createTask',data:{title:'Não deve criar',boardId:'marketing'}})});ok(api.status===403,'Token somente leitura não modifica dados');
await action('revokeApiToken',{id:apiId});api=await json('/api/v1/tasks',{headers:{Authorization:'Bearer '+apiToken}});ok(api.status===401,'Token revogado perde acesso');

console.log(`\n${checks} verificações de integração passaram.`);
