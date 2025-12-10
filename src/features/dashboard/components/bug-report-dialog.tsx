import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

interface BugReportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const BugReportDialog = ({ open, onOpenChange }: BugReportDialogProps) => {
    const [summary, setSummary] = useState("");
    const [description, setDescription] = useState("");
    const [stepsToReproduce, setStepsToReproduce] = useState("");
    const [severity, setSeverity] = useState("medium");
    const [contactEmail, setContactEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const resetForm = () => {
        setSummary("");
        setDescription("");
        setStepsToReproduce("");
        setSeverity("medium");
        setContactEmail("");
        setError(null);
    };

    const handleSubmit = async () => {
        if (!summary.trim()) {
            setError("Please enter a summary");
            return;
        }
        if (!description.trim()) {
            setError("Please enter a description");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const { data, error: fnError } = await supabase.functions.invoke("report-bug", {
                body: {
                    summary: summary.trim(),
                    description: description.trim(),
                    stepsToReproduce: stepsToReproduce.trim(),
                    severity,
                    contactEmail: contactEmail.trim(),
                },
            });

            if (fnError || !data?.ok) {
                throw new Error(data?.error || fnError?.message || "Failed to send bug report");
            }

            toast.success("Bug report sent, thank you!");
            resetForm();
            onOpenChange(false);
        } catch (err) {
            console.error("Error submitting bug report:", err);
            setError("Failed to submit bug report. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            resetForm();
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <span className="text-xl">🐛</span>
                        Report a Bug
                    </DialogTitle>
                    <DialogDescription>
                        Help us improve by describing the issue you encountered.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {error && (
                        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="summary">Summary *</Label>
                        <Input
                            id="summary"
                            placeholder="Brief summary of the issue"
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe the bug in detail..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="min-h-[100px] resize-none"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="steps">Steps to Reproduce</Label>
                        <Textarea
                            id="steps"
                            placeholder="1. Go to...&#10;2. Click on...&#10;3. See error"
                            value={stepsToReproduce}
                            onChange={(e) => setStepsToReproduce(e.target.value)}
                            className="min-h-[80px] resize-none"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="severity">Severity</Label>
                        <Select value={severity} onValueChange={setSeverity} disabled={isSubmitting}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select severity" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low - Minor issue</SelectItem>
                                <SelectItem value="medium">Medium - Affects usability</SelectItem>
                                <SelectItem value="high">High - Major functionality broken</SelectItem>
                                <SelectItem value="critical">Critical - App unusable</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Contact Email (optional)</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? "Sending..." : "Send Report"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
