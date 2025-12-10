"use client";

import { Flame } from "lucide-react";
import { useLoginStreak } from "@/hooks/use-login-streak";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export const StreakCounter = () => {
    const { streak, loading } = useLoginStreak();

    if (loading) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/20 rounded-lg">
                <div className="w-5 h-5 bg-muted rounded animate-pulse" />
                <div className="w-8 h-4 bg-muted rounded animate-pulse" />
            </div>
        );
    }

    const currentStreak = streak?.current_streak || 0;
    const longestStreak = streak?.longest_streak || 0;

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20 cursor-pointer hover:from-orange-500/20 hover:to-red-500/20 transition-all touch-manipulation">
                    <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 animate-pulse" />
                    <span className="text-xs sm:text-sm font-bold text-foreground">
                        {currentStreak}
                    </span>
                </div>
            </TooltipTrigger>
            <TooltipContent>
                <div className="space-y-1">
                    <p className="font-medium">
                        Current Streak: {currentStreak} {currentStreak === 1 ? "day" : "days"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Longest: {longestStreak} {longestStreak === 1 ? "day" : "days"}
                    </p>
                </div>
            </TooltipContent>
        </Tooltip>
    );
};
