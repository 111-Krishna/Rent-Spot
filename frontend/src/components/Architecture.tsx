const layers = [
  {
    label: "FRONTEND",
    tech: "React.js",
    details: "Component-based UI with responsive design, real-time search, and property browsing interface.",
  },
  {
    label: "BACKEND",
    tech: "Node.js + Express",
    details: "RESTful API layer handling authentication, booking logic, and dynamic pricing calculations.",
  },
  {
    label: "DATABASE",
    tech: "MongoDB",
    details: "NoSQL storage for flexible property schemas, user profiles, booking records, and pricing history.",
  },
  {
    label: "PAYMENTS",
    tech: "Razorpay",
    details: "Integrated payment gateway with secure order creation, verification, and transaction management.",
  },
];

const Architecture = () => {
  return (
    <section id="architecture" className="py-24 md:py-32 px-6">
      <div className="container mx-auto">
        <p className="text-label text-muted-foreground mb-4">SYSTEM ARCHITECTURE</p>
        <h2 className="text-section-title gradient-title text-3xl sm:text-4xl md:text-5xl max-w-3xl">
          Full-stack MERN architecture with integrated payment flow
        </h2>

        <div className="mt-16 space-y-0">
          {layers.map((layer, i) => (
            <div
              key={layer.label}
              className="border-t border-border py-10 grid md:grid-cols-12 gap-6 items-start"
            >
              <div className="md:col-span-1">
                <span className="text-label text-muted-foreground">0{i + 1}</span>
              </div>
              <div className="md:col-span-3">
                <p className="text-label text-foreground">{layer.label}</p>
                <p className="text-section-title text-xl text-foreground mt-1">{layer.tech}</p>
              </div>
              <div className="md:col-span-8">
                <p className="text-muted-foreground font-body text-base leading-relaxed">
                  {layer.details}
                </p>
              </div>
            </div>
          ))}
          <div className="border-t border-border" />
        </div>
      </div>
    </section>
  );
};

export default Architecture;
