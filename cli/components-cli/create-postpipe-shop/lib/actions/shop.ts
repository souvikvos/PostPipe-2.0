'use server';

import dbConnect from '../dbConnect';
import Cart from '../models/Cart';
import Wishlist from '../models/Wishlist';
import { revalidatePath } from 'next/cache';

// Mock User ID for demo purposes. 
// In production, retrieve this from your session (e.g., auth().user.id)
const TEMP_USER_ID = "6578a9b1cde2f3a4b5c6d7e8";

export async function addToCart(prevState: any, formData: FormData) {
  await dbConnect();
  const productId = formData.get('productId') as string;

  if (!productId) return { success: false, message: "Product ID required" };

  try {
    let cart = await Cart.findOne({ user: TEMP_USER_ID });
    if (!cart) {
      cart = await Cart.create({ user: TEMP_USER_ID, items: [] });
    }

    const startIdx = cart.items.findIndex((item: any) => item.product.toString() === productId);
    if (startIdx > -1) {
      cart.items[startIdx].quantity += 1;
    } else {
      cart.items.push({ product: productId, quantity: 1 });
    }

    await cart.save();
    revalidatePath('/shop-demo'); // Adjust path as needed
    return { success: true, message: "Added to cart" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function removeFromCart(prevState: any, formData: FormData) {
  await dbConnect();
  const productId = formData.get('productId') as string;

  if (!productId) return { success: false, message: "Product ID required" };

  try {
    const cart = await Cart.findOne({ user: TEMP_USER_ID });
    if (cart) {
      cart.items = cart.items.filter((item: any) => item.product.toString() !== productId);
      await cart.save();
      revalidatePath('/shop-demo');
    }
    return { success: true, message: "Removed from cart" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function addToWishlist(prevState: any, formData: FormData) {
  await dbConnect();
  const productId = formData.get('productId') as string;

  if (!productId) return { success: false, message: "Product ID required" };

  try {
    let wishlist = await Wishlist.findOne({ user: TEMP_USER_ID });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: TEMP_USER_ID, products: [] });
    }

    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
    }
    revalidatePath('/shop-demo');
    return { success: true, message: "Added to wishlist" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function removeFromWishlist(prevState: any, formData: FormData) {
  await dbConnect();
  const productId = formData.get('productId') as string;

  if (!productId) return { success: false, message: "Product ID required" };

  try {
    const wishlist = await Wishlist.findOne({ user: TEMP_USER_ID });
    if (wishlist) {
      wishlist.products = wishlist.products.filter((id: any) => id.toString() !== productId);
      await wishlist.save();
      revalidatePath('/shop-demo');
    }
    return { success: true, message: "Removed from wishlist" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
