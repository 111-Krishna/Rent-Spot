import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supportApi, type SupportContext, type SupportMessage } from "@/lib/api";

const defaultContext: SupportContext = {
  userRole: "Guest",
  city: "Goa",
  checkIn: "12 Mar 2026",
  checkOut: "15 Mar 2026",
  guests: "3 Adults",
  budget: "₹4000/night",
  listingName: "Ocean Breeze Studio",
  listingPrice: "₹3800/night",
  amenities: "Wifi, AC, Kitchen, Balcony, Beach 200m",
  houseRules: "No parties, Check-in after 2 PM",
  cancellation: "Free cancel within 48 hrs",
  conversationGoal: "User is deciding whether to book",
};

const SupportAssistantPage = () => {
  const [context, setContext] = useState<SupportContext>(defaultContext);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contextSummary = useMemo(
    () =>
      `${context.userRole || "Guest"} • ${context.city || "Unknown City"} • ${context.checkIn || "N/A"} → ${context.checkOut || "N/A"}`,
    [context],
  );

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    if (!input.trim() || isLoading) return;

    const text = input.trim();
    setInput("");
    setError(null);

    const nextMessages: SupportMessage[] = [
      ...messages,
      { role: "user", text },
    ];
    setMessages(nextMessages);

    try {
      setIsLoading(true);
      const response = await supportApi.chat({
        message: text,
        ...context,
      });

      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          text: response.reply,
        },
      ]);
    } catch (chatError) {
      setError((chatError as Error).message || "Unable to get support response");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground md:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="rounded-xl border border-border bg-card p-4">
          <div className="mb-4">
            <h1 className="text-xl font-semibold">StayMate Support</h1>
            <p className="text-sm text-muted-foreground">Context-aware support assistant</p>
          </div>

          <div className="space-y-3 text-sm">
            <label className="block">
              User Type
              <select
                className="mt-1 w-full rounded-md border border-input bg-background px-2 py-2"
                value={context.userRole || "Guest"}
                onChange={(e) => setContext({ ...context, userRole: e.target.value })}
              >
                <option>Guest</option>
                <option>Host</option>
              </select>
            </label>

            <label className="block">
              City
              <input
                className="mt-1 w-full rounded-md border border-input bg-background px-2 py-2"
                value={context.city || ""}
                onChange={(e) => setContext({ ...context, city: e.target.value })}
              />
            </label>

            <label className="block">
              Listing Name
              <input
                className="mt-1 w-full rounded-md border border-input bg-background px-2 py-2"
                value={context.listingName || ""}
                onChange={(e) => setContext({ ...context, listingName: e.target.value })}
              />
            </label>

            <p className="rounded-md bg-muted p-2 text-xs text-muted-foreground">{contextSummary}</p>
          </div>

          <Link to="/home" className="mt-4 inline-block text-sm text-primary underline">
            ← Back to listings
          </Link>
        </aside>

        <section className="flex min-h-[70vh] flex-col rounded-xl border border-border bg-card">
          <header className="border-b border-border p-4">
            <h2 className="text-lg font-medium">Support Chat</h2>
            <p className="text-sm text-muted-foreground">Ask about bookings, check-in, cancellation, payments, or policies.</p>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                Try: “Is early check-in possible?”
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[85%] rounded-lg p-3 text-sm ${
                  message.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {message.text}
              </div>
            ))}

            {isLoading && <p className="text-sm text-muted-foreground">StayMate is typing...</p>}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <form onSubmit={sendMessage} className="border-t border-border p-4">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question..."
                className="h-11 flex-1 rounded-md border border-input bg-background px-3 text-sm"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="h-11 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
};

export default SupportAssistantPage;
