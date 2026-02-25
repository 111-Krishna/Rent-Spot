import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { paymentApi } from "@/lib/api";

const PaymentSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get("session_id") || "";

    const { data, isLoading, isError } = useQuery({
        queryKey: ["payment-session", sessionId],
        queryFn: () => paymentApi.getSessionStatus(sessionId),
        enabled: Boolean(sessionId),
        refetchOnWindowFocus: false,
    });

    const isPaid = data?.status === "paid";

    if (!sessionId) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-black bg-grid bg-glow px-4 text-foreground">
                <div className="text-center space-y-4">
                    <XCircle className="mx-auto h-16 w-16 text-destructive" />
                    <h1 className="text-2xl font-bold">Invalid Session</h1>
                    <p className="text-muted-foreground">No payment session found.</p>
                    <Link
                        to="/home"
                        className="inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                    >
                        Browse Properties
                    </Link>
                </div>
            </main>
        );
    }

    if (isLoading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-black bg-grid bg-glow px-4 text-foreground">
                <div className="text-center space-y-4">
                    <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary" />
                    <h1 className="text-2xl font-bold">Verifying Payment...</h1>
                    <p className="text-muted-foreground">Please wait while we confirm your payment.</p>
                </div>
            </main>
        );
    }

    if (isError || !isPaid) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-black bg-grid bg-glow px-4 text-foreground">
                <div className="text-center space-y-4">
                    <XCircle className="mx-auto h-16 w-16 text-destructive" />
                    <h1 className="text-2xl font-bold">Payment Not Confirmed</h1>
                    <p className="text-muted-foreground">
                        We couldn't verify your payment. Please contact support if you were charged.
                    </p>
                    <Link
                        to="/home"
                        className="inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                    >
                        Back to Home
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-black bg-grid bg-glow px-4 text-foreground">
            <div className="mx-auto max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-2xl space-y-6">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">Payment Successful!</h1>
                    <p className="text-muted-foreground">
                        Your booking has been confirmed. Thank you for choosing RentSpot!
                    </p>
                </div>

                {data?.bookingId && (
                    <div className="rounded-xl border border-border bg-background p-4">
                        <p className="text-sm text-muted-foreground">Booking ID</p>
                        <p className="font-mono text-sm font-medium">{data.bookingId}</p>
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    <Link
                        to="/home"
                        className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                    >
                        Browse More Properties
                    </Link>
                </div>
            </div>
        </main>
    );
};

export default PaymentSuccessPage;
