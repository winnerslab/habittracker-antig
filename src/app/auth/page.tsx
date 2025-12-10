"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";

const authSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    fullName: z.string().min(1, "Please enter your full name").optional(),
});

export default function AuthPage() {
    const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string; fullName?: string }>({});
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
            setErrors({ fullName: "Please enter your full name" });
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
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/`,
                        data: {
                            full_name: fullName.trim(),
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
                    toast.success("Account created successfully!");
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
                    {/* Animated glowing border - Eclipse Effect */}
                    <div className="absolute -inset-[2px] rounded-lg overflow-hidden">
                        <div className="absolute inset-[-200%] bg-[conic-gradient(from_90deg_at_50%_50%,#00000000_50%,#22c55e00_60%,#22c55e20_80%,#22c55e_95%,#ffffff_100%)] animate-[spin_12s_linear_infinite]" />
                    </div>
                    {/* Inner black background to hide the full gradient, leaving only the border visible */}
                    <div className="absolute inset-[1px] bg-background rounded-lg z-0" />

                    <div className="bg-card border border-border/50 rounded-lg p-6 space-y-6 relative z-10 backdrop-blur-xl">
                        {mode === "forgot" ? (
                            <button
                                onClick={() => setMode("login")}
                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to login
                            </button>
                        ) : (
                            <div className="flex rounded-lg overflow-hidden border border-border">
                                <button
                                    type="button"
                                    onClick={() => setMode("login")}
                                    className={`flex-1 py-2.5 text-sm font-medium transition-colors ${mode === "login"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-transparent text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    Sign In
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMode("signup")}
                                    className={`flex-1 py-2.5 text-sm font-medium transition-colors ${mode === "signup"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-transparent text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    Sign Up
                                </button>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {mode === "signup" && (
                                <div className="space-y-4">
                                    <Label htmlFor="fullName" className="text-foreground">Full Name</Label>
                                    <Input
                                        id="fullName"
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="John Doe"
                                        className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                                        required
                                    />
                                    {errors.fullName && (
                                        <p className="text-sm text-destructive">{errors.fullName}</p>
                                    )}
                                </div>
                            )}

                            <div className="space-y-4">
                                <Label htmlFor="email" className="text-foreground">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                                    required
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive">{errors.email}</p>
                                )}
                            </div>

                            {mode !== "forgot" && (
                                <div className="space-y-4">
                                    <Label htmlFor="password" className="text-foreground">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                                        required
                                    />
                                    {errors.password && (
                                        <p className="text-sm text-destructive">{errors.password}</p>
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
                        </form>

                        {mode !== "forgot" && (
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-border" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                                </div>
                            </div>
                        )}

                        {mode !== "forgot" && (
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                disabled={loading}
                                onClick={async () => {
                                    setLoading(true);
                                    try {
                                        const { error } = await supabase.auth.signInAnonymously();
                                        if (error) {
                                            toast.error(error.message);
                                        } else {
                                            toast.success("Welcome! You can create an account later to save your data.");
                                        }
                                    } catch (error) {
                                        toast.error("An unexpected error occurred");
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                            >
                                Continue as Guest
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
