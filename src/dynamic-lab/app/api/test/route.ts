import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  
  // Simulate DB processing
  console.log('API Route received:', body);
  
  return NextResponse.json({ 
    message: 'API Route working', 
    received: body,
    timestamp: new Date().toISOString() 
  });
}
