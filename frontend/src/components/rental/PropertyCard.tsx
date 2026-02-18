import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import type { Property } from "@/types/property";

type PropertyCardProps = {
  property: Property;
};

const PropertyCard = ({ property }: PropertyCardProps) => {
  const coverImage = property.images?.[0]
    ? `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/${property.images[0]}`
    : "https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&q=80";

  return (
    <Link
      to={`/home/${property._id}`}
      className="group overflow-hidden rounded-2xl border border-border bg-card/80 text-card-foreground shadow-lg transition duration-300 hover:-translate-y-1 hover:border-primary/30"
    >
      <div className="relative overflow-hidden">
        <img
          src={coverImage}
          alt={property.title}
          className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      <div className="space-y-2 p-4">
        <h3 className="line-clamp-1 text-2xl font-semibold">{property.title}</h3>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin size={15} /> {property.location || "Unknown location"}
        </p>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {property.description || "No description provided"}
        </p>
        <p className="pt-1 text-2xl font-semibold text-rose-400">₹{property.price.toLocaleString()}<span className="text-sm text-muted-foreground">/month</span></p>
      </div>
    </Link>
  );
};

export default PropertyCard;
