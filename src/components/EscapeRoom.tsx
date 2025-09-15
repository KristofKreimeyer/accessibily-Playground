/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useRef, useEffect } from "react";

export const EscapeRoom = () => {
  const [level, setLevel] = useState(1);
  const mainRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");
  const [focusedElements, setFocusedElements] = useState<string[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const menuOptions = ["Rot", "Grün", "Blau"];

  const [modalOpen, setModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // --- Level 1 ---
  const handleSkip = (e: React.MouseEvent) => {
    e.preventDefault();
    mainRef.current?.focus();
    setMessage("🎉 Level 1 geschafft! Du hast den Skip-Link gefunden.");
    setTimeout(() => setLevel(2), 1500);
  };

  // --- Level 2 ---
  const handleFocus = (id: string) => {
    setFocusedElements((prev) => {
      if (!prev.includes(id)) {
        const updated = [...prev, id];
        if (updated.length === 3) {
          setMessage("🎉 Level 2 geschafft! Du hast alle Elemente erreicht.");
          setTimeout(() => setLevel(3), 1500);
        }
        return updated;
      }
      return prev;
    });
  };

  // --- Level 3 ---
  const handleMenuKeyDown = (e: React.KeyboardEvent) => {
    if (!menuOpen && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      setMenuOpen(true);
      return;
    }

    if (menuOpen) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % menuOptions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) =>
          prev === 0 ? menuOptions.length - 1 : prev - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        setMessage(
          `🎉 Level 3 geschafft! Du hast ${menuOptions[activeIndex]} gewählt.`
        );
        setTimeout(() => setLevel(4), 1500);
        setMenuOpen(false);
      } else if (e.key === "Escape") {
        setMenuOpen(false);
      }
    }
  };

  // --- Level 4 ---
  useEffect(() => {
    if (modalOpen && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      const trap = (e: KeyboardEvent) => {
        if (e.key === "Tab") {
          if (e.shiftKey) {
            if (document.activeElement === first) {
              e.preventDefault();
              last.focus();
            }
          } else {
            if (document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
        if (e.key === "Escape") {
          closeModal();
        }
      };

      document.addEventListener("keydown", trap);
      first?.focus();

      return () => document.removeEventListener("keydown", trap);
    }
  }, [modalOpen]);

  const closeModal = () => {
    setModalOpen(false);
    triggerRef.current?.focus();
    setMessage("🎉 Level 4 geschafft! Du hast das Modal gemeistert.");
    setTimeout(() => setLevel(5), 1500);
  };

  return (
    <section className="px-6 py-20 text-center">
      <h2 className="mb-6 text-3xl font-bold text-teal-600">
        Keyboard Accessibility Escape Room
      </h2>
      <p className="mb-4 text-gray-600">Level {level} von 6</p>

      {/* Level 1 */}
      {level === 1 && (
        <>
          <a
            href="#main"
            onClick={handleSkip}
            className="absolute left-2 top-2 -translate-y-16 rounded bg-teal-600 px-4 py-2 text-white focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            Zum Inhalt springen
          </a>
          <div
            id="main"
            ref={mainRef}
            tabIndex={-1}
            className="mx-auto mt-20 max-w-xl rounded border p-6 shadow focus:outline-none"
          >
            <p>
              Nutze <kbd>Tab</kbd>, um den Skip-Link oben links zu erreichen.
              Drücke <kbd>Enter</kbd>, um zum Inhalt zu springen.
            </p>
          </div>
        </>
      )}

      {/* Level 2 */}
      {level === 2 && (
        <div className="mx-auto max-w-xl rounded border p-6 shadow">
          <p className="mb-6 text-lg">
            Nutze <kbd>Tab</kbd> und <kbd>Shift+Tab</kbd>, um alle Elemente zu
            erreichen.
          </p>
          <div className="flex flex-col items-center gap-4">
            <input
              id="input"
              type="text"
              placeholder="Text eingeben"
              onFocus={() => handleFocus("input")}
              className="rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              id="button"
              onFocus={() => handleFocus("button")}
              className="rounded bg-teal-500 px-4 py-2 text-white hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              Klick mich
            </button>
            <select
              id="select"
              onFocus={() => handleFocus("select")}
              className="rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option>Option A</option>
              <option>Option B</option>
            </select>
          </div>
        </div>
      )}

      {/* Level 3 */}
      {level === 3 && (
        <div className="mx-auto max-w-xl rounded border p-6 shadow">
          <p className="mb-6 text-lg">
            Öffne das Menü mit <kbd>Enter</kbd> oder <kbd>Space</kbd>. Navigiere
            mit <kbd>Pfeiltasten</kbd> und bestätige mit <kbd>Enter</kbd>.
          </p>
          <div className="relative inline-block text-left">
            <button
              onKeyDown={handleMenuKeyDown}
              onClick={() => setMenuOpen((prev) => !prev)}
              className="rounded bg-teal-500 px-4 py-2 text-white hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              Menü öffnen
            </button>
            {menuOpen && (
              <ul
                role="menu"
                className="absolute left-0 mt-2 w-40 rounded border bg-white shadow focus:outline-none"
              >
                {menuOptions.map((option, index) => (
                  <li
                    key={option}
                    role="menuitem"
                    className={`cursor-pointer px-4 py-2 text-left ${
                      index === activeIndex ? "bg-teal-100" : ""
                    }`}
                  >
                    {option}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Level 4 */}
      {level === 4 && (
        <div className="mx-auto max-w-xl rounded border p-6 shadow">
          <p className="mb-6 text-lg">
            Öffne das Modal mit <kbd>Enter</kbd>. Schließe es mit <kbd>Esc</kbd>
            . Der Fokus darf nicht aus dem Modal entkommen!
          </p>
          <button
            ref={triggerRef}
            onClick={() => setModalOpen(true)}
            className="rounded bg-teal-500 px-6 py-3 text-white hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            Modal öffnen
          </button>
          {modalOpen && (
            <div
              role="dialog"
              aria-modal="true"
              ref={modalRef}
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
            >
              <div className="rounded bg-white p-6 shadow-lg focus:outline-none">
                <h3 className="mb-4 text-xl font-bold text-gray-900">
                  Accessibility Modal
                </h3>
                <p className="mb-4 text-gray-700">
                  Du bist im Modal gefangen. Nutze <kbd>Esc</kbd>, um zu
                  entkommen.
                </p>
                <button
                  onClick={closeModal}
                  className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  Schließen
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Level 5 */}
      {level === 5 && (
        <div className="mx-auto max-w-xl rounded border p-6 shadow">
          <p className="mb-6 text-lg">
            Vor dir liegen drei Türen (Buttons). Nur eine führt raus. Tipp:
            Screenreader verraten dir, welche!
          </p>
          <div className="flex justify-center gap-6">
            <button
              aria-label="Falsche Tür"
              className="rounded bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              🚪
            </button>
            <button
              aria-label="Die richtige Tür – Exit"
              aria-describedby="exitHint"
              onClick={() => {
                setMessage(
                  "🎉 Level 5 geschafft! Du hast den Ausgang gefunden!"
                );
                setTimeout(() => setLevel(6), 1500);
              }}
              className="rounded bg-teal-500 px-4 py-2 text-white hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              🚪
            </button>
            <button
              aria-label="Falsche Tür"
              className="rounded bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              🚪
            </button>
          </div>
          <span id="exitHint" className="sr-only">
            Dies ist die richtige Tür, um Level 5 zu verlassen.
          </span>
        </div>
      )}

      {/* Level 6 */}
      {level === 6 && (
        <div className="mx-auto max-w-xl rounded border p-6 shadow">
          <p className="mb-6 text-lg">
            Dieses Level ist ein Accessibility-Fail. Teste mit <kbd>Tab</kbd>,
            um zu sehen, welche Elemente du erreichst. Nur ein Button ist
            korrekt bedienbar.
          </p>
          <div className="flex justify-center gap-6">
            <button
              tabIndex={5}
              className="rounded bg-yellow-400 px-4 py-2 text-white hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-600"
            >
              Falscher Tabindex
            </button>
            <button
              tabIndex={-1}
              className="rounded bg-red-400 px-4 py-2 text-white hover:bg-red-500"
            >
              Kein Fokus
            </button>
            <button
              onClick={() =>
                setMessage(
                  "🎉 Level 6 geschafft! Du hast den richtigen Button gefunden."
                )
              }
              className="rounded bg-teal-500 px-4 py-2 text-white hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              Richtiger Button
            </button>
          </div>
        </div>
      )}

      {/* Feedback */}
      <div
        className="mt-6 text-lg font-semibold text-green-600"
        aria-live="polite"
      >
        {message}
      </div>
    </section>
  );
};
