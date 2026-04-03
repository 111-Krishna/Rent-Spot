import { Link } from "react-router-dom";
import { MapPin, Pencil, Trash2 } from "lucide-react";
import type { Property } from "@/types/property";

type PropertyCardProps = {
  property: Property;
  isAdmin?: boolean;
  onEdit?: (property: Property) => void;
  onDelete?: (propertyId: string) => void;
};

const PropertyCard = ({ property, isAdmin, onEdit, onDelete }: PropertyCardProps) => {
  const coverImage = property.images?.[0]
    ? `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/${property.images[0]}`
    : "https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&q=80";

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card/80 text-card-foreground shadow-lg transition duration-300 hover:-translate-y-1 hover:border-primary/30">
      <Link to={`/home/${property._id}`}>
        <div className="relative overflow-hidden">
          <img
            src={coverImage}
            alt={property.title}
            className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>

        <div className="space-y-2 p-4">
          <h3 className="line-clamp-1 text-lg font-semibold leading-tight tracking-normal [font-variant-numeric:tabular-nums]">
            {property.title}
          </h3>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin size={15} /> {property.location || "Unknown location"}
          </p>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {property.description || "No description provided"}
          </p>
          <p className="pt-1 text-xl font-semibold text-foreground [font-variant-numeric:tabular-nums]">
            ₹{property.price.toLocaleString()}
            <span className="text-sm text-muted-foreground">/month</span>
          </p>
        </div>
      </Link>

      {/* Admin action buttons */}
      {isAdmin && (
        <div className="absolute right-2 top-2 z-10 flex gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit?.(property);
            }}
            className="rounded-lg bg-blue-500/90 p-2 text-white shadow-md backdrop-blur-sm transition hover:bg-blue-600"
            title="Edit listing"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete?.(property._id);
            }}
            className="rounded-lg bg-red-500/90 p-2 text-white shadow-md backdrop-blur-sm transition hover:bg-red-600"
            title="Delete listing"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default PropertyCard;
