import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Check, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

interface UpgradeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const UpgradeDialog = ({ open, onOpenChange }: UpgradeDialogProps) => {
    const [loading, setLoading] = useState(false);

    const handleUpgrade = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                toast.error("Please sign in to upgrade");
                return;
            }

            const { data, error } = await supabase.functions.invoke("lemonsqueezy-checkout", {
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
            });

            if (error) {
                console.error("Checkout error:", error);
                toast.error("Failed to start checkout. Please try again.");
                return;
            }

            if (data?.checkoutUrl) {
                window.open(data.checkoutUrl, "_blank");
                onOpenChange(false);
            } else {
                toast.error("No checkout URL returned. Please contact support.");
            }
        } catch (error) {
            console.error("Upgrade error:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Crown className="h-6 w-6 text-yellow-500" />
                        Upgrade to Pro
                    </DialogTitle>
                    <DialogDescription>
                        Unlock unlimited habit tracking and become a true champion!
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="text-center">
                        <div className="text-4xl font-bold text-primary">€2.50</div>
                        <div className="text-sm text-muted-foreground">per month</div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <span>Unlimited habits</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <span>All achievement badges</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <span>Full analytics & insights</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <span>Priority support</span>
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button
                            onClick={handleUpgrade}
                            className="w-full"
                            size="lg"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Preparing checkout...
                                </>
                            ) : (
                                <>
                                    <Crown className="mr-2 h-4 w-4" />
                                    Upgrade Now
                                </>
                            )}
                        </Button>
                        <p className="text-xs text-center text-muted-foreground mt-3">
                            Secure payment via LemonSqueezy. Cancel anytime.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
