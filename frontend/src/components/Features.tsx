import { Database, CreditCard, Users, BarChart3, Lock, Globe } from "lucide-react";

const features = [
  { icon: Database, title: "Property Management", desc: "Full CRUD operations for property listings with real-time availability tracking" },
  { icon: BarChart3, title: "Demand-Based Pricing", desc: "Algorithms adjust pricing based on seasons, booking density, and user demand" },
  { icon: CreditCard, title: "Stripe Payment Gateway", desc: "Secure payment processing with encrypted transaction handling" },
  { icon: Users, title: "Multi-Role System", desc: "Distinct interfaces for guests, property owners, and administrators" },
  { icon: Lock, title: "Clerk Authentication", desc: "Secure user sessions with Clerk-managed authentication and tokens" },
  { icon: Globe, title: "RESTful APIs", desc: "Clean API architecture connecting React frontend with Express.js backend" },
];

const Features = () => {
  return (
    <section id="features" className="py-24 md:py-32 px-6 section-alt">
      <div className="container mx-auto">
        <p className="text-label text-muted-foreground mb-4">FEATURES</p>
        <h2 className="text-section-title text-3xl sm:text-4xl md:text-5xl text-foreground max-w-2xl">
          Built for intelligence, security & scale
        </h2>

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-background p-10 flex flex-col gap-4 hover:bg-accent/50 transition-colors duration-300"
            >
              <f.icon className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-section-title text-lg text-foreground">{f.title}</h3>
              <p className="text-muted-foreground font-body text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
