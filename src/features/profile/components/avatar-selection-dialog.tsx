"use client";

import { useState, useRef } from "react";
import Image, { StaticImageData } from "next/image";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Check, Lock, Award, Trophy, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

// Free avatars
import freeBusinesswoman from "@/assets/avatars/free-businesswoman.png";
import freeGymguy from "@/assets/avatars/free-gymguy.png";
import freeAthleteWoman from "@/assets/avatars/free-athlete-woman.png";
import freeCoolguy from "@/assets/avatars/free-coolguy.png";
import freeStrongwoman from "@/assets/avatars/free-strongwoman.png";
import freeChef from "@/assets/avatars/free-chef.png";

// Tier 1 - Week Warrior (7 days)
import tier1Pilot from "@/assets/avatars/tier1-pilot-woman.png";
import tier1Soccer from "@/assets/avatars/tier1-soccer.png";
import tier1Glam from "@/assets/avatars/tier1-glamwoman.png";
import tier1Tech from "@/assets/avatars/tier1-techguy.png";
import tier1Scientist from "@/assets/avatars/tier1-scientist.png";

// Tier 2 - Month Master (30 days)
import tier2Martial from "@/assets/avatars/tier2-martial.png";
import tier2Ceo from "@/assets/avatars/tier2-ceo-woman.png";
import tier2Astronaut from "@/assets/avatars/tier2-astronaut.png";
import tier2Yoga from "@/assets/avatars/tier2-yoga.png";
import tier2Racer from "@/assets/avatars/tier2-racer.png";

// Tier 3 - Century Champion (100 days)
import tier3Queen from "@/assets/avatars/tier3-queen.png";
import tier3King from "@/assets/avatars/tier3-king.png";
import tier3Soldier from "@/assets/avatars/tier3-soldier-woman.png";
import tier3Billionaire from "@/assets/avatars/tier3-billionaire.png";
import tier3Olympian from "@/assets/avatars/tier3-olympian.png";

// Legacy avatars
import hero1 from "@/assets/avatars/hero-1.png";
import hero2 from "@/assets/avatars/hero-2.png";
import hero3 from "@/assets/avatars/hero-3.png";
import villain1 from "@/assets/avatars/villain-1.png";
import villain2 from "@/assets/avatars/villain-2.png";
import villain3 from "@/assets/avatars/villain-3.png";

interface AvatarSelectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentAvatar: string | null;
    onSelectAvatar: (avatarUrl: string) => Promise<void>;
    onUploadAvatar: (file: File) => Promise<void>;
    longestStreak: number;
}

interface AvatarOption {
    id: string;
    src: StaticImageData;
    name: string;
    tier: 0 | 1 | 2 | 3; // 0 = free, 1 = 7 days, 2 = 30 days, 3 = 100 days
}

const FREE_AVATARS: AvatarOption[] = [
    { id: "free-businesswoman", src: freeBusinesswoman, name: "Power Boss", tier: 0 },
    { id: "free-gymguy", src: freeGymguy, name: "Gym Champion", tier: 0 },
    { id: "free-athlete-woman", src: freeAthleteWoman, name: "Athletic Star", tier: 0 },
    { id: "free-coolguy", src: freeCoolguy, name: "Cool Maverick", tier: 0 },
    { id: "free-strongwoman", src: freeStrongwoman, name: "Strong Queen", tier: 0 },
    { id: "free-chef", src: freeChef, name: "Master Chef", tier: 0 },
    // Legacy avatars
    { id: "hero-1", src: hero1, name: "Shadow Knight", tier: 0 },
    { id: "villain-1", src: villain1, name: "Crimson Crusader", tier: 0 },
    { id: "hero-2", src: hero2, name: "Cyber Guardian", tier: 0 },
    { id: "villain-2", src: villain2, name: "Mystic Shadow", tier: 0 },
    { id: "hero-3", src: hero3, name: "Golden Warrior", tier: 0 },
    { id: "villain-3", src: villain3, name: "Tech Prodigy", tier: 0 },
];

const TIER1_AVATARS: AvatarOption[] = [
    { id: "tier1-pilot", src: tier1Pilot, name: "Sky Ace", tier: 1 },
    { id: "tier1-soccer", src: tier1Soccer, name: "Goal Scorer", tier: 1 },
    { id: "tier1-glam", src: tier1Glam, name: "Glamorous Star", tier: 1 },
    { id: "tier1-tech", src: tier1Tech, name: "Tech Genius", tier: 1 },
    { id: "tier1-scientist", src: tier1Scientist, name: "Brilliant Mind", tier: 1 },
];

const TIER2_AVATARS: AvatarOption[] = [
    { id: "tier2-martial", src: tier2Martial, name: "Martial Master", tier: 2 },
    { id: "tier2-ceo", src: tier2Ceo, name: "CEO Queen", tier: 2 },
    { id: "tier2-astronaut", src: tier2Astronaut, name: "Space Pioneer", tier: 2 },
    { id: "tier2-yoga", src: tier2Yoga, name: "Zen Master", tier: 2 },
    { id: "tier2-racer", src: tier2Racer, name: "Speed Demon", tier: 2 },
];

const TIER3_AVATARS: AvatarOption[] = [
    { id: "tier3-queen", src: tier3Queen, name: "Warrior Queen", tier: 3 },
    { id: "tier3-king", src: tier3King, name: "Supreme King", tier: 3 },
    { id: "tier3-soldier", src: tier3Soldier, name: "Elite Warrior", tier: 3 },
    { id: "tier3-billionaire", src: tier3Billionaire, name: "Wealth Titan", tier: 3 },
    { id: "tier3-olympian", src: tier3Olympian, name: "Olympic Legend", tier: 3 },
];

const TIER_INFO = [
    { days: 0, label: "Free", icon: null, color: "text-muted-foreground", bgColor: "bg-muted/20" },
    { days: 7, label: "Week Warrior", icon: Award, color: "text-blue-500", bgColor: "bg-blue-500/10 border-blue-500/30" },
    { days: 30, label: "Month Master", icon: Trophy, color: "text-purple-500", bgColor: "bg-purple-500/10 border-purple-500/30" },
    { days: 100, label: "Century Champion", icon: Crown, color: "text-yellow-500", bgColor: "bg-yellow-500/10 border-yellow-500/30" },
];

export const AvatarSelectionDialog = ({
    open,
    onOpenChange,
    currentAvatar,
    onSelectAvatar,
    onUploadAvatar,
    longestStreak,
}: AvatarSelectionDialogProps) => {
    const [selectedAvatar, setSelectedAvatar] = useState<string | null>(currentAvatar);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isUnlocked = (tier: number) => {
        if (tier === 0) return true;
        return longestStreak >= TIER_INFO[tier].days;
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            return;
        }

        setUploading(true);
        try {
            await onUploadAvatar(file);
            onOpenChange(false);
        } catch (error) {
            console.error("Error uploading avatar:", error);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!selectedAvatar) return;

        setSaving(true);
        try {
            await onSelectAvatar(selectedAvatar);
            onOpenChange(false);
        } catch (error) {
            console.error("Error saving avatar:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarClick = (avatar: AvatarOption) => {
        if (isUnlocked(avatar.tier)) {
            // Use the static path string from the imported image
            setSelectedAvatar(avatar.src.src);
        }
    };

    const renderAvatarGrid = (avatars: AvatarOption[], tierIndex: number) => {
        const tierInfo = TIER_INFO[tierIndex];
        const unlocked = isUnlocked(tierIndex);
        const Icon = tierInfo.icon;

        return (
            <div key={tierIndex} className="space-y-3">
                {tierIndex > 0 && (
                    <div className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg border",
                        unlocked ? tierInfo.bgColor : "bg-muted/10 border-muted/30 opacity-60"
                    )}>
                        {Icon && <Icon className={cn("w-4 h-4", unlocked ? tierInfo.color : "text-muted-foreground")} />}
                        <span className={cn("text-sm font-medium", unlocked ? tierInfo.color : "text-muted-foreground")}>
                            {tierInfo.label}
                        </span>
                        {!unlocked && (
                            <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                {tierInfo.days} day streak
                            </span>
                        )}
                        {unlocked && tierIndex > 0 && (
                            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full ml-auto">
                                Unlocked
                            </span>
                        )}
                    </div>
                )}
                <div className="grid grid-cols-4 gap-2">
                    {avatars.map((avatar) => (
                        <button
                            key={avatar.id}
                            onClick={() => handleAvatarClick(avatar)}
                            disabled={!unlocked}
                            className={cn(
                                "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                                unlocked && "hover:scale-105",
                                selectedAvatar === avatar.src.src
                                    ? "border-primary ring-2 ring-primary/50"
                                    : unlocked
                                        ? "border-border hover:border-muted-foreground"
                                        : "border-muted/30 opacity-50 cursor-not-allowed"
                            )}
                        >
                            <Image
                                src={avatar.src}
                                alt={avatar.name}
                                className={cn(
                                    "w-full h-full object-cover",
                                    !unlocked && "filter grayscale"
                                )}
                            />
                            {selectedAvatar === avatar.src.src && unlocked && (
                                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                    <Check className="w-5 h-5 text-primary" />
                                </div>
                            )}
                            {!unlocked && (
                                <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                                    <Lock className="w-4 h-4 text-muted-foreground" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg bg-card border-border max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-foreground">Choose Your Avatar</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 overflow-y-auto flex-1 pr-2">
                    {/* Upload custom photo */}
                    <div className="flex flex-col items-center gap-3 p-4 border border-dashed border-border rounded-lg">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <Button
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="gap-2"
                        >
                            <Upload className="w-4 h-4" />
                            {uploading ? "Uploading..." : "Upload Photo"}
                        </Button>
                        <p className="text-xs text-muted-foreground">Max 2MB, JPG or PNG</p>
                    </div>

                    {/* Free avatars */}
                    <div>
                        <p className="text-sm text-muted-foreground mb-3">Choose a character</p>
                        {renderAvatarGrid(FREE_AVATARS, 0)}
                    </div>

                    {/* Tier 1 - Week Warrior */}
                    {renderAvatarGrid(TIER1_AVATARS, 1)}

                    {/* Tier 2 - Month Master */}
                    {renderAvatarGrid(TIER2_AVATARS, 2)}

                    {/* Tier 3 - Century Champion */}
                    {renderAvatarGrid(TIER3_AVATARS, 3)}
                </div>

                {/* Save button */}
                <div className="flex justify-end gap-2 pt-4 border-t border-border">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!selectedAvatar || saving}
                    >
                        {saving ? "Saving..." : "Save"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
