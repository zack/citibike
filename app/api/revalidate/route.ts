import { unauthorized } from 'next/navigation';
import type { NextRequest } from 'next/server';

import cache from '../../redis';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const pass = searchParams.get('pass');

  if (pass === process.env.PASS) {
    await cache.flushAll();

    return Response.json({ revalidated: true, now: Date.now() });
  } else {
    unauthorized();
  }
}
