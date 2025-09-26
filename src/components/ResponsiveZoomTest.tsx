import { useState, useRef, useEffect } from "react";

/**
 * ResponsiveZoomTest – Test für Responsivität & Zoom (iframe-basiert)
 * -------------------------------------------------------------------
 * Features:
 *  - Simuliert verschiedene Viewport-Breiten (Mobile, Tablet, Desktop)
 *  - Simuliert Zoom (100% – 400%) per CSS-Zoom im iframe
 *  - Realistischeres Scroll- und Zoom-Verhalten
 *  - Rendert statische Beispielseite mit Formular
 *  - Hinweis zu WCAG 2.2: Pflicht bis 200 %, darüber Best Practice
 */

const breakpoints = [
  { label: "Mobile", width: 375 },
  { label: "Tablet", width: 768 },
  { label: "Desktop", width: 1280 },
];

const zoomLevels = [100, 150, 200, 300, 400];

export default function ResponsiveZoomTest() {
  const [width, setWidth] = useState(375);
  const [zoom, setZoom] = useState(100);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const exampleHtml = `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Zoom Preview</title>
    <style>
      body { margin: 0; font-family: sans-serif; padding: 1rem; }
      h3 { margin-top: 0; color: teal; }
      form { display: flex; flex-direction: column; gap: 0.5rem; max-width: 300px; }
      label { font-size: 0.9rem; }
      input, button { padding: 0.5rem; border-radius: 4px; border: 1px solid #ccc; font-size: 1rem; }
      button { background: teal; color: white; border: none; cursor: pointer; }
      button:hover { background: #006d6d; }
    </style>
  </head>
  <body>
    <h3>Beispielseite</h3>
    <p>Dies ist eine Vorschau, wie Inhalte bei verschiedenen Viewports und Zoomstufen aussehen.</p>
    <form>
      <label for="name">Name</label>
      <input id="name" type="text" placeholder="Max Mustermann" />
      <label for="email">E-Mail</label>
      <input id="email" type="email" placeholder="max@example.com" />
      <button type="submit">Absenden</button>
    </form>
  </body>
</html>`;

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(exampleHtml);
        doc.close();
      }
    }
  }, [exampleHtml]);

  return (
    <section className="px-6 py-12 text-center">
      <h2 className="mb-4 text-2xl font-bold text-teal-600">
        Responsive & Zoom Test
      </h2>
      <p className="mb-6 text-sm text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
        Nach <strong>WCAG 2.2</strong> muss die Seite bis{" "}
        <strong>200 % Zoom</strong> korrekt bedienbar und lesbar sein. Höhere
        Zoomstufen (300 %+, teils 400 %) sind <em>Best Practices</em>, aber
        nicht verpflichtend.
      </p>

      <div className="flex flex-wrap justify-center gap-4 mb-6">
        {breakpoints.map((bp) => (
          <button
            key={bp.label}
            onClick={() => setWidth(bp.width)}
            className={`rounded px-4 py-2 text-sm font-medium shadow focus:outline-none focus:ring-2 focus:ring-teal-500 ${
              width === bp.width
                ? "bg-teal-600 text-white"
                : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
            }`}
          >
            {bp.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {zoomLevels.map((z) => (
          <button
            key={z}
            onClick={() => setZoom(z)}
            aria-label={`${z}% Zoom ${
              z <= 200 ? "– WCAG Pflichtbereich" : "– Best Practice"
            }`}
            className={`relative rounded px-3 py-1 text-xs font-medium shadow focus:outline-none focus:ring-2 focus:ring-teal-500 ${
              zoom === z
                ? "bg-teal-600 text-white"
                : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
            }`}
          >
            {z}%
            <span className="ml-1 text-[10px] font-normal opacity-70">
              {z <= 200 ? "Pflicht" : "Optional"}
            </span>
          </button>
        ))}
      </div>

      <div
        className="mx-auto border rounded shadow overflow-hidden bg-white dark:bg-gray-800"
        style={{ width }}
      >
        <iframe
          ref={iframeRef}
          title="Responsive Preview"
          style={{
            width: "100%",
            height: "600px",
            border: "none",
            zoom: `${zoom}%`,
          }}
        />
      </div>
    </section>
  );
}
