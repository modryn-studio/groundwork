import { createRouteLogger } from '@/lib/route-logger';

const log = createRouteLogger('pipeline-status');

const PIPELINE_API_URL = process.env.PIPELINE_API_URL;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ threadId: string }> }
): Promise<Response> {
  const ctx = log.begin();
  const { threadId } = await params;

  if (!PIPELINE_API_URL) {
    log.warn(ctx.reqId, 'PIPELINE_API_URL not set');
    return log.end(ctx, Response.json({ error: 'Pipeline not configured' }, { status: 503 }));
  }
  try {
    const upstream = await fetch(`${PIPELINE_API_URL}/pipeline/status/${threadId}`, {
      // Don't cache status — it changes continuously during a run
      cache: 'no-store',
    });

    const data = await upstream.json();
    return log.end(ctx, Response.json(data, { status: upstream.status }), { state: data.state });
  } catch (error) {
    log.err(ctx, error);
    return Response.json({ error: 'Failed to fetch status' }, { status: 500 });
  }
}
