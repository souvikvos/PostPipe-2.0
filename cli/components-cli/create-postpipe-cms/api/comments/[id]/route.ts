import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Comment from '@/lib/models/Comment';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const comment = await Comment.findById(params.id);
    if (!comment) {
      return NextResponse.json({ success: false, error: 'Comment not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: comment });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const body = await req.json();
    const comment = await Comment.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });
    if (!comment) {
      return NextResponse.json({ success: false, error: 'Comment not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: comment });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const deletedComment = await Comment.findByIdAndDelete(params.id);
    if (!deletedComment) {
      return NextResponse.json({ success: false, error: 'Comment not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {} });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
