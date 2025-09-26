import { useState } from "react";

function hexToRgb(hex: string): [number, number, number] | null {
  const normalized = hex.replace("#", "").trim();
  if (![3, 6].includes(normalized.length)) return null;
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function luminance([r, g, b]: [number, number, number]): number {
  const srgb = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

function contrastRatio(fg: string, bg: string): number | null {
  const rgb1 = hexToRgb(fg);
  const rgb2 = hexToRgb(bg);
  if (!rgb1 || !rgb2) return null;
  const l1 = luminance(rgb1) + 0.05;
  const l2 = luminance(rgb2) + 0.05;
  return l1 > l2 ? l1 / l2 : l2 / l1;
}

function rating(ratio: number): string {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA (großer Text)";
  return "Fail";
}

export default function ContrastChecker() {
  const [fg, setFg] = useState("#000000");
  const [bg, setBg] = useState("#ffffff");

  const ratio = contrastRatio(fg, bg);
  const result = ratio ? rating(ratio) : "–";

  return (
    <section className="px-6 py-12 text-center">
      <h2 className="mb-6 text-2xl font-bold text-teal-600">
        Kontrast-Checker
      </h2>
      <div className="flex flex-col items-center gap-4 mb-6">
        <label className="flex items-center gap-2">
          <span className="w-24 text-right">Textfarbe</span>
          <input
            type="color"
            value={fg}
            onChange={(e) => setFg(e.target.value)}
            className="h-10 w-16 cursor-pointer"
          />
          <input
            type="text"
            value={fg}
            onChange={(e) => setFg(e.target.value)}
            className="rounded border px-2 py-1 font-mono text-sm"
          />
        </label>
        <label className="flex items-center gap-2">
          <span className="w-24 text-right">Hintergrund</span>
          <input
            type="color"
            value={bg}
            onChange={(e) => setBg(e.target.value)}
            className="h-10 w-16 cursor-pointer"
          />
          <input
            type="text"
            value={bg}
            onChange={(e) => setBg(e.target.value)}
            className="rounded border px-2 py-1 font-mono text-sm"
          />
        </label>
      </div>
      <div className="mb-6">
        {ratio && (
          <p className="text-lg">
            Kontrast: <span className="font-bold">{ratio.toFixed(2)} : 1</span>{" "}
            → {result}
          </p>
        )}
      </div>
      <div
        className="mx-auto max-w-md rounded border shadow p-6"
        style={{ backgroundColor: bg, color: fg }}
      >
        <p className="text-lg mb-2">Beispieltext für normalen Text.</p>
        <p className="text-2xl font-bold">Großer Text (24px+)</p>
      </div>
    </section>
  );
}
