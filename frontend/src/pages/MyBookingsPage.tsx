import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { bookingApi } from "@/lib/api";
import type { PopulatedBooking } from "@/types/booking";
import { ArrowLeft, CalendarDays, MapPin, CheckCircle2, Clock, CreditCard, ExternalLink } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const BookingCard = ({ booking }: { booking: PopulatedBooking }) => {
    const property = booking.property;
    const imageUrl = property?.images?.length
        ? `${API_BASE_URL}/${property.images[0]}`
        : "https://images.unsplash.com/photo-1494526585095-c41746248156?w=600&q=80";

    const now = new Date();
    const isActive = new Date(booking.endDate) >= now;

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-border bg-card backdrop-blur-sm transition-all duration-300 hover:border-border hover:shadow-lg">
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={imageUrl}
                    alt={property?.title || "Property"}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Status badge */}
                <div className="absolute left-4 top-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-md ${isActive
                        ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-300"
                        : "border border-white/10 bg-white/10 text-gray-300"
                        }`}>
                        {isActive ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {isActive ? "Active" : "Completed"}
                    </span>
                </div>

                {/* Price overlay — stays white on image */}
                <div className="absolute bottom-4 left-4">
                    <p className="text-2xl font-bold text-white">
                        ₹{(booking.priceTotal ?? property?.price ?? 0).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-4 p-5">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">
                        {property?.title || "Property Unavailable"}
                    </h3>
                    {property?.location && (
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                            <MapPin size={13} /> {property.location}
                        </p>
                    )}
                </div>

                {/* Date range */}
                <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/50 px-4 py-3">
                    <CalendarDays size={16} className="shrink-0 text-muted-foreground" />
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-foreground/80">{formatDate(booking.startDate)}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="text-foreground/80">{formatDate(booking.endDate)}</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-border pt-4">
                    <div className="flex items-center gap-2">
                        <CreditCard size={14} className="text-muted-foreground" />
                        {booking.paidAt ? (
                            <span className="text-xs text-muted-foreground">
                                Paid {formatDate(booking.paidAt)}
                            </span>
                        ) : (
                            <span className="text-xs text-muted-foreground">Payment confirmed</span>
                        )}
                    </div>
                    {property && (
                        <Link
                            to={`/home/${property._id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition hover:bg-accent"
                        >
                            View <ExternalLink size={11} />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

const MyBookingsPage = () => {
    const { getToken } = useAuth();

    const { data: bookings = [], isLoading, isError } = useQuery({
        queryKey: ["my-bookings"],
        queryFn: async () => {
            const token = await getToken();
            if (!token) throw new Error("Please sign in to view bookings");
            return bookingApi.getUserBookings(token);
        },
    });

    const now = new Date();
    const confirmedBookings = bookings.filter((b) => b.status === "confirmed");
    const currentBookings = confirmedBookings.filter((b) => new Date(b.endDate) >= now);
    const pastBookings = confirmedBookings.filter((b) => new Date(b.endDate) < now);

    return (
        <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
            {/* Background grid */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(hsl(var(--foreground) / 0.5) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground) / 0.5) 1px, transparent 1px)`,
                    backgroundSize: "60px 60px",
                }}
            />
            {/* Radial fade */}
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    background: "radial-gradient(ellipse 80% 50% at 50% -10%, hsl(var(--foreground) / 0.04), transparent)",
                }}
            />

            <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 md:px-10">
                {/* Header */}
                <div className="mb-10 flex items-center gap-4">
                    <Link
                        to="/home"
                        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-accent"
                    >
                        <ArrowLeft size={16} /> Back
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">My Bookings</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {confirmedBookings.length} confirmed {confirmedBookings.length === 1 ? "booking" : "bookings"}
                        </p>
                    </div>
                    <ThemeToggle />
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
                    </div>
                )}

                {/* Error */}
                {isError && (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
                        <p className="text-red-400">Failed to load bookings. Please try again.</p>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !isError && confirmedBookings.length === 0 && (
                    <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-12 text-center backdrop-blur">
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-muted">
                            <CalendarDays size={28} className="text-muted-foreground" />
                        </div>
                        <h2 className="text-xl font-semibold text-foreground">No confirmed bookings</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Browse properties and complete a payment to see your bookings here.
                        </p>
                        <Link
                            to="/home"
                            className="mt-6 inline-block rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                        >
                            Browse Properties
                        </Link>
                    </div>
                )}

                {/* Current Bookings */}
                {currentBookings.length > 0 && (
                    <section className="mb-12">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                                <CheckCircle2 size={16} className="text-emerald-400" />
                            </div>
                            <h2 className="text-lg font-semibold text-foreground">Active Bookings</h2>
                            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                                {currentBookings.length}
                            </span>
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {currentBookings.map((booking) => (
                                <BookingCard key={booking._id} booking={booking} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Past Bookings */}
                {pastBookings.length > 0 && (
                    <section>
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                                <Clock size={16} className="text-muted-foreground" />
                            </div>
                            <h2 className="text-lg font-semibold text-muted-foreground">Past Bookings</h2>
                            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                                {pastBookings.length}
                            </span>
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {pastBookings.map((booking) => (
                                <BookingCard key={booking._id} booking={booking} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
};

export default MyBookingsPage;
