import { Link } from "react-router-dom";
import type { Property } from "@/types/property";

type PropertyCardProps = {
  property: Property;
};

const PropertyCard = ({ property }: PropertyCardProps) => {
  const coverImage = property.images?.[0] ? `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/${property.images[0]}` : "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=1200&q=80";

  return (
    <Link
      to={`/home/${property._id}`}
      className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <img src={coverImage} alt={property.title} className="h-52 w-full object-cover" />
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-1 text-xl font-semibold">{property.title}</h3>
        <p className="line-clamp-1 text-sm text-muted-foreground">{property.location || "Unknown location"}</p>
        <p className="line-clamp-2 text-sm">{property.description || "No description provided"}</p>
        <p className="pt-2 font-medium">₹{property.price.toLocaleString()} / month</p>
      </div>
    </Link>
  );
};

export default PropertyCard;
