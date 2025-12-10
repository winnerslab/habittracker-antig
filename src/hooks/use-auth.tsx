"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (mounted) {
                    setSession(session);
                    setUser(session?.user ?? null);
                    setLoading(false);
                }
            }
        );

        // Get initial session with error handling
        supabase.auth.getSession()
            .then(({ data: { session }, error }) => {
                if (error) {
                    console.error("Auth session error:", error);
                }
                if (mounted) {
                    setSession(session);
                    setUser(session?.user ?? null);
                    setLoading(false);
                }
            })
            .catch((error) => {
                console.error("Failed to get auth session:", error);
                if (mounted) {
                    setLoading(false);
                }
            });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error("Sign out error:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
