import { useEffect, useState } from "react";
import ColorblindnessSimulator from "./components/ColorblindnessSimulator";
import { EscapeRoom } from "./components/EscapeRoom";
import { ScreenReaderCheck } from "./components/ScreenReaderCheck";
import { PlaygroundHeader } from "./components/Header";
import KeyboardNavCheckOverlay from "./components/KeyboardNavCheckOverlay";
import ContrastChecker from "./components/ContrastChecker";
import ResponsiveZoomTest from "./components/ResponsiveZoomTest";

function App() {
  const [darkMode, setDarkMode] = useState(false);

  // Dark-Mode Toggle über <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <PlaygroundHeader darkMode={darkMode} setDarkMode={setDarkMode} />

      <main className="pt-20 space-y-20">
        <section id="colorblind">
          <ColorblindnessSimulator />
        </section>
        <section id="escape">
          <EscapeRoom />
        </section>
        <section id="screenreader">
          <ScreenReaderCheck />
        </section>
        <section id="keyboardCheck">
          <KeyboardNavCheckOverlay hotkey="Ctrl+Alt+K" />
        </section>
        <section id="contrast">
          <ContrastChecker />
        </section>
        <section id="responsiveZoom">
          <ResponsiveZoomTest />
        </section>
      </main>
    </div>
  );
}

export default App;
