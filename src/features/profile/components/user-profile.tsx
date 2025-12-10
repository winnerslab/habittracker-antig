"use client";

import { Trophy, Camera, Flame, CreditCard, BadgeCheck } from "lucide-react";
import Image from "next/image";
import { useProfile } from "@/hooks/use-profile";
import { useLoginStreak } from "@/hooks/use-login-streak";
import { useSubscription } from "@/hooks/use-subscription";
import dynamic from "next/dynamic";

const AchievementBadges = dynamic(() => import("./achievement-badges").then((mod) => mod.AchievementBadges), { ssr: false });
const AvatarSelectionDialog = dynamic(() => import("./avatar-selection-dialog").then((mod) => mod.AvatarSelectionDialog), { ssr: false });
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface UserProfileProps {
    onSignOut: () => void;
}

export const UserProfile = ({ onSignOut }: UserProfileProps) => {
    const { profile, loading, updateAvatar, uploadAvatar } = useProfile();
    const { streak, loading: streakLoading } = useLoginStreak();
    const { isPro } = useSubscription();
    const [achievementsOpen, setAchievementsOpen] = useState(false);
    const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
    const router = useRouter();

    if (loading) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/20 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                <div className="w-20 h-4 bg-muted rounded animate-pulse hidden sm:block" />
            </div>
        );
    }

    const displayName = profile?.full_name || "Guest";
    const initials = displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const currentStreak = streak?.current_streak || 0;
    const longestStreak = streak?.longest_streak || 0;

    const handleSelectAvatar = async (avatarUrl: string) => {
        await updateAvatar(avatarUrl);
    };

    const handleUploadAvatar = async (file: File) => {
        await uploadAvatar(file);
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 h-auto hover:bg-muted/50 transition-colors touch-manipulation"
                    >
                        <div className="relative w-7 h-7 sm:w-8 sm:h-8">
                            {profile?.avatar_url ? (
                                <Image
                                    src={profile.avatar_url}
                                    alt={displayName}
                                    fill
                                    className="rounded-full object-cover"
                                    sizes="(max-width: 768px) 28px, 32px"
                                />
                            ) : (
                                <div className="flex items-center justify-center w-full h-full rounded-full bg-primary text-primary-foreground font-medium text-xs sm:text-sm">
                                    {initials}
                                </div>
                            )}
                        </div>
                        <div className="hidden sm:flex flex-col items-start gap-0.5">
                            <span className="text-xs sm:text-sm text-foreground font-medium leading-none">
                                {displayName}
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-wider leading-none text-muted-foreground">
                                {isPro ? "Premium User" : "Free User"}
                            </span>
                        </div>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-card border-border z-50">
                    <DropdownMenuItem disabled className="text-xs text-muted-foreground flex items-center gap-1">
                        {profile?.full_name || "Guest User"}
                        {isPro && (
                            <BadgeCheck className="w-3.5 h-3.5 text-green-500 fill-green-500/20" />
                        )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => setAvatarDialogOpen(true)}
                        className="cursor-pointer"
                    >
                        <Camera className="w-4 h-4 mr-2" />
                        Change Avatar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => setAchievementsOpen(true)}
                        className="cursor-pointer"
                    >
                        <Trophy className="w-4 h-4 mr-2" />
                        View Achievements
                    </DropdownMenuItem>
                    {!streakLoading && streak && (
                        <DropdownMenuItem disabled className="cursor-default opacity-100">
                            <Flame className="w-4 h-4 mr-2 text-green-500" />
                            <span className="text-muted-foreground">Best Streak:</span>
                            <span className="ml-1 font-semibold text-green-500">{streak.longest_streak} days</span>
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => router.push("/subscription")}
                        className="cursor-pointer"
                    >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Manage Subscription
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onSignOut} className="text-destructive cursor-pointer">
                        Sign Out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {!streakLoading && (
                <AchievementBadges
                    currentStreak={currentStreak}
                    longestStreak={longestStreak}
                    open={achievementsOpen}
                    onOpenChange={setAchievementsOpen}
                />
            )}

            <AvatarSelectionDialog
                open={avatarDialogOpen}
                onOpenChange={setAvatarDialogOpen}
                currentAvatar={profile?.avatar_url || null}
                onSelectAvatar={handleSelectAvatar}
                onUploadAvatar={handleUploadAvatar}
                longestStreak={longestStreak}
            />
        </>
    );
};
