import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Search, User, LogIn, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Discover", path: "/courses" },
  { label: "Community", path: "/community" },
  { label: "About", path: "/about" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate("/");
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "glass-terminal py-3" : "py-5 bg-transparent"
        }`}
      >
        <div className="max-w-[90rem] mx-auto px-6 md:px-10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-sm bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display text-sm font-bold">U</span>
            </div>
            <span className="font-display text-xl font-semibold tracking-tight">
              Uni<span className="text-primary">Learn</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium tracking-wide uppercase transition-colors hover:text-primary ${
                  location.pathname === link.path ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/courses"
              className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Search className="w-4 h-4" />
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Profile"
                >
                  <User className="w-4 h-4" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="hidden md:inline-flex items-center gap-2 border border-primary/40 text-primary px-4 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider hover:bg-primary/5 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" /> Log In/Sign In
              </Link>
            )}
            <button
              onClick={() => setMenuOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-sm border border-border/50 hover:border-primary/50 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Veil Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/20 z-[60]"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-full md:w-[480px] bg-background z-[70] flex flex-col"
            >
              <div className="p-6 md:p-10 flex justify-between items-center">
                <span className="font-display text-lg text-muted-foreground">Navigation</span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-sm border border-border/50 hover:border-primary/50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <nav className="flex-1 px-6 md:px-10 flex flex-col justify-center gap-2">
                {[
                  ...navLinks,
                  ...(isAuthenticated ? [{ label: "Profile", path: "/profile" }] : []),
                  ...(isAuthenticated ? [{ label: "Become a Tutor", path: "/become-tutor" }] : []),
                  ...(user?.role === "admin" ? [{ label: "New Course", path: "/admin/create-course" }] : []),
                ].map((link, i) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                  >
                    <Link
                      to={link.path}
                      className={`block font-display text-4xl md:text-5xl font-semibold py-3 transition-colors hover:text-primary ${
                        location.pathname === link.path ? "text-primary" : ""
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + (navLinks.length + 1) * 0.06 }}
                >
                  {isAuthenticated ? (
                    <button
                      onClick={handleLogout}
                      className="font-display text-4xl md:text-5xl font-semibold py-3 transition-colors hover:text-primary text-left"
                    >
                      Log Out
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="block font-display text-4xl md:text-5xl font-semibold py-3 transition-colors hover:text-primary"
                    >
                      Log In
                    </Link>
                  )}
                </motion.div>
              </nav>
              <div className="p-6 md:p-10 border-t border-border/50">
                <p className="text-sm text-muted-foreground">
                  Knowledge & Skill Sharing for University Students
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
