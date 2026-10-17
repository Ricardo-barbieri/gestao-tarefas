import assert from 'node:assert/strict';
const base='http://127.0.0.1:8787';let cookie='',checks=0;const suffix=crypto.randomUUID();
async function call(path,body){const r=await fetch(base+path,{method:body?'POST':'GET',headers:{Cookie:cookie,'Content-Type':'application/json','cf-connecting-ip':'structure-'+suffix},body:body?JSON.stringify(body):undefined});const d=await r.json();return {r,d,cookie:r.headers.getSetCookie().map(v=>v.split(';')[0]).join('; ')}}
let out=await call('/api/auth/login',{email:'seedy@sites.test',password:'Senha-local-para-testes-2026!'});assert.equal(out.r.status,200);cookie=out.cookie;
async function action(name,data){const {d:s}=await call('/api/state');return call('/api/action',{action:name,orgId:s.orgId,revision:s.revision,data})}
function check(v,label){assert.ok(v,label);checks++;console.log('✓ '+label)}
const {d:snap}=await call('/api/state');check(snap.state.structure.departments.some(d=>d.id==='dept-recepcao'&&d.parentId==='dept-administrativo'),'Recepção dentro de Administrativo');
out=await action('saveDepartment',{name:'Departamento teste '+suffix});check(out.r.status===200,'Cria departamento');const dept=out.d.result.id;
out=await action('saveDepartmentFunction',{name:'Atividade teste',departmentId:dept});check(out.r.status===200,'Cria função do departamento');const fun=out.d.result.id;
out=await action('savePosition',{name:'Cargo teste',departmentId:dept,functionIds:[fun]});check(out.r.status===200,'Cria cargo com funções sugeridas');const pos=out.d.result.id;
let fresh=(await call('/api/state')).d;out=await call('/api/people',{orgId:fresh.orgId,revision:fresh.revision,name:'Pessoa hierarquia',email:'structure-'+suffix+'@example.com',role:'member',teams:['marketing'],departmentId:dept,positionId:pos,functionIds:[fun]});check(out.r.status===200,'Cadastro hierárquico com autorização do master');
fresh=(await call('/api/state')).d;const person=fresh.state.people.find(p=>p.email==='structure-'+suffix+'@example.com');check(person.positionId===pos&&person.functionIds[0]===fun,'Vínculos persistidos');
out=await action('updatePerson',{id:person.id,functionIds:['function-design-criar-artes']});check(out.r.status===400,'Rejeita função de outro departamento');out=await action('updatePerson',{id:person.id,positionId:'position-design-designer'});check(out.r.status===400,'Rejeita cargo de outro departamento');
out=await action('savePosition',{id:pos,name:'Cargo renomeado',departmentId:dept,functionIds:[fun]});check(out.r.status===200&&out.d.state.people.find(p=>p.id===person.id).jobTitle==='Cargo renomeado','Renomear mantém vínculo da pessoa');out=await action('setStructureActive',{kind:'position',id:pos,active:false});check(out.r.status===409,'Protege cargo em uso contra arquivamento');out=await action('saveDepartment',{id:dept,name:'Ciclo',parentId:dept});check(out.r.status===400,'Rejeita ciclo na árvore');
console.log(checks+' verificações da estrutura passaram.');
