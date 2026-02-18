import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { bookingApi, paymentApi, propertyApi } from "@/lib/api";

const PropertyDetails = () => {
  const { id = "" } = useParams();
  const [token, setToken] = useState(localStorage.getItem("authToken") || "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");

  const { data: property, isLoading, error } = useQuery({
    queryKey: ["property", id],
    queryFn: () => propertyApi.getPropertyById(id),
    enabled: Boolean(id),
  });

  const bookingMutation = useMutation({
    mutationFn: async () => {
      localStorage.setItem("authToken", token);
      const booking = await bookingApi.createBooking({ propertyId: id, startDate, endDate }, token);
      const order = await paymentApi.createOrder({
        amount: property?.price || 0,
        bookingId: booking._id,
      });
      return { booking, order };
    },
    onSuccess: ({ booking, order }) => {
      if ("message" in order) {
        setBookingMessage(`Booking created (${booking.status}). ${order.message}`);
        return;
      }

      setBookingMessage(`Booking created (${booking.status}). Payment order: ${order.id}`);
    },
    onError: (mutationError) => {
      setBookingMessage((mutationError as Error).message);
    },
  });

  if (isLoading) return <p className="p-6">Loading property details...</p>;
  if (error || !property) return <p className="p-6 text-destructive">Unable to load property.</p>;

  const images = property.images?.length
    ? property.images.map((image) => `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/${image}`)
    : ["https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&q=80"];

  return (
    <main className="min-h-screen bg-background px-6 py-10 md:px-10">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-5">
        <section className="space-y-4 lg:col-span-3">
          <img src={images[0]} alt={property.title} className="h-96 w-full rounded-xl object-cover" />
          <div className="grid grid-cols-3 gap-3">
            {images.slice(1, 4).map((image) => (
              <img key={image} src={image} alt={property.title} className="h-28 w-full rounded-md object-cover" />
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-6 lg:col-span-2">
          <h1 className="text-3xl font-bold">{property.title}</h1>
          <p className="mt-1 text-muted-foreground">{property.location || "Unknown location"}</p>
          <p className="mt-4">{property.description || "No description provided."}</p>
          <p className="mt-6 text-xl font-semibold">₹{property.price.toLocaleString()} / month</p>

          <div className="mt-8 space-y-3">
            <h2 className="text-lg font-semibold">Book this property</h2>
            <input
              placeholder="JWT token"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3"
              />
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3"
              />
            </div>

            <button
              type="button"
              className="h-10 w-full rounded-md bg-primary text-primary-foreground"
              onClick={() => bookingMutation.mutate()}
              disabled={bookingMutation.isPending || !startDate || !endDate || !token}
            >
              {bookingMutation.isPending ? "Processing..." : "Book & Pay"}
            </button>

            {bookingMessage && <p className="text-sm text-muted-foreground">{bookingMessage}</p>}
          </div>
        </section>
      </div>
    </main>
  );
};

export default PropertyDetails;
