import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Pencil, Tag, Trash2 } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { propertyApi } from "@/lib/api";
import { useUserRole } from "@/hooks/use-user-role";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

const PropertyDetails = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { isAdmin } = useUserRole();
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: property, isLoading, error } = useQuery({
    queryKey: ["property", id],
    queryFn: () => propertyApi.getPropertyById(id),
    enabled: Boolean(id),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      return propertyApi.deleteProperty(id, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      navigate("/home");
    },
  });

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate(undefined, {
      onSettled: () => setShowDeleteConfirm(false),
    });
  };

  if (isLoading) return <p className="p-6">Loading property details...</p>;
  if (error || !property) return <p className="p-6 text-destructive">Unable to load property.</p>;

  const images = property.images?.length
    ? property.images.map((image) => `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/${image}`)
    : [
      "https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&q=80",
      "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1200&q=80",
      "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=1200&q=80",
    ];

  return (
    <main className="min-h-screen bg-background bg-grid bg-glow px-4 py-8 text-foreground md:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-center justify-between">
          <Link
            to="/home"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2 text-lg hover:border-primary/40"
          >
            <ArrowLeft size={18} /> Back
          </Link>

          {/* Admin controls */}
          {isAdmin && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate(`/owner/list-property?edit=${property._id}`)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-500/10 px-4 py-2.5 text-sm font-medium text-blue-500 transition hover:bg-blue-500/20"
              >
                <Pencil size={15} /> Edit
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-500/20 disabled:opacity-50"
              >
                <Trash2 size={15} /> {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          )}
        </div>

        <section>
          <h1 className="text-section-title gradient-title text-4xl md:text-5xl">{property.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-6 text-xl text-muted-foreground">
            <p className="inline-flex items-center gap-2">
              <MapPin size={20} /> {property.location || "Unknown location"}
            </p>
            <p className="inline-flex items-center gap-2 text-lg font-semibold text-foreground">
              <Tag size={20} /> ₹{property.price.toLocaleString()}/month
            </p>
          </div>
        </section>

        <img src={images[selectedImage]} alt={property.title} className="h-[420px] w-full rounded-3xl object-cover" />

        <div className="flex gap-3 overflow-x-auto rounded-2xl border border-border bg-card p-3">
          {images.map((image, index) => (
            <button
              type="button"
              key={`${image}-${index}`}
              className={`overflow-hidden rounded-xl border-2 transition ${index === selectedImage ? "border-rose-500" : "border-transparent"
                }`}
              onClick={() => setSelectedImage(index)}
            >
              <img src={image} alt={`Preview ${index + 1}`} className="h-24 w-36 object-cover" />
            </button>
          ))}
        </div>

        <section className="rounded-3xl border border-border bg-card p-6 md:p-8">
          <h2 className="text-3xl font-semibold">Details</h2>
          <p className="mt-6 text-lg text-muted-foreground">
            {property.description || "Beautifully maintained property with premium amenities and modern comfort."}
          </p>

          <div className="mt-8 grid gap-5 text-lg">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="font-semibold">Location</span>
              <span className="text-muted-foreground">{property.location || "Unknown location"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold">Price</span>
              <span className="text-2xl font-semibold text-foreground md:text-3xl">₹{property.price.toLocaleString()}/month</span>
            </div>
          </div>
        </section>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => navigate(`/home/${property._id}/payment`)}
            className="rounded-full bg-primary px-10 py-4 text-xl font-semibold text-primary-foreground transition hover:opacity-90 md:text-2xl"
          >
            Book Now — ₹{property.price.toLocaleString()}/month
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Listing"
        description="Are you sure you want to delete this listing? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </main>
  );
};

export default PropertyDetails;
