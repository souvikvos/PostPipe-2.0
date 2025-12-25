import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Cart from '@/models/Cart';
import Razorpay from 'razorpay';
import Coupon from '@/models/Coupon';

// Init Razorpay
const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { userId, address, couponCode, items } = await request.json();

    // 1. Resolve Items (Client items take precedence for resilience, or fallback to DB Cart)
    let itemsToProcess = [];
    
    if (items && items.length > 0) {
        itemsToProcess = items;
    } else {
        // Fallback to Server Cart
        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
        }
        itemsToProcess = cart.items.map((item: any) => ({
            product: item.product,
            quantity: item.quantity
        }));
    }

    let subtotal = 0;
    const finalOrderItems = [];
    
    // 2. Validate Stock & Calculate Totals (Snapshot Price from DB Only)
    for (const item of itemsToProcess) {
        // Fetch fresh product data to prevent price tampering
        const productId = item.product._id || item.product; // Handle populated vs raw ID
        const product = await Product.findById(productId);
        
        if (!product) return NextResponse.json({ error: `Product not found: ${productId}` }, { status: 404 });
        if (product.stock < item.quantity) {
             return NextResponse.json({ error: `Insufficient stock for ${product.name}` }, { status: 400 });
        }
        
        const price = product.salePrice || product.price;
        subtotal += price * item.quantity;
        
        finalOrderItems.push({
            product: product._id,
            name: product.name,
            price: price, // Snapshot!
            quantity: item.quantity
        });
    }

    // 3. Apply Coupon
    let discount = 0;
    if (couponCode) {
        const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
        if (coupon) {
            if (new Date() > coupon.expiry) {
                 return NextResponse.json({ error: 'Coupon expired' }, { status: 400 });
            }
            if (subtotal < coupon.minOrderValue) {
                 return NextResponse.json({ error: `Min order value for coupon is ${coupon.minOrderValue}` }, { status: 400 });
            }
            
            if (coupon.type === 'percent') {
                discount = (subtotal * coupon.value) / 100;
            } else {
                discount = coupon.value;
            }
        }
    }

    const total = subtotal - discount;

    // 4. Create Razorpay Order
    const rzpOrder = await instance.orders.create({
        amount: Math.round(total * 100),
        currency: 'INR',
        receipt: `receipt_${Date.now()}`
    });

    // 5. Create DB Order (Pending)
    const newOrder = await Order.create({
        user: userId,
        items: finalOrderItems,
        subtotal,
        discount,
        total,
        paymentMethod: 'razorpay',
        paymentInfo: {
            razorpayOrderId: rzpOrder.id,
            status: 'pending'
        },
        shippingAddress: address,
        couponApplied: couponCode,
        status: 'pending'
    });

    // 6. Decrement Stock NOW (Lock inventory)
    for (const item of finalOrderItems) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }

    // Note: We don't clear DB cart here automatically if using client-side items. 
    // Logic: If successfully ordered, client should clear their state. 
    // Server cart clearing happens on /verify success.

    return NextResponse.json({ success: true, order: newOrder, razorpayOrder: rzpOrder });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
