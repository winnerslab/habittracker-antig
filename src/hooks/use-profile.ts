"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";

interface Profile {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
}

export const useProfile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .maybeSingle();

            if (error) {
                console.error("Error fetching profile:", error);
            } else if (data) {
                setProfile(data as Profile);
            }
            setLoading(false);
        };

        fetchProfile();
    }, [user]);

    const updateProfile = async (fullName: string) => {
        if (!user) return;

        const { error } = await supabase
            .from("profiles")
            .update({ full_name: fullName })
            .eq("id", user.id);

        if (error) {
            console.error("Error updating profile:", error);
        } else {
            setProfile((prev) => prev ? { ...prev, full_name: fullName } : null);
        }
    };

    const updateAvatar = async (avatarUrl: string) => {
        if (!user) return;

        const { error } = await supabase
            .from("profiles")
            .update({ avatar_url: avatarUrl })
            .eq("id", user.id);

        if (error) {
            console.error("Error updating avatar:", error);
            throw error;
        } else {
            setProfile((prev) => prev ? { ...prev, avatar_url: avatarUrl } : null);
        }
    };

    const uploadAvatar = async (file: File): Promise<string> => {
        if (!user) throw new Error("User not authenticated");

        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(filePath, file, { upsert: true });

        if (uploadError) {
            console.error("Error uploading file:", uploadError);
            throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
            .from("avatars")
            .getPublicUrl(filePath);

        await updateAvatar(publicUrl);
        return publicUrl;
    };

    return { profile, loading, updateProfile, updateAvatar, uploadAvatar };
};
