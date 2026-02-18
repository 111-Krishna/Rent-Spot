import { FormEvent, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { bookingApi, paymentApi, propertyApi } from "@/lib/api";

const PaymentPage = () => {
  const { id = "" } = useParams();
  const [token, setToken] = useState(localStorage.getItem("authToken") || "");
  const [name, setName] = useState("John Doe");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
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

      const booking = await bookingApi.createBooking({ propertyId: property._id, startDate, endDate }, token);
      const order = await paymentApi.createOrder({ amount: property.price, bookingId: booking._id });

      if ("message" in order) {
        return order.message;
      }

      const verifyResult = await paymentApi.verifyPayment({
        razorpay_order_id: order.id,
        razorpay_payment_id: `fake_pay_${Date.now()}`,
        razorpay_signature: "demo_signature",
        bookingId: booking._id,
      }).catch(() => ({ message: "Order created. Complete verification with real Razorpay signature." }));

      return verifyResult.message;
    },
    onSuccess: (successMessage) => setMessage(successMessage),
    onError: (error) => setMessage((error as Error).message),
  });

  const handlePay = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    localStorage.setItem("authToken", token);
    payMutation.mutate();
  };

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <img
          src={property?.images?.[0] ? `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/${property.images[0]}` : "https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&q=80"}
          alt={property?.title || "Property"}
          className="h-72 w-full rounded-2xl object-cover"
        />

        <form className="mt-6 space-y-4" onSubmit={handlePay}>
          <input
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="JWT token"
            className="h-12 w-full rounded-xl border border-input bg-background px-4"
            required
          />
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Cardholder Name"
            className="h-12 w-full rounded-xl border border-input bg-background px-4"
            required
          />
          <input
            value={cardNumber}
            onChange={(event) => setCardNumber(event.target.value)}
            placeholder="XXXX-XXXX-XXXX-XXXX"
            className="h-12 w-full rounded-xl border border-input bg-background px-4"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              value={expiry}
              onChange={(event) => setExpiry(event.target.value)}
              placeholder="MM/YY"
              className="h-12 rounded-xl border border-input bg-background px-4"
              required
            />
            <input
              value={cvv}
              onChange={(event) => setCvv(event.target.value)}
              placeholder="CVV"
              className="h-12 rounded-xl border border-input bg-background px-4"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="h-12 rounded-xl border border-input bg-background px-4"
              required
            />
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="h-12 rounded-xl border border-input bg-background px-4"
              required
            />
          </div>

          <button
            type="submit"
            className="h-14 w-full rounded-2xl bg-rose-500 text-4xl font-semibold text-white transition hover:bg-rose-400"
            disabled={payMutation.isPending || !property}
          >
            {payMutation.isPending ? "Processing..." : `Pay ₹${property?.price.toLocaleString() || 0}`}
          </button>

          {message && <p className="text-sm text-muted-foreground">{message}</p>}
        </form>
      </div>
    </main>
  );
};

export default PaymentPage;
