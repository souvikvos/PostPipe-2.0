import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/lib/models/Product';
import APIFeatures from '../../../lib/utils/apiFeatures';

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    // Convert URLSearchParams to object
    const { searchParams } = new URL(request.url);
    const queryObj: any = {};
    searchParams.forEach((value, key) => { queryObj[key] = value });

    // Execute with APIFeatures
    const features = new APIFeatures(Product.find(), queryObj)
      .filter()
      .sort()
      .limitFields()
      .pagination();

    const products = await features.query;

    return NextResponse.json({
      success: true,
      results: products.length,
      data: products
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
