import { useQuery } from "@tanstack/react-query";

type Property = {
  _id: string;
  title: string;
  description?: string;
  location?: string;
  price: number;
  images?: string[];
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const fetchProperties = async (): Promise<Property[]> => {
  const response = await fetch(`${API_BASE_URL}/api/properties`);

  if (!response.ok) {
    throw new Error("Failed to fetch properties");
  }

  return response.json();
};

const Home = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["properties"],
    queryFn: fetchProperties,
  });

  return (
    <main className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-3xl font-bold">Available Properties</h1>
        <p className="mb-8 text-muted-foreground">Live data coming from the backend API.</p>

        {isLoading && <p>Loading properties...</p>}

        {isError && (
          <p className="text-destructive">
            {(error as Error).message || "Something went wrong while loading properties."}
          </p>
        )}

        {data && data.length === 0 && <p>No properties found.</p>}

        {data && data.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {data.map((property) => (
              <article
                key={property._id}
                className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
              >
                <h2 className="text-xl font-semibold">{property.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{property.location || "Unknown location"}</p>
                <p className="mt-3 text-sm">{property.description || "No description provided."}</p>
                <p className="mt-4 font-medium">${property.price.toLocaleString()}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Home;
