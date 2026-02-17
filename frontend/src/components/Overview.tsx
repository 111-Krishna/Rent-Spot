import { TrendingUp, Shield, Zap } from "lucide-react";

const stats = [
  { value: "MERN", label: "Tech Stack" },
  { value: "Real-Time", label: "Dynamic Pricing" },
  { value: "Razorpay", label: "Payment Integration" },
  { value: "JWT", label: "Authentication" },
];

const highlights = [
  {
    icon: TrendingUp,
    title: "Dynamic Pricing",
    description:
      "Prices adapt in real-time based on seasonal demand, booking frequency, and market fluctuations to maximize revenue.",
  },
  {
    icon: Shield,
    title: "Secure Transactions",
    description:
      "Integrated Razorpay payment gateway ensures reliable and encrypted transaction processing for all users.",
  },
  {
    icon: Zap,
    title: "Scalable Architecture",
    description:
      "Built on the MERN stack for high performance, modularity, and seamless scaling from prototype to production.",
  },
];

const Overview = () => {
  return (
    <section id="overview" className="py-24 md:py-32 px-6">
      <div className="container mx-auto">
        {/* Section label */}
        <p className="text-label text-muted-foreground mb-4">OVERVIEW</p>
        <h2 className="text-section-title text-3xl sm:text-4xl md:text-5xl text-foreground max-w-3xl">
          Redefining rental platforms through intelligent automation
        </h2>

        <p className="mt-8 text-muted-foreground font-body text-base md:text-lg max-w-2xl font-light leading-relaxed">
          The increasing demand from online rental portals has showcased the limitations of traditional booking systems with static pricing. This project proposes a seamless integration of booking systems with dynamic pricing algorithms, balancing customer affordability with maximum profit for property owners.
        </p>

        {/* Stats bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-border pt-10">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-section-title text-2xl md:text-3xl text-foreground">
                {stat.value}
              </p>
              <p className="text-label text-muted-foreground mt-2">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Highlight cards */}
        <div className="mt-20 grid md:grid-cols-3 gap-10">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="group border border-border p-8 hover:bg-primary hover:border-primary transition-colors duration-500"
            >
              <item.icon className="w-6 h-6 text-foreground group-hover:text-primary-foreground transition-colors duration-500" />
              <h3 className="text-section-title text-xl text-foreground mt-6 group-hover:text-primary-foreground transition-colors duration-500">
                {item.title}
              </h3>
              <p className="text-muted-foreground font-body text-sm mt-4 leading-relaxed group-hover:text-primary-foreground/70 transition-colors duration-500">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Overview;
