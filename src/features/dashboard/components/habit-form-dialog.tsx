import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Habit } from "@/lib/habits-data";
import { Separator } from "@/components/ui/separator";

interface HabitFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    habit?: Habit | null;
    onSave: (habit: Omit<Habit, "id"> & { id?: string }) => void;
    onDelete?: (id: string) => void;
    onResetHistory?: (id: string) => void;
}

const commonEmojis = ["⏰", "💪", "📚", "📝", "💰", "🎯", "🚫", "🌿", "📓", "🚿", "🧘", "💧", "🥗", "😴", "🏃", "🧹"];

export const HabitFormDialog = ({ open, onOpenChange, habit, onSave, onDelete, onResetHistory }: HabitFormDialogProps) => {
    const [name, setName] = useState(habit?.name || "");
    const [emoji, setEmoji] = useState(habit?.emoji || "✨");
    const [goal, setGoal] = useState(habit?.goal || 30);

    useEffect(() => {
        if (open) {
            if (habit) {
                setName(habit.name);
                setEmoji(habit.emoji);
                setGoal(habit.goal);
            } else {
                setName("");
                setEmoji("✨");
                setGoal(30);
            }
        }
    }, [habit, open]);

    const isEditing = !!habit;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        onSave({
            id: habit?.id,
            name: name.trim(),
            emoji,
            goal,
        });

        if (!isEditing) {
            setName("");
            setEmoji("✨");
            setGoal(30);
        }
        onOpenChange(false);
    };

    const handleDelete = () => {
        if (habit && onDelete) {
            onDelete(habit.id);
            onOpenChange(false);
        }
    };

    const handleResetHistory = () => {
        if (habit && onResetHistory) {
            onResetHistory(habit.id);
            onOpenChange(false);
        }
    };

    // Reset form when dialog opens with new habit
    const handleOpenChange = (newOpen: boolean) => {
        if (newOpen && habit) {
            setName(habit.name);
            setEmoji(habit.emoji);
            setGoal(habit.goal);
        } else if (newOpen && !habit) {
            setName("");
            setEmoji("✨");
            setGoal(30);
        }
        onOpenChange(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md bg-card border-border max-h-[85vh] overflow-y-auto rounded-xl">
                <DialogHeader>
                    <DialogTitle className="text-base sm:text-lg text-foreground">
                        {isEditing ? "Edit Habit" : "Add New Habit"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm text-foreground">Habit Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Daily Gym"
                            className="bg-background border-border text-foreground placeholder:text-muted-foreground text-base"
                            maxLength={50}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm text-foreground">Emoji</Label>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {commonEmojis.map((e) => (
                                <button
                                    key={e}
                                    type="button"
                                    onClick={() => setEmoji(e)}
                                    className={`w-11 h-11 sm:w-10 sm:h-10 text-lg sm:text-xl rounded-md transition-all touch-manipulation ${emoji === e
                                        ? "bg-primary/20 ring-2 ring-primary"
                                        : "bg-muted hover:bg-muted/80"
                                        }`}
                                >
                                    {e}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs sm:text-sm text-muted-foreground">Or enter custom:</span>
                            <Input
                                value={emoji}
                                onChange={(e) => setEmoji(e.target.value)}
                                className="w-14 sm:w-16 text-center bg-background border-border text-foreground text-base"
                                maxLength={2}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="goal" className="text-sm text-foreground">Monthly Goal (days)</Label>
                        <Input
                            id="goal"
                            type="number"
                            min={1}
                            max={31}
                            value={goal}
                            onChange={(e) => setGoal(Number(e.target.value))}
                            className="bg-background border-border text-foreground text-base"
                        />
                        <p className="text-xs text-muted-foreground">
                            How many days per month you want to complete this habit. Max once per day.
                        </p>
                    </div>

                    <div className="flex gap-2 sm:gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="flex-1 touch-manipulation"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1 touch-manipulation">
                            {isEditing ? "Save" : "Add Habit"}
                        </Button>
                    </div>

                    {isEditing && (
                        <>
                            <Separator className="my-2" />
                            <div className="space-y-2">
                                <p className="text-xs text-muted-foreground">Danger Zone</p>
                                <div className="flex flex-col gap-2">
                                    {onResetHistory && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleResetHistory}
                                            className="w-full touch-manipulation text-destructive border-destructive/50 hover:bg-destructive/10"
                                        >
                                            Reset Tracking History
                                        </Button>
                                    )}
                                    {onDelete && (
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            onClick={handleDelete}
                                            className="w-full touch-manipulation"
                                        >
                                            Delete Habit
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </form>
            </DialogContent>
        </Dialog>
    );
};
