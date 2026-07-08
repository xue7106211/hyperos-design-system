import { IncomingMessage, ServerResponse } from 'node:http';
import { Socket } from 'node:net';
import type { NextRequest } from 'next/server';

type NodeHandler = (req: IncomingMessage, res: ServerResponse) => Promise<void>;

function createIncomingMessage(request: NextRequest, pathname: string, bodyText: string) {
  const socket = new Socket();
  const incoming = new IncomingMessage(socket);

  incoming.method = request.method;
  incoming.url = pathname;
  incoming.headers = Object.fromEntries(request.headers.entries());

  if (bodyText) {
    try {
      (incoming as IncomingMessage & { body?: unknown }).body = JSON.parse(bodyText);
    } catch {
      (incoming as IncomingMessage & { body?: unknown }).body = undefined;
    }
  }

  return incoming;
}

export async function runNodeHandler(
  handler: NodeHandler,
  request: NextRequest,
  routes: string[],
) {
  const url = new URL(request.url);
  const pathname = `/api/tina/${routes.join('/')}${url.search}`;
  const bodyText =
    request.method === 'GET' || request.method === 'HEAD' ? '' : await request.text();

  const nodeReq = createIncomingMessage(request, pathname, bodyText);
  const nodeRes = new ServerResponse(nodeReq);
  const chunks: Buffer[] = [];

  const originalWrite = nodeRes.write.bind(nodeRes);
  const originalEnd = nodeRes.end.bind(nodeRes);

  nodeRes.write = ((chunk: unknown, ...args: unknown[]) => {
    if (chunk) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
    }
    return originalWrite(chunk as never, ...(args as []));
  }) as ServerResponse['write'];

  return new Promise<Response>((resolve, reject) => {
    nodeRes.end = ((chunk?: unknown, ...args: unknown[]) => {
      if (chunk) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
      }

      const headers = new Headers();
      for (const [key, value] of Object.entries(nodeRes.getHeaders())) {
        if (value === undefined) continue;
        headers.set(key, Array.isArray(value) ? value.join(', ') : String(value));
      }

      resolve(
        new Response(Buffer.concat(chunks).toString('utf8'), {
          status: nodeRes.statusCode || 200,
          headers,
        }),
      );

      return originalEnd(chunk as never, ...(args as []));
    }) as ServerResponse['end'];

    handler(nodeReq, nodeRes).catch(reject);
  });
}
