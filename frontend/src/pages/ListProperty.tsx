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
      <div className="mx-auto max-w-2xl rounded-xl border border-border bg-card p-6">
        <h1 className="text-3xl font-bold">List your property</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add a new home listing with monthly pricing for renters.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <input
            placeholder="Owner JWT token"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3"
            required
          />
          <input
            placeholder="Title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3"
            required
          />
          <input
            placeholder="Location"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3"
            required
          />
          <input
            placeholder="Monthly price"
            type="number"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3"
            required
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2"
            required
          />

          <button className="h-10 w-full rounded-md bg-primary text-primary-foreground" disabled={createPropertyMutation.isPending}>
            {createPropertyMutation.isPending ? "Submitting..." : "Create Listing"}
          </button>

          {createPropertyMutation.isSuccess && (
            <p className="text-sm text-emerald-500">Property listed successfully.</p>
          )}
          {createPropertyMutation.isError && (
            <p className="text-sm text-destructive">
              {(createPropertyMutation.error as Error).message}
            </p>
          )}
        </form>
      </div>
    </main>
  );
};

export default ListProperty;
