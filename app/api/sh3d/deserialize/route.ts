import { NextResponse } from 'next/server';
import { HomeDefinition } from '@/lib/architecture/types';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const home = (payload?.source || payload) as HomeDefinition;
    if (!home || !home.id) throw new Error('invalid sh3d data');

    return NextResponse.json({ success: true, home });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 400 });
  }
}
