import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Gift } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

interface InviteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const InviteDialog = ({ open, onOpenChange }: InviteDialogProps) => {
    const { user } = useAuth();
    const [copied, setCopied] = useState(false);

    const inviteLink = typeof window !== "undefined" && user
        ? `${window.location.origin}/?ref=${user.id}`
        : "";

    const handleCopy = () => {
        if (!inviteLink) return;
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-card border-border">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Gift className="w-5 h-5 text-primary" />
                        Get 2 Months Free
                    </DialogTitle>
                    <DialogDescription>
                        Invite a friend to join INRSHA. When they sign up using your link, you'll get 2 months of Premium for free!
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            Your Personal Invite Link
                        </label>
                        <div className="flex gap-2">
                            <Input
                                value={inviteLink}
                                readOnly
                                className="bg-muted text-muted-foreground font-mono text-sm"
                            />
                            <Button size="icon" onClick={handleCopy} className="shrink-0" title="Copy Link">
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>
                        <div className="pt-2">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => {
                                    const subject = encodeURIComponent("Join me on INRSHA!");
                                    const body = encodeURIComponent(`Hey! I've been using INRSHA to build better habits. Join me here and let's crush our goals: ${inviteLink}`);
                                    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
                                }}
                            >
                                Send via Email
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
