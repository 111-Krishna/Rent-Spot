import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Overview from "@/components/Overview";
import Features from "@/components/Features";
import Architecture from "@/components/Architecture";
import Team from "@/components/Team";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Overview />
      <Features />
      <Architecture />
      <Team />
      <Footer />
    </div>
  );
};

export default Index;
