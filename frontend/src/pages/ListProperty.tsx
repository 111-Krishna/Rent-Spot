import { FormEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { propertyApi } from "@/lib/api";

const ListProperty = () => {
  const [token, setToken] = useState(localStorage.getItem("authToken") || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");

  const createPropertyMutation = useMutation({
    mutationFn: () =>
      propertyApi.createProperty(
        {
          title,
          description,
          location,
          price: Number(price),
        },
        token,
      ),
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    localStorage.setItem("authToken", token);
    createPropertyMutation.mutate();
  };

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground md:px-10">
      <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-8 shadow-2xl">
        <h1 className="text-4xl font-bold">List your property</h1>
        <p className="mt-2 text-base text-muted-foreground">
          Add a premium home listing with monthly pricing, location and detailed description.
        </p>

        <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
          <input
            placeholder="Owner JWT token"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            className="h-12 w-full rounded-xl border border-input bg-background px-4"
            required
          />
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
            className="mt-2 h-12 w-full rounded-xl bg-rose-500 text-lg font-semibold text-white transition hover:bg-rose-400"
            disabled={createPropertyMutation.isPending}
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
