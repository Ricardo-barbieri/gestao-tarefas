import {processCalendarJobs} from '../lib/calendar';
import {processWebhooks} from '../lib/webhooks';
import handler from "vinext/server/fetch-handler";
import { runWithConnectorBinding } from "../lib/connector-context";
import type { ConnectorBinding } from "../lib/connector-contract.mjs";

export default {
  scheduled(_event:ScheduledController, env:Cloudflare.Env, ctx:ExecutionContext){if(env.DB)ctx.waitUntil(Promise.allSettled([processWebhooks(env.DB),processCalendarJobs()]));},
  async fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext<{ CONNECTORS?: ConnectorBinding }>) {
    let binding = ctx.props?.CONNECTORS;
    // Local preview emulates the same request-scoped capability. This branch and
    // the auxiliary service binding are absent from production builds.
    if (import.meta.env.DEV && !binding && env.CONNECTORS) {
      const preview = env.CONNECTORS;
      const expiresAt = Date.now() + 60_000;
      binding = {
        async getContext() {
          if (Date.now() >= expiresAt) return { status: "request_context_expired" };
          return preview.getContext?.() ?? { status: "binding_unavailable" };
        },
        async invoke(connectorId, actionName, args) {
          if (Date.now() >= expiresAt) {
            return { status: "request_context_expired", message: "This request has expired. Please try again." };
          }
          return preview.invoke(connectorId, actionName, args);
        },
      };
    }
    const response=await runWithConnectorBinding(binding, () => handler.fetch(request, env, ctx));
    if(response.headers.get('X-Vamo-Process-Webhooks')==='1'&&env.DB)ctx.waitUntil(processWebhooks(env.DB).catch(()=>{}));
    if((response.headers.get('X-Vamo-Process-Calendar')==='1'||response.headers.get('X-Vamo-Process-Webhooks')==='1')&&env.DB)ctx.waitUntil(processCalendarJobs().catch(()=>{}));
    return response;
  },
};
