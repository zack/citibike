import type { NextRequest } from 'next/server';
import cache from '../../redis';
import { revalidateTag } from 'next/cache';
import { unauthorized } from 'next/navigation';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const pass = searchParams.get('pass');

  if (pass === process.env.PASS) {
    await cache.flushAll();

    revalidateTag('stations');
    revalidateTag('council-districts');
    revalidateTag('community-districts');

    return Response.json({ revalidated: true, now: Date.now() });
  } else {
    unauthorized();
  }
}
