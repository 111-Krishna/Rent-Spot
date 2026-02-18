type SearchSuggestionsProps = {
  suggestions: string[];
  onPick: (value: string) => void;
};

const SearchSuggestions = ({ suggestions, onPick }: SearchSuggestionsProps) => {
  if (!suggestions.length) return null;

  return (
    <div className="absolute left-0 right-0 top-12 z-20 rounded-md border border-border bg-popover p-1 shadow-lg">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          className="w-full rounded-sm px-3 py-2 text-left text-sm hover:bg-accent"
          onClick={() => onPick(suggestion)}
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
};

export default SearchSuggestions;
