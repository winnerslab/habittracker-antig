"use client";

import { useState } from "react";
import { ArrowLeft, Check, X, Loader2, CreditCard, XCircle, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePaystackPayment } from "react-paystack";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubscription } from "@/hooks/use-subscription";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const SubscriptionPage = () => {
    const router = useRouter();
    const { user } = useAuth();
    const { subscription, loading, isPro, verifyPaystackPayment } = useSubscription();
    const [upgradeLoading, setUpgradeLoading] = useState(false);

    // Paystack Config
    const config = {
        reference: (new Date()).getTime().toString(),
        email: user?.email || "",
        amount: 5000, // 50.00 ZAR
        currency: "ZAR",
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
    };

    const initializePayment = usePaystackPayment(config);

    const onSuccess = async (reference: any) => {
        // Reference returned by Paystack might be an object or string depending on implementation
        // Usually it's an object { message: "Approved", reference: "..." }
        // But verifyPaystackPayment expects the reference string we sent (or the one returned).
        // Let's use the one we sent or the 'trxref' from return.

        // Paystack returns implementation: 
        // { reference: "...", message: "...", status: "success", trans: "..." }
        const refId = reference.reference || config.reference;

        try {
            setUpgradeLoading(true);
            await verifyPaystackPayment(refId);
            toast.success("Subscription upgraded successfully! 🚀");
        } catch (error: any) {
            console.error("Payment verification failed:", error);
            toast.error(error.message || "Payment successful but verification failed. Please contact support.");
        } finally {
            setUpgradeLoading(false);
        }
    };

    const onClose = () => {
        toast.info("Payment cancelled");
        setUpgradeLoading(false);
    };

    const handleUpgrade = () => {
        if (!user?.email) {
            toast.error("Please sign in to upgrade");
            return;
        }
        setUpgradeLoading(true);
        initializePayment({ onSuccess, onClose });
    };

    const handleManageBilling = () => {
        toast.info("To cancel or manage your subscription, please contact support or check your email.");
    };

    const features = [
        { name: "Track habits daily", free: true, pro: true },
        { name: "Daily streak tracking", free: true, pro: true },
        { name: "Monthly progress charts", free: true, pro: true },
        { name: "Achievement badges", free: true, pro: true },
        { name: "Maximum 3 habits", free: true, pro: false },
        { name: "Unlimited habits", free: false, pro: true },
        { name: "Priority support", free: false, pro: true },
        { name: "Early access to new features", free: false, pro: true },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push("/")}
                        className="shrink-0"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Subscription</h1>
                        <p className="text-muted-foreground">Manage your plan and billing</p>
                    </div>
                </div>

                {/* Current Plan Status */}
                <Card className="mb-8 border-primary/20">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {isPro ? (
                                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                                        <span className="text-2xl">🚀</span>
                                    </div>
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                        <span className="text-2xl">💪🏼</span>
                                    </div>
                                )}
                                <div>
                                    <CardTitle className="text-xl">
                                        {isPro ? "Pro Plan" : "Free Plan"}
                                    </CardTitle>
                                    <CardDescription>
                                        {isPro
                                            ? "Unlimited habits & premium features"
                                            : "Limited to 3 habits"}
                                    </CardDescription>
                                </div>
                            </div>
                            {isPro && (
                                <span className="px-3 py-1 bg-primary/20 text-primary text-sm font-medium rounded-full">
                                    Active
                                </span>
                            )}
                        </div>
                    </CardHeader>
                    {isPro && subscription?.current_period_end && (
                        <CardContent className="pt-0">
                            <p className="text-sm text-muted-foreground">
                                Next billing date: {new Date(subscription.current_period_end).toLocaleDateString()}
                            </p>
                        </CardContent>
                    )}
                </Card>


                {/* Pricing Comparison */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Free Plan */}
                    <Card className="border-border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <span className="text-2xl">💪🏼</span>
                                Free
                            </CardTitle>
                            <div className="mt-2">
                                <span className="text-3xl font-bold">€0</span>
                                <span className="text-muted-foreground">/month</span>
                            </div>
                            <CardDescription>Perfect for getting started</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                        {feature.free ? (
                                            <Check className="w-4 h-4 text-green-500 shrink-0" />
                                        ) : (
                                            <X className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                                        )}
                                        <span className={feature.free ? "text-foreground" : "text-muted-foreground/50"}>
                                            {feature.name}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            {!isPro && (
                                <div className="mt-6 p-3 bg-muted/50 rounded-lg text-center">
                                    <span className="text-sm text-muted-foreground">Your current plan</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Pro Plan */}
                    <Card className="border-primary relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-bl-lg">
                            RECOMMENDED
                        </div>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <span className="text-2xl">🚀</span>
                                Pro
                            </CardTitle>
                            <div className="mt-2">
                                <span className="text-3xl font-bold flex items-baseline gap-1">
                                    €2.50
                                </span>
                                <span className="text-muted-foreground">/month</span>
                            </div>
                            <CardDescription>For serious habit builders</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                        {feature.pro ? (
                                            <Check className="w-4 h-4 text-green-500 shrink-0" />
                                        ) : (
                                            <X className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                                        )}
                                        <span className={feature.pro ? "text-foreground" : "text-muted-foreground/50 line-through"}>
                                            {feature.name}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-6">
                                {isPro ? (
                                    <div className="p-3 bg-primary/20 rounded-lg text-center">
                                        <span className="text-sm text-primary font-medium">Your current plan</span>
                                    </div>
                                ) : (
                                    <Button
                                        onClick={handleUpgrade}
                                        className="w-full"
                                        disabled={upgradeLoading}
                                    >
                                        {upgradeLoading ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <span className="mr-2">🚀</span>
                                        )}
                                        Upgrade to Pro (Paystack)
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Billing Management */}
                <Card className="border-border">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            Billing Management
                            {!isPro && <Lock className="w-4 h-4 text-muted-foreground" />}
                        </CardTitle>
                        <CardDescription>
                            {isPro
                                ? "Manage your payment method"
                                : "Upgrade to Pro to access billing management features"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        <Button
                            variant="outline"
                            onClick={handleManageBilling}
                            disabled={!isPro}
                            className="justify-start h-auto py-3 px-4"
                        >
                            <CreditCard className="w-4 h-4 mr-3" />
                            <div className="flex flex-col items-start gap-0.5">
                                <span className="text-sm font-medium">Update Payment Method</span>
                            </div>
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleManageBilling}
                            disabled={!isPro}
                            className="justify-start h-auto py-3 px-4 text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/20"
                        >
                            <XCircle className="w-4 h-4 mr-3" />
                            <div className="flex flex-col items-start gap-0.5">
                                <span className="text-sm font-medium">Cancel Subscription</span>
                            </div>
                        </Button>
                    </CardContent>
                </Card>

                {/* Footer */}
                <p className="text-center text-xs text-muted-foreground mt-8">
                    Built for Winners by WinnersLab 🏆
                </p>
            </div>
        </div>
    );
};
