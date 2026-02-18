export type SuggestionItem = {
  id: string;
  title: string;
  location: string;
  price: number;
};

type SearchSuggestionsProps = {
  suggestions: SuggestionItem[];
  onPick: (value: string) => void;
  onSelect?: () => void;
};

const SearchSuggestions = ({
  suggestions,
  onPick,
  onSelect,
}: SearchSuggestionsProps) => {
  if (!suggestions.length) return null;

  const handleSelect = (title: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onPick(title);
    onSelect?.();
  };

  return (
    <div className="absolute left-0 right-0 top-14 z-30 max-h-80 overflow-y-auto rounded-2xl border border-border bg-popover/95 p-2 shadow-2xl backdrop-blur">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion.id}
          type="button"
          className="w-full rounded-xl px-4 py-3 text-left transition hover:bg-accent"
          onClick={(e) => handleSelect(suggestion.title, e)}
        >
          <p className="text-lg font-semibold text-foreground">
            {suggestion.title}
          </p>
          <p className="text-sm text-muted-foreground">
            {suggestion.location} · ₹{suggestion.price.toLocaleString()}/mo
          </p>
        </button>
      ))}
    </div>
  );
};

export default SearchSuggestions;
