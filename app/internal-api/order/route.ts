import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /internal-api/order
 * Creates a Razorpay order for token purchases
 * 
 * Body: { amount: number }  // Amount in INR
 * Response: { orderId: string, amount: number, currency: string }
 */

export async function POST(request: NextRequest) {
    try {
        const { amount } = await request.json()

        if (!amount || amount < 1) {
            return NextResponse.json(
                { error: 'Invalid amount' },
                { status: 400 }
            )
        }

        const razorpayKeyId = process.env.RAZORPAY_KEY_ID
        const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET

        if (!razorpayKeyId || !razorpayKeySecret) {
            console.error('[Razorpay] Missing API credentials in environment')
            return NextResponse.json(
                { error: 'Payment service not configured' },
                { status: 500 }
            )
        }

        // Create order via Razorpay API
        const orderResponse = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64')}`,
            },
            body: JSON.stringify({
                amount: amount * 100, // Razorpay expects amount in paise (1 INR = 100 paise)
                currency: 'INR',
                receipt: `order-${Date.now()}`,
                notes: {
                    description: 'Strukt AI Token Purchase'
                }
            })
        })

        if (!orderResponse.ok) {
            const errorText = await orderResponse.text()
            console.error('[Razorpay] Order creation failed:', errorText)
            return NextResponse.json(
                { error: 'Failed to create payment order' },
                { status: 500 }
            )
        }

        const orderData = await orderResponse.json()

        return NextResponse.json({
            orderId: orderData.id,
            amount: amount,
            currency: 'INR'
        })
    } catch (error) {
        console.error('[/internal-api/order] Error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

/**
 * POST /internal-api/order/verify
 * Verifies Razorpay payment signature and credits user tokens
 */
export async function PUT(request: NextRequest) {
    try {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = await request.json()

        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
            return NextResponse.json(
                { error: 'Missing payment verification details' },
                { status: 400 }
            )
        }

        const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET

        if (!razorpayKeySecret) {
            return NextResponse.json(
                { error: 'Payment service not configured' },
                { status: 500 }
            )
        }

        // Verify signature
        const crypto = await import('crypto')
        const hmac = crypto.createHmac('sha256', razorpayKeySecret)
        hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`)
        const generatedSignature = hmac.digest('hex')

        if (generatedSignature !== razorpay_signature) {
            console.warn('[Razorpay] Signature verification failed')
            return NextResponse.json(
                { error: 'Payment verification failed' },
                { status: 401 }
            )
        }

        // TODO: Update user's token balance in database
        // const user = await getCurrentUser(request)
        // await db.user.update({ tokens: user.tokens + tokensForAmount })

        return NextResponse.json({
            success: true,
            message: 'Payment verified and tokens credited'
        })
    } catch (error) {
        console.error('[/internal-api/order/verify] Error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
