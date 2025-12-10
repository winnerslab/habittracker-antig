"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/auth");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    backgroundColor: "hsl(220, 15%, 8%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <div style={{ textAlign: "center" }}>
                    <div
                        style={{
                            width: "40px",
                            height: "40px",
                            border: "3px solid hsl(220, 15%, 18%)",
                            borderTopColor: "hsl(142, 72%, 45%)",
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite",
                            margin: "0 auto 1rem",
                        }}
                    />
                    <style>
                        {`@keyframes spin { to { transform: rotate(360deg); } }`}
                    </style>
                    <p style={{ color: "hsl(220, 10%, 55%)", fontSize: "0.875rem" }}>Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null; // Or a loading spinner while redirecting
    }

    return <>{children}</>;
};
