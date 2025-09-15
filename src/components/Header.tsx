import { useState } from "react";
import { cx, dl } from "../utils/helper";
import { FaBars, FaTimes } from "react-icons/fa";

interface PlaygroundHeaderProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export const PlaygroundHeader = ({
  darkMode,
  setDarkMode,
}: PlaygroundHeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: "#colorblind", label: "Color Blind Check" },
    { href: "#escape", label: "Escape Room" },
    { href: "#screenreader", label: "Screen Reader Check" },
  ];

  return (
    <header
      className={cx(
        "fixed top-0 left-0 right-0 z-50 border-b transition-colors duration-300",
        dl("bg-white border-gray-200", "bg-gray-900 border-gray-700", darkMode)
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <a
          href="/"
          className={cx(
            "text-lg font-bold",
            dl("text-gray-900", "text-gray-100", darkMode)
          )}
        >
          Accessibility Playground
        </a>

        {/* Desktop Nav */}
        <nav
          className={cx(
            "hidden space-x-6 md:flex",
            dl("text-gray-700", "text-gray-200", darkMode)
          )}
        >
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="transition hover:text-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-400 rounded"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Burger / Dark Mode */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            aria-pressed={darkMode}
            className={cx(
              "rounded-full px-3 py-2 text-sm font-medium transition",
              dl(
                "bg-gray-200 text-gray-900 hover:bg-gray-300",
                "bg-gray-800 text-gray-100 hover:bg-gray-700",
                darkMode
              )
            )}
          >
            {darkMode ? "🌞 Light" : "🌙 Dark"}
          </button>

          {/* Burger Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={cx(
              "rounded-md p-2 md:hidden",
              dl(
                "text-gray-900 hover:bg-gray-200",
                "text-gray-100 hover:bg-gray-800",
                darkMode
              )
            )}
            aria-label="Menü öffnen"
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          className={cx(
            "absolute top-full left-0 right-0 flex flex-col items-center space-y-4 py-6 shadow-md md:hidden",
            dl("bg-white text-gray-900", "bg-gray-900 text-gray-100", darkMode)
          )}
        >
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="transition hover:text-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-400 rounded"
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
};
