"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

function ReferralListenerContent() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const ref = searchParams.get("ref");
        if (ref) {
            localStorage.setItem("referral_code", ref);
        }
    }, [searchParams]);

    return null;
}

export function ReferralListener() {
    return (
        <Suspense fallback={null}>
            <ReferralListenerContent />
        </Suspense>
    );
}
