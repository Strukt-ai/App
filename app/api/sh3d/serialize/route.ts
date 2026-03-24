import { NextResponse } from 'next/server';
import { HomeDefinition } from '@/lib/architecture/types';

export async function POST(request: Request) {
  try {
    const home: HomeDefinition = await request.json();

    // A very simple SH3D gateway simulation: wrap the JSON
    const sh3d = {
      format: 'sh3d-mock',
      version: '1.0',
      source: home,
    };

    return NextResponse.json({ success: true, sh3d });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 400 });
  }
}
