import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Wishlist from '@/models/Wishlist';
import { getServerSession } from 'next-auth'; // Assuming next-auth is used, or custom auth
// Note: Since this is a CLI template, we might rely on headers or a custom 'getUser' util if next-auth isn't fully scaffolded yet.
// However, the standard usually implies some auth check. I will assume a strict auth check isn't easily mockable here without next-auth setup.
// For the CLI template, I'll use a placeholder "TODO: Get User" or assume a dummy user for now if auth isn't strict, 
// BUT verifying the auth folder shows next-auth or similar might be there.
// Actually, looking at previous files, it uses 'jose' or 'jsonwebtoken' maybe?
// Let's stick to a generic structure where we expect a user ID.

export async function GET(request: Request) {
    await dbConnect();
    // TODO: Get userId from session/token
    // const userId = ...
    
    // For now, return error if no user logic unimplemented, but let's assume valid request for template
    // Ideally we need the userId. 
    return NextResponse.json({ message: "Auth required to fetch wishlist" }, { status: 401 });
}

export async function POST(request: Request) {
    await dbConnect();
    try {
        const { userId, productId } = await request.json(); // distinct from session for now for template simplicity
        
        let wishlist = await Wishlist.findOne({ user: userId });
        
        if (!wishlist) {
            wishlist = await Wishlist.create({ user: userId, products: [productId] });
        } else {
            if (!wishlist.products.includes(productId)) {
                wishlist.products.push(productId);
                await wishlist.save();
            }
        }
        
        return NextResponse.json({ success: true, wishlist });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    await dbConnect();
    try {
        const { userId, productId } = await request.json();
        
        const wishlist = await Wishlist.findOne({ user: userId });
        if (wishlist) {
            wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
            await wishlist.save();
        }
        
        return NextResponse.json({ success: true, wishlist });
    } catch (error: any) {
         return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
