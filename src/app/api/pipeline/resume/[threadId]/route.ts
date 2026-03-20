import { createRouteLogger } from '@/lib/route-logger';

const log = createRouteLogger('pipeline-resume');

const PIPELINE_API_URL = process.env.PIPELINE_API_URL;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ threadId: string }> }
): Promise<Response> {
  const ctx = log.begin();
  const { threadId } = await params;

  if (!PIPELINE_API_URL) {
    log.warn(ctx.reqId, 'PIPELINE_API_URL not set');
    return log.end(ctx, Response.json({ error: 'Pipeline not configured' }, { status: 503 }));
  }
  try {
    const body = await req.json();
    log.info(ctx.reqId, 'Forwarding resume', { threadId, decision: body.decision });

    const upstream = await fetch(`${PIPELINE_API_URL}/pipeline/resume/${threadId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await upstream.json();
    return log.end(ctx, Response.json(data, { status: upstream.status }));
  } catch (error) {
    log.err(ctx, error);
    return Response.json({ error: 'Failed to resume pipeline' }, { status: 500 });
  }
}
