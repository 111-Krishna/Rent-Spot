import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, UserCircle2, Menu } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import PropertyCard from "@/components/rental/PropertyCard";
import SearchSuggestions, {
  SuggestionItem,
} from "@/components/rental/SearchSuggestions";
import { propertyApi } from "@/lib/api";

const categories = [
  { label: "Trending", value: "trending" },
  { label: "Houses", value: "houses" },
  { label: "Rooms", value: "rooms" },
  { label: "Farm Houses", value: "farm-houses" },
  { label: "Pool Houses", value: "pool-houses" },
  { label: "Tent Houses", value: "tent-houses" },
  { label: "Cabins", value: "cabins" },
  { label: "Shops", value: "shops" },
  { label: "Forest Houses", value: "forest-houses" },
];

const categoryKeywords: Record<string, string[]> = {
  trending: [],
  houses: ["house", "home", "villa", "flat", "apartment", "bungalow"],
  rooms: ["room", "studio", "hostel"],
  "farm-houses": ["farm", "farmhouse"],
  "pool-houses": ["pool"],
  "tent-houses": ["tent", "camp"],
  cabins: ["cabin", "hut", "cottage"],
  shops: ["shop", "store", "retail"],
  "forest-houses": ["forest", "woods", "nature"],
};

const Home = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("trending");
  const navigate = useNavigate();

  const {
    data = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["properties", search],
    queryFn: () => propertyApi.getProperties(search),
  });

  const suggestions = useMemo<SuggestionItem[]>(() => {
    if (!search.trim()) return [];

    return data
      .filter((property) =>
        `${property.title} ${property.location || ""}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      )
      .slice(0, 6)
      .map((property) => ({
        id: property._id,
        title: property.title,
        location: property.location || "Unknown",
        price: property.price,
      }));
  }, [data, search]);

  const filteredProperties = useMemo(() => {
    if (activeCategory === "trending") {
      return data;
    }

    const keywords = categoryKeywords[activeCategory] || [];
    return data.filter((property) => {
      const normalized =
        `${property.title} ${property.location || ""} ${property.description || ""}`.toLowerCase();
      return keywords.some((keyword) => normalized.includes(keyword));
    });
  }, [data, activeCategory]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          <Link
            to="/home"
            className="text-lg font-semibold tracking-tight text-rose-400 md:text-xl"
          >
            Private Property Rental
          </Link>

          <div className="relative hidden w-full max-w-xl items-center gap-3 md:flex">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by location, title..."
              className="h-12 w-full rounded-full border border-input bg-card px-6"
            />
            <button
              type="button"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-rose-500 px-6 font-medium text-white transition hover:bg-rose-400"
              onClick={() =>
                navigate(`/home?search=${encodeURIComponent(search)}`)
              }
            >
              Search <Search size={18} />
            </button>
            <SearchSuggestions suggestions={suggestions} onPick={setSearch} />
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/owner/list-property"
              className="hidden text-sm text-muted-foreground md:block"
            >
              List Your Home
            </Link>
            <button className="rounded-full border border-border p-2">
              <Menu size={18} />
            </button>
            <button className="rounded-full border border-border p-2">
              <UserCircle2 size={20} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center mx-auto overflow-x-auto px-4 pb-3 md:px-8">
          <div className="flex min-w-max gap-8 text-sm text-muted-foreground">
            {categories.map((category) => (
              <button
                key={category.value}
                type="button"
                onClick={() => setActiveCategory(category.value)}
                className={`border-b-2 pb-1 transition ${
                  activeCategory === category.value
                    ? "border-rose-400 text-foreground"
                    : "border-transparent hover:text-foreground"
                }`}
              >
                <span className="text-xs md:text-sm">{category.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        {isLoading && <p>Loading properties...</p>}
        {isError && (
          <p className="text-destructive">{(error as Error).message}</p>
        )}

        {!isLoading && !isError && filteredProperties.length === 0 && (
          <p className="rounded-xl border border-border bg-card p-6 text-muted-foreground">
            No properties found for this category/search.
          </p>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProperties.map((property) => (
            <PropertyCard key={property._id} property={property} />
          ))}
        </div>
      </section>
    </main>
  );
};

export default Home;
