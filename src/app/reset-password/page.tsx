"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkSession = async () => {
            // Check if we have a session (handled by Supabase from the URL fragment)
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                // If no session immediately, wait briefly for Supabase to process the hash
                // This handles the race condition where the page loads before Supabase processes the #access_token
                const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                    if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
                        // Valid session established
                    }
                });

                // Fallback: If still no session after 2 seconds, redirect
                setTimeout(async () => {
                    const { data: { session: currentSession } } = await supabase.auth.getSession();
                    if (!currentSession) {
                        toast.error("Invalid or expired reset link. Please try again.");
                        router.push("/auth");
                    }
                }, 2000);

                return () => subscription.unsubscribe();
            }
        };

        checkSession();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({ password });

            if (error) {
                toast.error(error.message);
            } else {
                toast.success("Password updated successfully!");
                router.push("/");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-foreground">Reset Password</h1>
                    <p className="text-muted-foreground">Enter your new password below</p>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-foreground">New Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="bg-background border-border text-foreground"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="bg-background border-border text-foreground"
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Updating..." : "Update Password"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
