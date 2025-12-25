import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Post from '@/lib/models/Post';

export async function GET() {
  try {
    await dbConnect();
    const posts = await Post.find({ published: true }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: posts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const post = await Post.create(body);
    return NextResponse.json({ success: true, data: post }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
