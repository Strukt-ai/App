'use client';

import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';

const features = [
    { name: '2D→SVG conversion', cost: 60, description: 'Vectorizing floorplans is moderately heavy.' },
    { name: 'Furniture placement (Furn AI)', cost: 150, description: 'Full 3D object generation is heavy.' },
    { name: 'Cupboard design (Cup AI)', cost: 150, description: 'Similar heavy 3D modeling.' },
    { name: 'Apply texture (Texturize)', cost: 80, description: 'Mapping textures is moderately heavy.' },
    { name: 'File format export', cost: 20, description: 'Light process to change output format.' },
    { name: 'Generate delivery file', cost: 50, description: 'Packaging output for delivery.' },
];

const plans = [
    {
        name: 'Free',
        price: '₹0',
        amount: 0,
        tokens: '200 tokens',
        period: 'one-time on signup',
        features: [
            { name: '2D → SVG', value: 'Limited' },
            { name: 'Furn AI', value: '❌' },
            { name: 'Cup AI', value: '❌' },
            { name: 'Texturize', value: '❌' },
            { name: 'File Export', value: 'Basic' },
            { name: 'Delivery', value: '❌' },
            { name: 'Watermark', value: 'Yes' },
            { name: 'Quality', value: 'Low' },
            { name: 'Speed', value: 'Slow' },
        ],
        cta: 'Get Started',
        href: '/editor',
        highlight: false,
    },
    {
        name: 'Basic',
        price: '₹499',
        amount: 499,
        tokens: '2,000 tokens',
        period: '/month',
        features: [
            { name: '2D → SVG', value: 'Full' },
            { name: 'Furn AI', value: '✅' },
            { name: 'Cup AI', value: '✅' },
            { name: 'Texturize', value: '✅' },
            { name: 'File Export', value: 'Standard' },
            { name: 'Delivery', value: 'Limited' },
            { name: 'Watermark', value: 'No' },
            { name: 'Quality', value: 'Medium' },
            { name: 'Speed', value: 'Normal' },
        ],
        cta: 'Upgrade to Basic',
        href: '/pricing',
        highlight: true,
    },
    {
        name: 'Pro',
        price: '₹1499',
        amount: 1499,
        tokens: '6,000 tokens',
        period: '/month',
        features: [
            { name: '2D → SVG', value: 'Optimized' },
            { name: 'Furn AI', value: '✅ Advanced' },
            { name: 'Cup AI', value: '✅ Advanced' },
            { name: 'Texturize', value: '✅ High Quality' },
            { name: 'File Export', value: 'Advanced' },
            { name: 'Delivery', value: 'Full' },
            { name: 'Watermark', value: 'No' },
            { name: 'Quality', value: 'High' },
            { name: 'Speed', value: 'Fast' },
        ],
        cta: 'Upgrade to Pro',
        href: '/pricing',
        highlight: false,
    }
];

const topUps = [
    { price: 99, tokens: 300 },
    { price: 199, tokens: 800 },
    { price: 499, tokens: 2500 },
    { price: 999, tokens: 6000 },
];

export function PricingPage() {
    const handlePayment = async (amount: number, description: string) => {
        try {
            const response = await fetch('/internal-api/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount })
            });
            const data = await response.json();
            
            if (data.orderId) {
                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY || "rzp_test_demo", // Use env key
                    amount: amount * 100,
                    currency: "INR",
                    name: "Strukt AI Pricing",
                    description: description,
                    order_id: data.orderId,
                    handler: function (response: any) {
                        alert(`Payment successful! ID: ${response.razorpay_payment_id}`);
                    },
                    theme: {
                        color: "#4f46e5"
                    }
                };
                const rzp1 = new (window as any).Razorpay(options);
                rzp1.open();
            }
        } catch (error) {
            console.error("Payment error:", error);
            alert("Something went wrong with the payment mechanism.");
        }
    };

    return (
        <div className="w-full min-h-screen bg-[#090a0e] border-t border-white/5 text-neutral-100 font-sans overflow-y-auto relative z-0">
            <div className="absolute inset-0 z-[-1] bg-[radial-gradient(circle_at_10%_30%,rgba(87,126,255,0.05),transparent_36%),radial-gradient(circle_at_90%_70%,rgba(255,194,71,0.06),transparent_34%)] pointer-events-none" />
            <div className="absolute inset-0 z-[-1] opacity-[0.22] landing-grid-bg pointer-events-none" />

            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            <div className="mx-auto w-full max-w-350 px-6 py-12 md:px-10 lg:py-16 relative z-10">

                {/* Header */}
                <div className="text-center mb-16 relative">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#ffc661]/35 bg-[#ffc661]/10 px-3.5 py-1 text-xs uppercase tracking-[0.2em] text-[#ffd886] mb-6">
                        Flexible Subscriptions
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold tracking-tight text-white leading-[1.05]">
                        Choose the right plan for your workflow
                    </h1>
                    <p className="text-base md:text-lg text-zinc-400 mt-5 max-w-3xl mx-auto leading-relaxed">
                        From casual hobbyists to professional studios, our token-based system lets you pay only for what you use. Cancel anytime.
                    </p>
                </div>

                {/* Subscription Tiers */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-24 max-w-6xl mx-auto relative">
                    {/* Add floating decorative element behind pricing cards */}
                    <div className="absolute -top-12 -left-8 w-24 h-24 rounded-2xl bg-zinc-800/40 border border-[#ffc661]/10 backdrop-blur-3xl animate-[float_4s_ease-in-out_infinite] z-[-1]" />
                    <div className="absolute top-1/2 -right-12 w-16 h-16 rounded-lg bg-zinc-800/40 border border-[#ffc661]/10 backdrop-blur-3xl animate-[float_4.8s_ease-in-out_infinite] z-[-1]" />

                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`flex flex-col relative overflow-hidden transition-all duration-300 ${plan.highlight
                                ? 'rounded-2xl border border-[#ffc661]/35 bg-[rgba(255,194,71,0.05)] backdrop-blur-lg p-6 md:p-8 lg:scale-105 ring-2 ring-[#ffc661]/10 shadow-[0_20px_70px_rgba(255,194,71,0.12)] z-10'
                                : 'rounded-2xl border border-white/10 bg-[rgba(17,17,20,0.86)] backdrop-blur-lg p-6 hover:border-[#ffc661]/45 lg:mt-4'
                                }`}
                        >
                            {/* Radial Inner Glow for Highlighted */}
                            {plan.highlight && (
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,194,71,0.12),transparent_60%)] pointer-events-none" />
                            )}

                            <div className="relative z-10 flex flex-col h-full">
                                <h3 className={`text-xl font-heading font-bold ${plan.highlight ? 'text-[#ffc661]' : 'text-white'}`}>{plan.name}</h3>
                                <p className="mt-3">
                                    <span className="text-3xl font-extrabold tracking-tight text-white">{plan.price}</span>
                                    <span className="text-sm font-medium text-neutral-400">{plan.period}</span>
                                </p>
                                <p className="mt-1 text-sm text-[#ffd18a]">{plan.tokens}</p>
                                
                                <ul role="list" className="mt-6 space-y-3 flex-1">
                                    {plan.features.map((feature) => (
                                        <li key={feature.name} className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 gap-4">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className={`h-4 w-4 shrink-0 ${feature.value.includes('❌') ? 'text-neutral-600' : 'text-[#ffc661]'}`} aria-hidden="true" />
                                                <span className="text-neutral-300">{feature.name}</span>
                                            </div>
                                            <span className={`font-medium text-right text-xs ${feature.value.includes('❌') ? 'text-neutral-500' : 'text-white'}`}>{feature.value}</span>
                                        </li>
                                    ))}
                                </ul>
                                {plan.amount && plan.amount > 0 ? (
                                    <button
                                        onClick={() => handlePayment(plan.amount as number, `Subscribe to: ${plan.name}`)}
                                        className={`mt-6 block w-full rounded-lg px-6 py-3 text-center text-sm font-semibold transition-transform ${plan.highlight
                                            ? 'bg-[#ffc247] text-black shadow-[0_0_28px_rgba(255,194,71,0.45)] hover:scale-[1.02]'
                                            : 'border border-white/20 text-white bg-white/4 hover:bg-white/10'
                                            }`}
                                    >
                                        {plan.cta}
                                    </button>
                                ) : (
                                    <Link
                                        href={plan.href}
                                        className={`mt-6 block w-full rounded-lg px-6 py-3 text-center text-sm font-semibold transition-transform ${plan.highlight
                                            ? 'bg-[#ffc247] text-black shadow-[0_0_28px_rgba(255,194,71,0.45)] hover:scale-[1.02]'
                                            : 'border border-white/20 text-white bg-white/4 hover:bg-white/10'
                                            }`}
                                    >
                                        {plan.cta}
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Token Costs Section */}
                <section className="mb-24 py-16 border-t border-white/5" aria-labelledby="token-costs">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#ffc661]/35 bg-[#ffc661]/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#ffd886] mb-4">
                            Efficiency Engine
                        </div>
                        <h2 id="token-costs" className="text-3xl font-heading font-bold text-white">Features & Token Costs</h2>
                        <p className="text-zinc-400 mt-3 max-w-2xl mx-auto">Each action has a token cost based on its computational complexity. Here's a breakdown of spatial operations:</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {features.map((feature) => (
                            <div key={feature.name} className="relative overflow-hidden rounded-xl border border-white/10 bg-[rgba(17,17,20,0.86)] backdrop-blur-lg p-6 hover:border-[#ffc661]/45 transition-colors group">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(255,194,71,0.08),transparent_40%)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                <p className="text-base font-heading font-bold text-white relative z-10">{feature.name}</p>
                                <p className="text-3xl font-bold my-2 text-[#ffd18a] relative z-10">{feature.cost} <span className="text-sm font-medium text-neutral-500">tokens</span></p>
                                <p className="text-xs text-zinc-400 relative z-10 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Token Top-Ups Section */}
                <section className="mb-20 relative px-4 py-12 rounded-3xl border border-white/10 bg-zinc-950 overflow-hidden max-w-5xl mx-auto">
                    <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_80%_50%,rgba(255,194,71,0.08),transparent_60%)] pointer-events-none" />
                    <div className="text-center mb-10 relative z-10">
                        <h2 className="text-2xl font-heading font-bold text-white">One-Time Token Top-Ups</h2>
                        <p className="text-zinc-400 mt-2 text-sm">Need more tokens for a big project? Top up any time. These tokens never expire.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10 px-6">
                        {topUps.map((topUp) => (
                            <div key={topUp.price} className="relative rounded-xl border border-white/10 bg-black/45 backdrop-blur-sm p-5 text-center shadow-lg hover:border-[#ffc661]/45 hover:bg-black/60 transition-colors group flex flex-col items-center">
                                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.02)_0%,transparent_100%)] pointer-events-none rounded-xl" />
                                <p className="text-xl font-heading font-bold text-white">{topUp.tokens.toLocaleString()}</p>
                                <p className="text-xs text-[#ffd18a] uppercase tracking-wider mb-3">Tokens</p>
                                <p className="text-lg my-2 text-zinc-300 mb-5">₹{topUp.price}</p>
                                <button
                                    onClick={() => handlePayment(topUp.price, `${topUp.tokens} tokens top-up`)}
                                    className="w-full inline-block rounded-lg border border-white/20 text-white bg-white/4 hover:bg-white/10 font-semibold py-2 px-4 transition-colors text-sm"
                                >
                                    Buy Now
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
