import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Bot, ChevronDown, ChevronUp, Send, Sparkles, User } from "lucide-react";
import { UserButton, useAuth } from "@clerk/clerk-react";
import { supportApi, type SupportContext, type SupportMessage } from "@/lib/api";

/* ─── defaults ─── */
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

const suggestedQuestions = [
  { emoji: "🕐", text: "Is early check-in possible?" },
  { emoji: "❌", text: "What is the cancellation policy?" },
  { emoji: "📋", text: "What are the house rules?" },
  { emoji: "📶", text: "How do I get the Wi-Fi password?" },
  { emoji: "🅿️", text: "Where can I park my car?" },
  { emoji: "📅", text: "Can I modify my booking dates?" },
];

/* ─── component ─── */
const SupportAssistantPage = () => {
  const { isSignedIn } = useAuth();
  const [context, setContext] = useState<SupportContext>(defaultContext);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showContext, setShowContext] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const contextSummary = useMemo(
    () =>
      `${context.userRole || "Guest"} · ${context.city || "—"} · ${context.checkIn || "—"} → ${context.checkOut || "—"}`,
    [context],
  );

  /* auto-scroll to newest message */
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;
    setInput("");
    setError(null);

    const next: SupportMessage[] = [...messages, { role: "user", text }];
    setMessages(next);

    try {
      setIsLoading(true);
      const res = await supportApi.chat({ message: text, ...context });
      setMessages([...next, { role: "assistant", text: res.reply }]);
    } catch (err) {
      setError((err as Error).message || "Unable to get response");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSend(input.trim());
  };

  return (
    <main className="relative min-h-screen bg-background bg-grid bg-glow text-foreground">
      {/* ── top bar ── */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link
            to="/home"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back to listings</span>
          </Link>

          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-muted-foreground" />
            <span className="text-label text-xs tracking-widest">STAYMATE AI</span>
          </div>

          {isSignedIn && <UserButton />}
        </div>
      </header>

      {/* ── chat container ── */}
      <div className="mx-auto flex max-w-5xl flex-col" style={{ height: "calc(100vh - 3.5rem)" }}>
        {/* context bar — collapsible */}
        <div className="border-b border-border/40 bg-card/40 backdrop-blur">
          <button
            type="button"
            onClick={() => setShowContext(!showContext)}
            className="flex w-full items-center justify-between px-4 py-2.5 text-xs text-muted-foreground transition hover:text-foreground"
          >
            <span>{contextSummary}</span>
            {showContext ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showContext && (
            <div className="animate-fade-in grid gap-3 border-t border-border/30 px-4 py-3 sm:grid-cols-3">
              <label className="block text-xs text-muted-foreground">
                Role
                <select
                  className="mt-1 w-full rounded-lg border border-border/50 bg-background/60 px-2.5 py-2 text-sm text-foreground backdrop-blur"
                  value={context.userRole || "Guest"}
                  onChange={(e) => setContext({ ...context, userRole: e.target.value })}
                >
                  <option>Guest</option>
                  <option>Host</option>
                </select>
              </label>
              <label className="block text-xs text-muted-foreground">
                City
                <input
                  className="mt-1 w-full rounded-lg border border-border/50 bg-background/60 px-2.5 py-2 text-sm text-foreground backdrop-blur"
                  value={context.city || ""}
                  onChange={(e) => setContext({ ...context, city: e.target.value })}
                />
              </label>
              <label className="block text-xs text-muted-foreground">
                Listing
                <input
                  className="mt-1 w-full rounded-lg border border-border/50 bg-background/60 px-2.5 py-2 text-sm text-foreground backdrop-blur"
                  value={context.listingName || ""}
                  onChange={(e) => setContext({ ...context, listingName: e.target.value })}
                />
              </label>
            </div>
          )}
        </div>

        {/* ── messages area ── */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
          {messages.length === 0 ? (
            /* ── empty / welcome state ── */
            <div className="mx-auto flex max-w-lg flex-col items-center pt-8 text-center">
              {/* icon */}
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-border/50 bg-gradient-to-br from-card to-background shadow-2xl">
                <Bot size={36} className="text-foreground/80" />
              </div>

              <h2 className="text-section-title text-2xl md:text-3xl">How can I help?</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                I'm StayMate — your rental concierge. Ask anything about bookings, check-in, policies, or listings.
              </p>

              <div className="mt-8 grid w-full gap-2 sm:grid-cols-2">
                {suggestedQuestions.map((q) => (
                  <button
                    key={q.text}
                    type="button"
                    onClick={() => handleSend(q.text)}
                    disabled={isLoading}
                    className="group flex items-center gap-3 rounded-xl border border-border/50 bg-card/60 px-4 py-3 text-left text-sm text-foreground/80 backdrop-blur transition-all hover:border-foreground/30 hover:bg-card hover:text-foreground hover:shadow-lg disabled:opacity-50"
                  >
                    <span className="text-base">{q.emoji}</span>
                    <span>{q.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* ── message list ── */
            <div className="mx-auto max-w-2xl space-y-4">
              {messages.map((msg, i) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={`${msg.role}-${i}`}
                    className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {/* avatar */}
                    <div
                      className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${isUser
                          ? "bg-foreground text-background"
                          : "border border-border/60 bg-card text-foreground/70"
                        }`}
                    >
                      {isUser ? <User size={14} /> : <Bot size={14} />}
                    </div>

                    {/* bubble */}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${isUser
                          ? "rounded-tr-md bg-foreground text-background"
                          : "rounded-tl-md border border-border/40 bg-card/80 text-foreground/90 backdrop-blur"
                        }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}

              {/* typing indicator */}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-border/60 bg-card text-foreground/70">
                    <Bot size={14} />
                  </div>
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-border/40 bg-card/80 px-4 py-3 backdrop-blur">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-destructive">{error}</p>
          )}
        </div>

        {/* ── input bar ── */}
        <div className="border-t border-border/40 bg-card/30 backdrop-blur-xl">
          <form onSubmit={onSubmit} className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask StayMate anything..."
              className="h-11 flex-1 rounded-xl border border-border/50 bg-background/60 px-4 text-sm text-foreground placeholder:text-muted-foreground/60 backdrop-blur transition focus:border-foreground/40 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-foreground text-background transition hover:opacity-90 disabled:opacity-30"
            >
              <Send size={16} />
            </button>
          </form>
          <p className="pb-2 text-center text-[10px] text-muted-foreground/50">
            StayMate can make mistakes. Verify important info.
          </p>
        </div>
      </div>
    </main>
  );
};

export default SupportAssistantPage;
