import heroBg from "@/assets/hero-bg.jpg";
import { SignInButton, useAuth } from "@clerk/clerk-react";

const Hero = () => {
  const {isSignedIn} = useAuth()
  return (
    <section className="relative h-screen w-full overflow-hidden">
      <img
        src={heroBg}
        alt="Modern rental property building"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 hero-overlay" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-6">
        <h1 className="text-hero text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-center animate-fade-in-up">
          NEXT-GEN
          <br />
          RENTALS
        </h1>
        <p className="mt-6 text-center text-white/80 font-body text-base sm:text-lg max-w-2xl font-light animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          Seamless integration of booking systems with dynamic pricing
          algorithms for next-generation rental platforms
        </p>
        <div className="mt-10 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <a
            href={`${isSignedIn ? "/home" : "/sign-in"}`}
            className="text-label text-white/70 hover:text-white transition-colors flex flex-col items-center gap-2"
          >
            <span>Get Started</span>
            <span className="w-px h-8 bg-white/40" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
