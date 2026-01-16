import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
    try {
        const { amount, currency = 'INR', receipt } = await req.json();

        // Check for keys
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            // Mock response for testing/integration mode if keys are missing
            console.warn('Razorpay Keys missing. Returning Mock Order ID.');
            return NextResponse.json({
                id: `order_mock_${Date.now()}`,
                currency: 'INR',
                amount: amount,
                status: 'created'
            });
        }

        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const options = {
            amount: amount * 100, // amount in the smallest currency unit (paise)
            currency,
            receipt,
        };

        const order = await instance.orders.create(options);

        return NextResponse.json(order);
    } catch (error: any) {
        console.error('Razorpay Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
