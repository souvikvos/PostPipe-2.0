import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Category from '@/lib/models/Category';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const category = await Category.findById(params.id);
    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: category });
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
    const category = await Category.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: category });
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
    const deletedCategory = await Category.findByIdAndDelete(params.id);
    if (!deletedCategory) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {} });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
