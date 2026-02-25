import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, CreditCard, MapPin, Shield } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { SignInButton, UserButton, useAuth } from "@clerk/clerk-react";
import { bookingApi, paymentApi, propertyApi } from "@/lib/api";

const PaymentPage = () => {
  const { id = "" } = useParams();
  const { isSignedIn, getToken } = useAuth();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState("");

  const { data: property } = useQuery({
    queryKey: ["property", id, "payment"],
    queryFn: () => propertyApi.getPropertyById(id),
    enabled: Boolean(id),
  });

  const payMutation = useMutation({
    mutationFn: async () => {
      if (!property) throw new Error("Property not found");
      if (!startDate || !endDate) throw new Error("Please select start and end dates.");
      if (new Date(endDate) <= new Date(startDate)) throw new Error("End date must be after start date.");

      const token = await getToken();
      if (!token) throw new Error("Please sign in to complete payment.");

      // 1. Create booking
      const booking = await bookingApi.createBooking(
        { propertyId: property._id, startDate, endDate },
        token
      );

      // 2. Create Stripe Checkout Session
      const result = await paymentApi.createCheckoutSession(
        {
          bookingId: booking._id,
          propertyId: property._id,
          amount: property.price,
          propertyTitle: property.title,
        },
        token
      );

      // If payments are disabled, show message
      if ("message" in result && !("url" in result)) {
        return (result as { message: string }).message;
      }

      // 3. Redirect to Stripe Checkout
      const checkoutUrl = (result as { url?: string }).url;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
        return "Redirecting to Stripe...";
      }

      throw new Error("Failed to create checkout session.");
    },
    onSuccess: (msg) => setMessage(msg),
    onError: (error) => setMessage((error as Error).message),
  });

  const handlePay = () => {
    setMessage("");
    payMutation.mutate();
  };

  // Calculate number of days
  const days =
    startDate && endDate
      ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

  return (
    <main className="min-h-screen bg-black bg-grid bg-glow px-4 py-8 text-foreground md:px-8">
      {/* Top bar */}
      <div className="mx-auto mb-6 flex w-full max-w-3xl items-center justify-between">
        <Link
          to={id ? `/home/${id}` : "/home"}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm hover:border-foreground transition"
        >
          <ArrowLeft size={16} /> Back to Property
        </Link>
        {isSignedIn && <UserButton />}
      </div>

      <div className="mx-auto max-w-3xl space-y-6">
        {/* Property card */}
        <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-2xl">
          <img
            src={
              property?.images?.[0]
                ? `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/${property.images[0]}`
                : "https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&q=80"
            }
            alt={property?.title || "Property"}
            className="h-56 w-full object-cover md:h-72"
          />

          <div className="p-6 md:p-8 space-y-6">
            {/* Property info */}
            <div>
              <h1 className="text-2xl font-bold md:text-3xl">{property?.title || "Loading..."}</h1>
              {property?.location && (
                <p className="mt-1 flex items-center gap-1.5 text-muted-foreground">
                  <MapPin size={16} /> {property.location}
                </p>
              )}
              <p className="mt-3 text-3xl font-bold text-primary">
                ₹{property?.price?.toLocaleString() || 0}<span className="text-base font-normal text-muted-foreground">/month</span>
              </p>
            </div>

            {/* Sign-in prompt */}
            {!isSignedIn && (
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="mb-3 text-sm text-muted-foreground">Please sign in to continue.</p>
                <SignInButton mode="modal">
                  <button
                    type="button"
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                  >
                    Sign In to Pay
                  </button>
                </SignInButton>
              </div>
            )}

            {/* Date selection */}
            <div className="space-y-3">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Calendar size={20} /> Select Rental Period
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm text-muted-foreground">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-12 w-full rounded-xl border border-input bg-background px-4"
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-muted-foreground">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-12 w-full rounded-xl border border-input bg-background px-4"
                    min={startDate || new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Order summary */}
            {days > 0 && (
              <div className="rounded-xl border border-border bg-background p-4 space-y-2">
                <h3 className="font-semibold">Order Summary</h3>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>₹{property?.price?.toLocaleString()}/month × {days} day{days > 1 ? "s" : ""}</span>
                  <span className="font-medium text-foreground">₹{property?.price?.toLocaleString()}</span>
                </div>
                <hr className="border-border" />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-primary">₹{property?.price?.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Pay button */}
            <button
              type="button"
              onClick={handlePay}
              className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-primary text-xl font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
              disabled={payMutation.isPending || !property || !isSignedIn || !startDate || !endDate}
            >
              <CreditCard size={22} />
              {payMutation.isPending ? "Processing..." : `Pay ₹${property?.price?.toLocaleString() || 0}`}
            </button>

            {/* Security notice */}
            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Shield size={14} /> Secured by Stripe. Your payment info is never stored on our servers.
            </p>

            {/* Status message */}
            {message && (
              <div className={`rounded-xl border p-4 text-sm ${message.includes("disabled") || message.includes("Error") || message.includes("Please")
                ? "border-destructive/30 bg-destructive/10 text-destructive"
                : "border-primary/30 bg-primary/10 text-primary"
                }`}>
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default PaymentPage;
