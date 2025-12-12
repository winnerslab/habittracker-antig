"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { ArrowLeft, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const authSchema = z.object({
    email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
    fullName: z.string().optional(),
});




export default function AuthPage() {
    const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string; fullName?: string }>({});
    const [showVerification, setShowVerification] = useState(false);
    const router = useRouter();

    // Memoize tick animations - scattered across the background
    const ticks = useMemo(() =>
        [...Array(15)].map((_, i) => ({
            left: `${5 + (i * 7) % 90}%`,
            top: `${8 + (i * 11) % 85}%`,
            delay: `${i * 1.2}s`,
            duration: `${4 + (i % 3) * 2}s`,
        })), []
    );

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (session?.user) {
                    router.replace("/");
                }
            }
        );

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                router.replace("/");
            }
        });

        return () => subscription.unsubscribe();
    }, [router]);

    const validateForm = () => {
        if (mode === "forgot") {
            if (!email) {
                setErrors({ email: "Email is required" });
                return false;
            }
            const result = z.string().email().safeParse(email);
            if (!result.success) {
                setErrors({ email: "Please enter a valid email address" });
                return false;
            }
            setErrors({});
            return true;
        }

        const result = authSchema.safeParse({
            email,
            password,
            fullName: mode === "signup" ? fullName : undefined
        });
        if (!result.success) {
            const fieldErrors: { email?: string; password?: string; fullName?: string } = {};
            result.error.errors.forEach((err) => {
                if (err.path[0] === "email") fieldErrors.email = err.message;
                if (err.path[0] === "password") fieldErrors.password = err.message;
                if (err.path[0] === "fullName") fieldErrors.fullName = err.message;
            });
            setErrors(fieldErrors);
            return false;
        }

        // Additional validation for signup
        if (mode === "signup" && !fullName.trim()) {
            setErrors({ ...errors, fullName: "Please enter your full name" });
            return false;
        }

        setErrors({});
        return true;
    };

    const handleForgotPassword = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) {
                toast.error(error.message);
            } else {
                toast.success("Check your email for a password reset link!");
                setMode("login");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === "forgot") {
            handleForgotPassword();
            return;
        }

        if (!validateForm()) return;

        setLoading(true);

        try {
            if (mode === "login") {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) {
                    if (error.message.includes("Invalid login credentials")) {
                        toast.error("Invalid email or password. Please try again.");
                    } else {
                        toast.error(error.message);
                    }
                } else {
                    toast.success("Welcome back!");
                }
            } else {
                const referralCode = localStorage.getItem("referral_code");

                const { error, data } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/`,
                        data: {
                            full_name: fullName.trim(),
                            referred_by: referralCode, // Pass referral code in metadata
                        },
                    },
                });
                if (error) {
                    if (error.message.includes("User already registered")) {
                        toast.error("An account with this email already exists. Please log in instead.");
                    } else {
                        toast.error(error.message);
                    }
                } else {
                    await fetch("/api/notify-signup", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email, fullName }),
                    });

                    // Attempt to claim referral reward if code exists
                    if (referralCode && data.user) {
                        // We don't await this to avoid blocking the UI, or we can catch errors silently
                        fetch("/api/referrals/claim", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                referralCode,
                                newUserId: data.user.id
                            }),
                        }).catch(err => console.error("Referral claim failed:", err));
                    }

                    // Show verification dialog
                    setShowVerification(true);
                }
            }
        } catch (error: any) {
            toast.error("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };




    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background - Fizzling tick marks */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
                {ticks.map((tick, i) => (
                    <div
                        key={i}
                        className="absolute animate-fizzle text-xl sm:text-2xl"
                        style={{
                            left: tick.left,
                            top: tick.top,
                            animationDelay: tick.delay,
                            animationDuration: tick.duration,
                        }}
                    >
                        ✅
                    </div>
                ))}
            </div>
            <div className="w-full max-w-md space-y-8 relative z-10">
                <div className="text-center space-y-3">
                    <h1 className="text-3xl font-bold text-foreground">Habit Tracker</h1>
                    <p className={`text-lg text-muted-foreground ${mode === "login" ? "animate-text-shimmer bg-gradient-to-r from-muted-foreground via-foreground to-muted-foreground bg-[length:200%_100%] bg-clip-text text-transparent" : ""}`}>
                        {mode === "login" && (
                            <>
                                We are what we repeatedly do.
                                <br />
                                Excellence, then, is not an act, but a habit.
                            </>
                        )}
                        {mode === "signup" && "Create an account to get started"}
                        {mode === "forgot" && "Enter your email to reset password"}
                    </p>
                </div>

                <div className="relative group">
                    {/* Animated glowing border - Eclipse Effect with Intermittent Burnout */}
                    <div className="absolute -inset-[2px] rounded-lg overflow-hidden animate-burn-out">
                        <div className="absolute inset-[-200%] bg-[conic-gradient(from_90deg_at_50%_50%,#00000000_50%,#22c55e00_60%,#22c55e20_80%,#22c55e_95%,#ffffff_100%)] animate-[spin_12s_linear_infinite]" />
                    </div>
                    {/* Inner black background to hide the full gradient, leaving only the border visible */}
                    <div className="absolute inset-[1px] bg-background rounded-lg z-0" />

                    <div className="bg-card border border-border/50 rounded-lg p-8 space-y-8 relative z-10 backdrop-blur-xl">
                        {mode === "forgot" && (
                            <button
                                onClick={() => setMode("login")}
                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to login
                            </button>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {mode === "signup" && (
                                <div className="space-y-2">
                                    <Label htmlFor="fullName" className="text-foreground">
                                        Full Name {errors.fullName && <span className="text-red-500">*</span>}
                                    </Label>
                                    <Input
                                        id="fullName"
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="John Doe"
                                        className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                                    />
                                    {errors.fullName && (
                                        <p className="text-sm text-red-500">{errors.fullName}</p>
                                    )}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-foreground">
                                    Email {errors.email && <span className="text-red-500">*</span>}
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500">{errors.email}</p>
                                )}
                            </div>

                            {mode !== "forgot" && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password" className="text-foreground">
                                            Password {errors.password && <span className="text-red-500">*</span>}
                                        </Label>
                                        {mode === "login" && (
                                            <button
                                                type="button"
                                                onClick={() => setMode("forgot")}
                                                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                Forgot Password?
                                            </button>
                                        )}
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                                    />
                                    {errors.password && (
                                        <p className="text-sm text-red-500">{errors.password}</p>
                                    )}
                                </div>
                            )}

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading
                                    ? "Loading..."
                                    : mode === "login"
                                        ? "Sign In"
                                        : mode === "signup"
                                            ? "Create Account"
                                            : "Send Reset Link"}
                            </Button>

                            {mode !== "forgot" && (
                                <div className="text-center text-sm pt-2">
                                    <span className="text-muted-foreground">
                                        {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setMode(mode === "login" ? "signup" : "login")}
                                        className="text-primary hover:text-primary/80 font-medium transition-colors"
                                    >
                                        {mode === "login" ? "Sign Up" : "Sign In"}
                                    </button>
                                </div>
                            )}
                        </form>




                    </div>
                </div>
            </div>

            {/* Email Verification Dialog */}
            <Dialog open={showVerification} onOpenChange={setShowVerification}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <Mail className="w-6 h-6 text-primary" />
                        </div>
                        <DialogTitle className="text-center text-xl">Check your inbox! 📧</DialogTitle>
                        <DialogDescription className="text-center text-base pt-2">
                            We&apos;ve sent you a verification link. Please click it to verify your email address so we can get you started!
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center">
                        <Button
                            className="w-full sm:w-auto min-w-[120px]"
                            onClick={() => {
                                setShowVerification(false);
                                setMode("login");
                                toast.success("Redirecting to login...");
                            }}
                        >
                            Continue
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
