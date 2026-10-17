import {env} from 'cloudflare:workers';
import {AuthError} from './auth';
async function key(){let bytes:Uint8Array;try{bytes=Uint8Array.from(atob(String((env as any).TOKEN_ENCRYPTION_KEY||'')),c=>c.charCodeAt(0))}catch{throw new AuthError(503,'Proteção das credenciais não configurada.')}if(bytes.length!==32)throw new AuthError(503,'Configure uma chave de proteção de 32 bytes.');return crypto.subtle.importKey('raw',bytes as BufferSource,'AES-GCM',false,['encrypt','decrypt'])}
export async function seal(value:string){const iv=crypto.getRandomValues(new Uint8Array(12));const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv},await key(),new TextEncoder().encode(value));return btoa(String.fromCharCode(...iv,...new Uint8Array(encrypted)))}
export async function openSecret(value:string){const bytes=Uint8Array.from(atob(value),c=>c.charCodeAt(0));return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes.slice(0,12)},await key(),bytes.slice(12)))}
