import { useState } from "react";

interface Issue {
  type: "warning" | "error";
  message: string;
}

export const ScreenReaderCheck = () => {
  const [htmlInput, setHtmlInput] = useState<string>(
    `<h1>Willkommen</h1>
<p>Dies ist ein Beispieltext.</p>
<img alt="Bildbeschreibung" src="anna-tarazevich.jpg" />
<a href="#">Mehr erfahren</a>
<h3>Falsche Überschrift</h3>
<button type="button">Abschicken</button>`
  );

  const [output, setOutput] = useState<string[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);

  const handleAnalyze = () => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(
        `<body>${htmlInput}</body>`,
        "text/html"
      );

      const linearized: string[] = [];
      const foundIssues: Issue[] = [];

      let lastHeadingLevel = 0;
      let h1Count = 0;

      // Verwende childNodes statt querySelectorAll für bessere Reihenfolge
      const walkNode = (node: Node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as Element;

          if (el.tagName?.match(/^H[1-6]$/)) {
            const level = parseInt(el.tagName[1]);
            const text = el.textContent?.trim() || "";
            linearized.push(`Überschrift ${level}: ${text}`);

            if (level === 1) {
              h1Count++;
              if (h1Count > 1) {
                foundIssues.push({
                  type: "error",
                  message: "Mehr als eine H1 gefunden.",
                });
              }
            }

            if (lastHeadingLevel && level > lastHeadingLevel + 1) {
              foundIssues.push({
                type: "warning",
                message: `Überschrift-Hierarchie fehlerhaft: ${el.tagName} folgt auf H${lastHeadingLevel}`,
              });
            }

            lastHeadingLevel = level;
          } else if (el.tagName === "P") {
            const text = el.textContent?.trim() || "";
            if (text) {
              linearized.push(`Absatz: ${text}`);
            }
          } else if (el.tagName === "A") {
            const text = el.textContent?.trim() || "";
            const label = el.getAttribute("aria-label") || "";
            const href = el.getAttribute("href");

            if (!text && !label) {
              foundIssues.push({
                type: "error",
                message:
                  "Ein Link hat keinen zugänglichen Namen (Text oder aria-label).",
              });
            }

            if (!href || href === "#") {
              foundIssues.push({
                type: "warning",
                message:
                  "Link hat keine gültige URL (href fehlt oder ist nur '#').",
              });
            }

            linearized.push(`Link: ${text || label || "kein Text"}`);
          } else if (el.tagName === "IMG") {
            const alt = el.getAttribute("alt");
            const src = el.getAttribute("src");

            if (alt === null) {
              foundIssues.push({
                type: "error",
                message: "Ein Bild fehlt ein Alternativtext (alt-Attribut).",
              });
            }

            if (!src) {
              foundIssues.push({
                type: "error",
                message: "Ein Bild hat keine src-Angabe.",
              });
            }

            linearized.push(`Bild: ${alt || "kein Alternativtext"}`);
          } else if (el.tagName === "BUTTON") {
            const text = el.textContent?.trim() || "";
            const label = el.getAttribute("aria-label") || "";

            if (!text && !label) {
              foundIssues.push({
                type: "error",
                message:
                  "Ein Button hat keinen zugänglichen Namen (Text oder aria-label).",
              });
            }

            linearized.push(`Button: ${text || label || "kein Text"}`);
          } else if (el.tagName === "UL" || el.tagName === "OL") {
            linearized.push(
              `${el.tagName === "UL" ? "Ungeordnete" : "Geordnete"} Liste:`
            );
          } else if (el.tagName === "LI") {
            const text = el.textContent?.trim() || "";
            if (text) {
              linearized.push(`  • Listenelement: ${text}`);
            }
          } else if (el.tagName === "TABLE") {
            linearized.push("Tabelle:");
          } else if (el.tagName === "TH") {
            const text = el.textContent?.trim() || "";
            if (text) {
              linearized.push(`  Spaltenüberschrift: ${text}`);
            }
          } else if (el.tagName === "TD") {
            const text = el.textContent?.trim() || "";
            if (text) {
              linearized.push(`  Zelle: ${text}`);
            }
          }

          // Rekursiv durch Kindknoten gehen
          el.childNodes.forEach(walkNode);
        } else if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent?.trim();
          if (text && node.parentElement?.tagName === "BODY") {
            linearized.push(`Text: ${text}`);
          }
        }
      };

      doc.body.childNodes.forEach(walkNode);

      // Überprüfe auf fehlende H1
      if (h1Count === 0) {
        foundIssues.push({
          type: "warning",
          message:
            "Keine H1-Überschrift gefunden. Jede Seite sollte eine H1 haben.",
        });
      }

      setOutput(linearized);
      setIssues(foundIssues);
    } catch (error) {
      setOutput([]);
      setIssues([
        {
          type: "error",
          message: `Fehler beim Analysieren des HTML: ${
            (error as Error).message
          }`,
        },
      ]);
    }
  };

  return (
    <section className="px-6 py-20 text-center">
      <h2 className="mb-4 text-3xl font-bold text-teal-600 dark:text-teal-400">
        Screen Reader Check
      </h2>
      <p className="mb-6 text-gray-600 dark:text-gray-300">
        Füge HTML ein, um zu sehen, wie Screenreader Inhalte linear lesen und
        welche Accessibility-Probleme es gibt.
      </p>

      <div className="mb-4">
        <label
          htmlFor="html-input"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          HTML-Code eingeben:
        </label>
        <textarea
          id="html-input"
          value={htmlInput}
          onChange={(e) => setHtmlInput(e.target.value)}
          className="w-full rounded border border-gray-300 dark:border-gray-600 p-3 font-mono text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
          rows={8}
          placeholder="Hier HTML-Code eingeben..."
        />
      </div>

      <button
        onClick={handleAnalyze}
        className="mt-4 rounded bg-teal-800 dark:bg-teal-700 px-6 py-2 text-white hover:bg-teal-800 dark:hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-colors"
      >
        Analysieren
      </button>

      {/* Ergebnisbereich */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* Visuelle Vorschau */}
        <div className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-4 shadow">
          <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
            Visuelle Vorschau:
          </h3>
          <div className="border border-gray-200 dark:border-gray-600 rounded p-3 bg-gray-50 dark:bg-gray-700">
            <div
              className="prose max-w-none text-gray-900 dark:text-gray-100"
              dangerouslySetInnerHTML={{ __html: htmlInput }}
            />
          </div>
        </div>

        {/* Screenreader-Ausgabe */}
        <div className="rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 p-4 shadow">
          <h3 className="mb-2 font-semibold text-gray-700 dark:text-gray-200">
            Linearisierte Ausgabe:
          </h3>
          {output.length > 0 ? (
            <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 p-3">
              <ol className="list-decimal pl-6 text-left text-gray-700 dark:text-gray-300 space-y-1">
                {output.map((line, i) => (
                  <li key={i} className="text-sm">
                    {line}
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              Noch keine Analyse durchgeführt.
            </p>
          )}

          {/* Fehler & Warnungen */}
          {issues.length > 0 && (
            <div className="mt-4 rounded border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3">
              <h4 className="mb-2 font-semibold text-red-600 dark:text-red-400">
                Probleme gefunden ({issues.length}):
              </h4>
              <ul className="list-none pl-0 text-left text-red-700 dark:text-red-300 space-y-1">
                {issues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="flex-shrink-0">
                      {issue.type === "error" ? "❌" : "⚠️"}
                    </span>
                    <span className="text-sm">{issue.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {issues.length === 0 && output.length > 0 && (
            <div className="mt-4 rounded border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-3">
              <p className="text-green-600 dark:text-green-400 font-semibold flex items-center gap-2">
                <span>🎉</span>
                <span>Keine Probleme gefunden!</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
