import { FormEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { SignInButton, useAuth } from "@clerk/clerk-react";
import { propertyApi } from "@/lib/api";

const ListProperty = () => {
  const { isSignedIn, getToken } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");

  const createPropertyMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error("Please sign in to list your property.");
      }

      return propertyApi.createProperty(
        {
          title,
          description,
          location,
          price: Number(price),
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
    <main className="min-h-screen bg-background px-6 py-10 text-foreground md:px-10">
      <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-8 shadow-2xl">
        <h1 className="text-4xl font-bold">List your property</h1>
        <p className="mt-2 text-base text-muted-foreground">
          Add a premium home listing with monthly pricing, location and detailed description.
        </p>

        {!isSignedIn && (
          <div className="mt-6 rounded-xl border border-border bg-background p-4">
            <p className="mb-3 text-sm text-muted-foreground">
              You need to sign in with Clerk before creating a listing.
            </p>
            <SignInButton mode="modal">
              <button type="button" className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white">
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
          <textarea
            placeholder="Property description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-36 w-full rounded-xl border border-input bg-background px-4 py-3"
            required
          />

          <button
            className="mt-2 h-12 w-full rounded-xl bg-rose-500 text-lg font-semibold text-white transition hover:bg-rose-400 disabled:opacity-60"
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
