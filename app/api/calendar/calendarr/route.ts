import {context,admin,sameOrigin,readJson,visible,errorResponse,limit} from '@/lib/server';
import {refreshHolidays} from '@/lib/holiday-sync';
import {database} from '@/lib/server';
export async function POST(req:Request){try{sameOrigin(req);const d=await readJson(req),c=await context(d.orgId);admin(c);await limit('calendarr:'+c.orgId,4);await refreshHolidays(database(),c.orgId,true);return Response.json(visible(await context(c.orgId)),{headers:{'Cache-Control':'no-store'}})}catch(e){return errorResponse(e)}}
