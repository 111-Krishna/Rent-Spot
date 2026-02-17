const Footer = () => {
  return (
    <footer id="contact" className="py-16 px-6 border-t border-border">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <p className="text-label text-foreground tracking-widest text-sm">NEXRENT</p>
            <p className="mt-4 text-muted-foreground font-body text-sm max-w-sm leading-relaxed">
              A research project exploring seamless integration of booking systems with dynamic pricing algorithms for next-generation rental platforms.
            </p>
          </div>

          <div className="md:col-span-3">
            <p className="text-label text-foreground mb-4">NAVIGATION</p>
            <div className="flex flex-col gap-3">
              {["Overview", "Features", "Architecture", "Team"].map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  className="text-muted-foreground hover:text-foreground transition-colors font-body text-sm"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-4">
            <p className="text-label text-foreground mb-4">KEYWORDS</p>
            <div className="flex flex-wrap gap-2">
              {["Dynamic Pricing", "MERN Stack", "Razorpay", "Booking Systems", "Rental Platforms"].map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-body text-muted-foreground border border-border px-3 py-1"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground font-body text-xs">
            © 2025 Kalasalingam Academy of Research and Education. All rights reserved.
          </p>
          <p className="text-muted-foreground font-body text-xs">
            Computer Science Engineering Department
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
