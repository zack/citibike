import type { NextRequest } from 'next/server';
import { revalidateTag } from 'next/cache';
import { unauthorized } from 'next/navigation';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tag = searchParams.get('tag') ?? '';
  const pass = searchParams.get('pass');

  if (pass === process.env.PASS) {
    revalidateTag(tag);
    return Response.json({ revalidated: true, now: Date.now() });
  } else {
    unauthorized();
  }
}
