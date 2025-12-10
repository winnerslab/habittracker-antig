import { ProtectedRoute } from "@/components/protected-route";
import { SubscriptionPage } from "@/features/subscription/components/subscription-page";

export default function Page() {
    return (
        <ProtectedRoute>
            <SubscriptionPage />
        </ProtectedRoute>
    );
}
