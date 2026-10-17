import {oauthCallback,oauthFailure} from '@/lib/oauth';
export async function GET(req:Request){try{return await oauthCallback(req,'google')}catch(e){return oauthFailure(e)}}
