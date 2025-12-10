"use client";

import { Trophy, Award, Crown, Lock } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface Milestone {
    days: number;
    title: string;
    description: string;
    icon: typeof Trophy;
    color: string;
    bgColor: string;
}

const MILESTONES: Milestone[] = [
    {
        days: 7,
        title: "Week Warrior",
        description: "7 days streak",
        icon: Award,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10 border-blue-500/30",
    },
    {
        days: 30,
        title: "Month Master",
        description: "30 days streak",
        icon: Trophy,
        color: "text-purple-500",
        bgColor: "bg-purple-500/10 border-purple-500/30",
    },
    {
        days: 100,
        title: "Century Champion",
        description: "100 days streak",
        icon: Crown,
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/10 border-yellow-500/30",
    },
];

interface AchievementBadgesProps {
    currentStreak: number;
    longestStreak: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const AchievementBadges = ({
    currentStreak,
    longestStreak,
    open,
    onOpenChange
}: AchievementBadgesProps) => {
    const getNextMilestone = () => {
        return MILESTONES.find((m) => m.days > currentStreak) || MILESTONES[MILESTONES.length - 1];
    };

    const nextMilestone = getNextMilestone();
    const progressToNext = nextMilestone ? (currentStreak / nextMilestone.days) * 100 : 100;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-card border-border z-50">
                <DialogHeader>
                    <DialogTitle>Streak Achievements</DialogTitle>
                    <DialogDescription>
                        Keep logging in daily to unlock these milestones
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Progress to next milestone */}
                    {currentStreak < MILESTONES[MILESTONES.length - 1].days && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Progress to {nextMilestone.title}
                                </span>
                                <span className="font-medium text-foreground">
                                    {currentStreak} / {nextMilestone.days} days
                                </span>
                            </div>
                            <Progress value={progressToNext} className="h-2" />
                        </div>
                    )}

                    {/* Achievement badges */}
                    <div className="grid grid-cols-1 gap-4">
                        {MILESTONES.map((milestone) => {
                            const isUnlocked = longestStreak >= milestone.days;
                            const Icon = milestone.icon;

                            return (
                                <div
                                    key={milestone.days}
                                    className={`p-4 rounded-lg border-2 transition-all ${isUnlocked
                                            ? `${milestone.bgColor} hover:scale-105`
                                            : "bg-muted/20 border-muted opacity-50"
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`flex items-center justify-center w-12 h-12 rounded-full ${isUnlocked ? milestone.bgColor : "bg-muted"
                                                }`}
                                        >
                                            {isUnlocked ? (
                                                <Icon className={`w-6 h-6 ${milestone.color}`} />
                                            ) : (
                                                <Lock className="w-6 h-6 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-foreground flex items-center gap-2">
                                                {milestone.title}
                                                {isUnlocked && (
                                                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                                                        Unlocked
                                                    </span>
                                                )}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {milestone.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Stats summary */}
                    <div className="pt-4 border-t border-border space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Current Streak</span>
                            <span className="font-medium text-foreground">{currentStreak} days</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Longest Streak</span>
                            <span className="font-medium text-foreground">{longestStreak} days</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Achievements Unlocked</span>
                            <span className="font-medium text-foreground">
                                {MILESTONES.filter((m) => longestStreak >= m.days).length} / {MILESTONES.length}
                            </span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
