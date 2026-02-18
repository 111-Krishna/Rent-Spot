import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Search } from "lucide-react";
import { SignInButton, UserButton, useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import PropertyCard from "@/components/rental/PropertyCard";
import SearchSuggestions, { SuggestionItem } from "@/components/rental/SearchSuggestions";
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
  const { isSignedIn } = useAuth();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("trending");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();

  const { data = [], isLoading, isError, error } = useQuery({
    queryKey: ["properties", search],
    queryFn: () => propertyApi.getProperties(search),
  });

  const suggestions = useMemo<SuggestionItem[]>(() => {
    if (!search.trim()) return [];

    return data
      .filter((property) =>
        `${property.title} ${property.location || ""}`.toLowerCase().includes(search.toLowerCase()),
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
      const normalized = `${property.title} ${property.location || ""} ${property.description || ""}`.toLowerCase();
      return keywords.some((keyword) => normalized.includes(keyword));
    });
  }, [data, activeCategory]);

  const handleSuggestionPick = (item: SuggestionItem) => {
    setSearch(item.title);
    setShowSuggestions(false);
  };

  const handleSearchInput = (value: string) => {
    setSearch(value);
    setShowSuggestions(Boolean(value.trim()));
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-8">
          <Link to="/home" className="text-lg font-semibold tracking-tight text-rose-400 md:text-xl">
            Private Property Rental
          </Link>

          <div className="relative order-3 w-full md:order-2 md:flex-1 md:max-w-xl">
            <div className="flex items-center gap-2">
              <input
                value={search}
                onChange={(event) => handleSearchInput(event.target.value)}
                onFocus={() => setShowSuggestions(Boolean(search.trim()))}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
                placeholder="Search by location, title..."
                className="h-11 w-full rounded-full border border-input bg-card px-4 text-sm md:h-12 md:px-6 md:text-base"
              />
              <button
                type="button"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-rose-500 px-4 text-sm font-medium text-white transition hover:bg-rose-400 md:h-12 md:px-6 md:text-base"
                onClick={() => navigate(`/home?search=${encodeURIComponent(search)}`)}
              >
                Search <Search size={16} />
              </button>
            </div>

            {showSuggestions && (
              <SearchSuggestions suggestions={suggestions} onPick={handleSuggestionPick} />
            )}
          </div>

          <div className="order-2 flex items-center gap-3 md:order-3">
            <Link to="/owner/list-property" className="hidden text-sm text-muted-foreground md:block">
              List Your Home
            </Link>
            <button className="rounded-full border border-border p-2" aria-label="menu">
              <Menu size={18} />
            </button>
            {isSignedIn ? (
              <UserButton />
            ) : (
              <SignInButton mode="modal">
                <button className="rounded-full border border-border px-3 py-2 text-xs">Sign In</button>
              </SignInButton>
            )}
          </div>
        </div>

        <div className="mx-auto overflow-x-auto px-4 pb-3 md:px-8">
          <div className="flex min-w-max gap-6 text-sm text-muted-foreground md:gap-8">
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

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
        {isLoading && <p>Loading properties...</p>}
        {isError && <p className="text-destructive">{(error as Error).message}</p>}

        {!isLoading && !isError && filteredProperties.length === 0 && (
          <p className="rounded-xl border border-border bg-card p-6 text-muted-foreground">
            No properties found for this category/search.
          </p>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProperties.map((property) => (
            <PropertyCard key={property._id} property={property} />
          ))}
        </div>
      </section>
    </main>
  );
};

export default Home;
