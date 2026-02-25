import { useRef, useCallback } from "react";
import heroBg from "@/assets/hero-bg.jpg";
import { SignInButton, useAuth } from "@clerk/clerk-react";

const Hero = () => {
  const { isSignedIn } = useAuth();
  const imgRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    imgRef.current.style.transform = `perspective(1000px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.02)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!imgRef.current) return;
    imgRef.current.style.transform = "perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1)";
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-background">
      {/* Grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Tilt hero image */}
      <div
        ref={imgRef}
        className="absolute inset-0 transition-transform duration-200 ease-out"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <img
          src={heroBg}
          alt="Modern rental property building"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-6">
        <h1 className="text-hero gradient-title text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-center animate-fade-in-up">
          NEXT-GEN
          <br />
          RENTALS
        </h1>
        <p
          className="mt-6 text-center text-white/70 font-body text-base sm:text-lg max-w-2xl font-light animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          Seamless integration of booking systems with dynamic pricing
          algorithms for next-generation rental platforms
        </p>
        <div className="mt-10 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          {isSignedIn ? (
            <a
              href="/home"
              className="group text-label text-white/60 hover:text-white transition-colors flex flex-col items-center gap-2"
            >
              <span>Get Started</span>
              <span className="w-px h-8 bg-white/30 group-hover:bg-white/60 transition-colors" />
            </a>
          ) : (
            <SignInButton mode="modal">
              <button
                type="button"
                className="group text-label text-white/60 hover:text-white transition-colors flex flex-col items-center gap-2"
              >
                <span>Get Started</span>
                <span className="w-px h-8 bg-white/30 group-hover:bg-white/60 transition-colors" />
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
