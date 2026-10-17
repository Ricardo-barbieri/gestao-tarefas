import {oauthCallback,oauthFailure} from '@/lib/oauth';
export async function POST(req:Request){try{return await oauthCallback(req,'apple')}catch(e){return oauthFailure(e)}}
