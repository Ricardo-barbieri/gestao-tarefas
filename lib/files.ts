import { bucket, fail, textInput } from './server';
import { uid, now, Attachment } from './model';
export async function uploadFile(file: File, author: string, kind: 'request' | 'delivery', tag = '', previous?: Attachment): Promise<Attachment> { if (file.size > 10 * 1024 * 1024 || file.size === 0)
    fail(400, 'Selecione um arquivo entre 1 byte e 10 MB.'); const mime = file.type; const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'text/plain', 'text/csv']; if (!allowed.includes(mime))
    fail(400, 'Tipo não permitido. Use PDF, PNG, JPEG, WebP, TXT ou CSV.'); const buffer = await file.arrayBuffer(); const b = new Uint8Array(buffer); if (mime === 'application/pdf' && new TextDecoder().decode(b.slice(0, 5)) !== '%PDF-')
    fail(400, 'Conteúdo PDF inválido.'); if (mime === 'image/png' && !(b[0] === 137 && b[1] === 80 && b[2] === 78 && b[3] === 71))
    fail(400, 'Imagem PNG inválida.'); if (mime === 'image/jpeg' && !(b[0] === 255 && b[1] === 216 && b[2] === 255))
    fail(400, 'Imagem JPEG inválida.'); if (mime === 'image/webp' && !(new TextDecoder().decode(b.slice(0, 4)) === 'RIFF' && new TextDecoder().decode(b.slice(8, 12)) === 'WEBP'))
    fail(400, 'Imagem WebP inválida.'); const id = uid(); const key = 'files/' + id; await bucket().put(key, buffer, { httpMetadata: { contentType: mime } }); return { id, key, name: textInput(file.name.replace(/[\x00-\x1f\/\\]/g, '_'), 240), mime, size: file.size, author, at: now(), kind, tag: textInput(tag, 100), version: previous ? previous.version + 1 : 1, previousId: previous?.id }; }
