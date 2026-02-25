import { FormEvent, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, ImagePlus, X } from "lucide-react";
import { Link } from "react-router-dom";
import { SignInButton, UserButton, useAuth } from "@clerk/clerk-react";
import { propertyApi } from "@/lib/api";

const MAX_IMAGES = 4;
const HOUSE_TYPES = ["Houses", "Rooms", "Farm Houses", "Pool Houses", "Tent Houses", "Cabins", "Shops", "Forest Houses"] as const;

const ListProperty = () => {
  const { isSignedIn, getToken } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [houseType, setHouseType] = useState("");
  const [images, setImages] = useState<(File | null)[]>([null, null]);
  const [previews, setPreviews] = useState<(string | null)[]>([null, null]);
  const fileInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const handleImageChange = (index: number, file: File | null) => {
    // Revoke old preview URL to avoid memory leaks
    if (previews[index]) URL.revokeObjectURL(previews[index]!);

    const nextImages = [...images];
    const nextPreviews = [...previews];
    nextImages[index] = file;
    nextPreviews[index] = file ? URL.createObjectURL(file) : null;
    setImages(nextImages);
    setPreviews(nextPreviews);
  };

  const removeImage = (index: number) => {
    handleImageChange(index, null);
    if (fileInputRefs[index].current) fileInputRefs[index].current!.value = "";
  };

  const createPropertyMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error("Please sign in with Clerk to list your property.");
      }

      const selectedImages = images.filter((img): img is File => img !== null);

      return propertyApi.createProperty(
        {
          title,
          description,
          location,
          price: Number(price),
          houseType,
          images: selectedImages.length > 0 ? selectedImages : undefined,
        },
        token,
      );
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createPropertyMutation.mutate();
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground md:px-10">
      <div className="mx-auto mb-6 flex w-full max-w-4xl items-center justify-between">
        <Link
          to="/home"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm hover:border-foreground"
        >
          <ArrowLeft size={16} /> Back
        </Link>
        {isSignedIn && <UserButton />}
      </div>

      <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-card p-6 shadow-2xl md:p-8">
        <h1 className="text-section-title text-3xl md:text-4xl">List your property</h1>
        <p className="mt-2 text-base text-muted-foreground">
          Add a premium home listing with monthly pricing, location and detailed description.
        </p>

        {!isSignedIn && (
          <div className="mt-6 rounded-xl border border-border bg-background p-4">
            <p className="mb-3 text-sm text-muted-foreground">
              You need to sign in with Clerk before creating a listing.
            </p>
            <SignInButton mode="modal">
              <button type="button" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                Sign In to Continue
              </button>
            </SignInButton>
          </div>
        )}

        <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
          <input
            placeholder="Property title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-12 w-full rounded-xl border border-input bg-background px-4"
            required
          />
          <input
            placeholder="Location"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className="h-12 w-full rounded-xl border border-input bg-background px-4"
            required
          />
          <input
            placeholder="Monthly price"
            type="number"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            className="h-12 w-full rounded-xl border border-input bg-background px-4"
            required
          />
          <select
            value={houseType}
            onChange={(event) => setHouseType(event.target.value)}
            className="h-12 w-full rounded-xl border border-input bg-background px-4 text-foreground"
            required
          >
            <option value="" disabled>
              Select your house type
            </option>
            {HOUSE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <textarea
            placeholder="Property description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-36 w-full rounded-xl border border-input bg-background px-4 py-3"
            required
          />

          {/* ── Image uploads ── */}
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              Property images (up to {MAX_IMAGES})
            </p>
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: MAX_IMAGES }).map((_, idx) => (
                <div key={idx} className="relative">
                  <input
                    ref={fileInputRefs[idx]}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id={`image-upload-${idx}`}
                    onChange={(e) =>
                      handleImageChange(idx, e.target.files?.[0] ?? null)
                    }
                  />

                  {previews[idx] ? (
                    <div className="group relative overflow-hidden rounded-xl border border-input">
                      <img
                        src={previews[idx]!}
                        alt={`Preview ${idx + 1}`}
                        className="h-40 w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor={`image-upload-${idx}`}
                      className="flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-input bg-background text-muted-foreground transition hover:border-foreground hover:text-foreground"
                    >
                      <ImagePlus size={28} />
                      <span className="text-xs">Image {idx + 1}</span>
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            className="mt-2 h-12 w-full rounded-xl bg-primary text-lg font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
            disabled={createPropertyMutation.isPending || !isSignedIn}
          >
            {createPropertyMutation.isPending ? "Submitting..." : "Create Listing"}
          </button>

          {createPropertyMutation.isSuccess && (
            <p className="text-sm text-emerald-400">Property listed successfully.</p>
          )}
          {createPropertyMutation.isError && (
            <p className="text-sm text-destructive">{(createPropertyMutation.error as Error).message}</p>
          )}
        </form>
      </div>
    </main>
  );
};

export default ListProperty;
