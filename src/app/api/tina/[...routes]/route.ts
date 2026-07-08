import { LocalBackendAuthProvider, TinaNodeBackend } from '@tinacms/datalayer';
import type { NextRequest } from 'next/server';

import { runNodeHandler } from '@/lib/tina-node-handler';
import databaseClient from '../../../../../tina/__generated__/databaseClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const handler = TinaNodeBackend({
  authProvider: LocalBackendAuthProvider(),
  databaseClient,
});

type RouteContext = {
  params: Promise<{ routes: string[] }>;
};

async function handle(request: NextRequest, context: RouteContext) {
  const { routes } = await context.params;
  return runNodeHandler(handler, request, routes);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
