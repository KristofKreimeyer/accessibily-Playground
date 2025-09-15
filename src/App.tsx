import { useState } from "react";
import ColorblindnessSimulator from "./components/ColorblindnessSimulator";
import { EscapeRoom } from "./components/EscapeRoom";
import { ScreenReaderCheck } from "./components/ScreenReaderCheck";
import { PlaygroundHeader } from "./components/Header";

function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div
      className={
        darkMode ? "dark bg-gray-950 text-gray-100" : "bg-white text-gray-900"
      }
    >
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
      </main>
    </div>
  );
}

export default App;
