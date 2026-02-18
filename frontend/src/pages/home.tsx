import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PropertyCard from "@/components/rental/PropertyCard";
import SearchSuggestions from "@/components/rental/SearchSuggestions";
import { propertyApi } from "@/lib/api";

const Home = () => {
  const [search, setSearch] = useState("");

  const { data = [], isLoading, isError, error } = useQuery({
    queryKey: ["properties", search],
    queryFn: () => propertyApi.getProperties(search),
  });

  const suggestions = useMemo(() => {
    if (!search.trim()) return [];

    const terms = data
      .flatMap((property) => [property.title, property.location])
      .filter(Boolean)
      .map((value) => value!.trim());

    return [...new Set(terms)]
      .filter((value) => value.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 5);
  }, [data, search]);

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Private Property Rental</h1>
            <p className="text-muted-foreground">Discover, book, and manage modern rental homes.</p>
          </div>
          <a
            href="/owner/list-property"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            List Your Home
          </a>
        </div>

        <div className="relative mb-8">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title or location..."
            className="h-11 w-full rounded-md border border-input bg-background px-4"
          />
          <SearchSuggestions suggestions={suggestions} onPick={setSearch} />
        </div>

        {isLoading && <p>Loading properties...</p>}

        {isError && <p className="text-destructive">{(error as Error).message}</p>}

        {!isLoading && !isError && data.length === 0 && <p>No properties found for your search.</p>}

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((property) => (
            <PropertyCard key={property._id} property={property} />
          ))}
        </section>
      </div>
    </main>
  );
};

export default Home;
