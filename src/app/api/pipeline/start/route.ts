import { createRouteLogger } from '@/lib/route-logger';

const log = createRouteLogger('pipeline-start');

const PIPELINE_API_URL = process.env.PIPELINE_API_URL;

export async function POST(req: Request): Promise<Response> {
  const ctx = log.begin();
  if (!PIPELINE_API_URL) {
    log.warn(ctx.reqId, 'PIPELINE_API_URL not set');
    return log.end(ctx, Response.json({ error: 'Pipeline not configured' }, { status: 503 }));
  }
  try {
    const body = await req.json();
    log.info(ctx.reqId, 'Forwarding start request', { ideaCount: body.ideas?.length });

    const upstream = await fetch(`${PIPELINE_API_URL}/pipeline/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await upstream.json();
    return log.end(
      ctx,
      Response.json(data, { status: upstream.status }),
      { thread_id: data.thread_id }
    );
  } catch (error) {
    log.err(ctx, error);
    return Response.json({ error: 'Failed to start pipeline' }, { status: 500 });
  }
}
