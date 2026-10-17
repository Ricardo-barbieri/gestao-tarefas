import './sites-env.mjs';
import {existsSync} from 'node:fs';
import {spawn} from 'node:child_process';
if(!existsSync('dist/server/wrangler.json'))throw Error('Compile primeiro com npm run build. Consulte docs/PLANO-APROVADO.md.');
console.log('Prévia de revisão LOCAL: http://127.0.0.1:8787');
console.log('Banco e arquivos locais de teste. Nenhuma publicação ou conexão com o banco de produção.');
const args=['--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js','dev','--config','dist/server/wrangler.json','--local','--persist-to','.wrangler/state','--ip','127.0.0.1','--port','8787','--inspector-port','0','--var','ADMIN_EMAIL:seedy@sites.test','--var','APP_ORIGIN:http://127.0.0.1:8787'];
const child=spawn(process.execPath,args,{stdio:'inherit'});child.on('exit',code=>process.exit(code||0));process.on('SIGINT',()=>child.kill('SIGINT'));process.on('SIGTERM',()=>child.kill('SIGTERM'));
