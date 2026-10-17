import {beginOAuth} from '@/lib/oauth';
import {AuthError} from '@/lib/auth';
export async function GET(req:Request){try{return await beginOAuth(req,'google')}catch(e){return Response.json({error:e instanceof AuthError?e.message:'Não foi possível iniciar o acesso.'},{status:e instanceof AuthError?e.status:500})}}
