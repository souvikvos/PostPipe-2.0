import { NextResponse } from 'next/server';
import { adminGuard } from '../../../lib/auth/adminGuard'; 

export async function GET(request: Request) {
  try {
    // This will throw if not admin
    await adminGuard();

    return NextResponse.json({ 
      success: true, 
      message: "✅ Welcome to the Secret Admin Data!" 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 403 });
  }
}
