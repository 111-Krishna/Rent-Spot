import { useState } from "react";
import { Menu, X } from "lucide-react";
import { SignInButton, SignUpButton, useAuth, UserButton } from "@clerk/clerk-react";
import ThemeToggle from "@/components/ThemeToggle";

const navLinks = [
  { label: "OVERVIEW", href: "#overview" },
  { label: "FEATURES", href: "#features" },
  { label: "ARCHITECTURE", href: "#architecture" },
  { label: "TEAM", href: "#team" },
  { label: "CONTACT", href: "#contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { userId } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-6">
        <a href="#" className="text-label text-foreground tracking-widest text-sm">
          Private Property Rental
        </a>

        {/* Desktop */}


        <div>
          {userId ? (<div className="hidden md:flex items-center gap-10">

            <a href="/support" className="text-label text-muted-foreground hover:text-foreground transition-colors duration-300">SUPPORT</a>

            {navLinks.map((link) => (


              <a
                key={link.label}
                href={link.href}
                className="text-label text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                {link.label}

              </a>
            ))}
            <ThemeToggle />
            <UserButton />
          </div>
          )


            : (
              <div className="hidden md:flex items-center gap-10">

                <a href="/support" className="text-label text-muted-foreground hover:text-foreground transition-colors duration-300">SUPPORT</a>
                <ThemeToggle />
                <SignInButton />
                <SignUpButton />
              </div>
            )}
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          {userId && <UserButton />}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-foreground"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-background border-b border-border animate-fade-in">
          <div className="flex flex-col px-6 py-6 gap-5">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-label text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

        </div>
      )}
    </nav>
  );
};

export default Navbar;
