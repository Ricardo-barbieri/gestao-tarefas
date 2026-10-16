import ts from 'typescript';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
function walk(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(dir+'/'+e.name):/\.tsx?$/.test(e.name)?[dir+'/'+e.name]:[])}
const printer=ts.createPrinter({newLine:ts.NewLineKind.LineFeed});
for(const file of [...walk('app'),...walk('lib'),...walk('db')].filter(p=>!p.includes('connector')&&!p.includes('chatgpt-auth'))){const source=ts.createSourceFile(file,readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,file.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);writeFileSync(file,printer.printFile(source));}
