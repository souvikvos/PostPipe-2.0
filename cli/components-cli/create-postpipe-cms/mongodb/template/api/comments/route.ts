import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Comment from '@/lib/models/Comment';

export async function GET(req: Request) {
  try {
    // Optional: Filter by Post ID via query param ?postId=...
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('postId');
    
    const query = postId ? { post: postId } : {};
    const comments = await Comment.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: comments });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const comment = await Comment.create(body);
    return NextResponse.json({ success: true, data: comment }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
