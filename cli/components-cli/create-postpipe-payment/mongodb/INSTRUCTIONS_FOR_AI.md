# PostPipe Payment Gateway Guide (MongoDB)

Use this guide to integrate Payment Gateways (Razorpay/Stripe) and Transaction logging.

## Phase 1: Scaffolding

**Step 1.1**: Run the Payment CLI.

```bash
npx create-postpipe-payment@latest
# Follow prompts:
# 1. Choose Database: MongoDB
# 2. Select Gateway: Razorpay (or Stripe)
```

**Step 1.2**: Dependencies.

```bash
npm install razorpay mongoose
```

**Step 1.3**: Env Vars.

```env
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
```

---

## Phase 2: Verify Backend

- **Model**: `Transaction` in `lib/models`.
- **API**: `/api/payment/create-order` and `/api/payment/verify`.

---

## Phase 3: Frontend Implementation

**Step 3.1**: Payment Button.

```tsx
"use client";
import Script from "next/script";

export default function PayButton({ amount }) {
  const handlePayment = async () => {
    // 1. Create Order
    const res = await fetch("/api/payment/create-order", {
      method: "POST",
      body: JSON.stringify({ amount }),
    });
    const order = await res.json();

    // 2. Open Razorpay
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
      amount: order.amount,
      order_id: order.id,
      handler: function (response) {
        // 3. Verify Payment
        fetch("/api/payment/verify", {
          method: "POST",
          body: JSON.stringify(response),
        });
      },
    };
    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <button onClick={handlePayment}>Pay Now</button>
    </>
  );
}
```
