/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

// ------------------------- Utilities -------------------------

/** Prüft, ob ein Element sichtbar und fokussierbar ist */
function isVisible(el: Element): boolean {
  if (!(el instanceof HTMLElement)) return false;
  if (el.hidden) return false;
  const style = getComputedStyle(el);
  if (
    style.visibility === "hidden" ||
    style.display === "none" ||
    parseFloat(style.opacity) === 0
  )
    return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

/** Best guess für tabbierbare Elemente – nahe an :tabbable */
function queryTabbables(root: ParentNode = document): HTMLElement[] {
  const selector = [
    "a[href]",
    "button",
    'input:not([type="hidden"])',
    "select",
    "textarea",
    "[tabindex]",
  ].join(",");

  const nodes = Array.from(root.querySelectorAll<HTMLElement>(selector))
    .filter((el) => !el.hasAttribute("disabled"))
    .filter((el) => el.tabIndex !== -1)
    .filter((el) => !el.closest("[data-kbdcheck-ignore]"))
    .filter(isVisible);

  return nodes;
}

/** Accessible Name nach vereinfachten Regeln (nicht vollständig wie AOM) */
function getAccessibleName(el: HTMLElement): string {
  // aria-label
  const ariaLabel = el.getAttribute("aria-label");
  if (ariaLabel) return ariaLabel.trim();

  // aria-labelledby
  const labelledBy = el.getAttribute("aria-labelledby");
  if (labelledBy) {
    const ids = labelledBy.split(/\s+/);
    const text = ids
      .map((id) => document.getElementById(id)?.textContent?.trim() ?? "")
      .join(" ")
      .trim();
    if (text) return text;
  }

  // <label for="id">
  if (el.id) {
    const label = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
    const text = label?.textContent?.trim();
    if (text) return text;
  }

  // Titel/Alt/Placeholder
  const maybe =
    el.getAttribute("title") ||
    el.getAttribute("alt") ||
    (el as HTMLInputElement).placeholder;
  if (maybe) return maybe.trim();

  // innerText fallback
  const text = (el as HTMLElement).innerText?.trim();
  if (text) return text;

  // Role-basierte Defaults
  if (el.tagName.toLowerCase() === "a" && (el as HTMLAnchorElement).href)
    return (el as HTMLAnchorElement).href;

  return "(ohne Namen)";
}

function getRole(el: HTMLElement): string {
  const ariaRole = el.getAttribute("role");
  if (ariaRole) return ariaRole;
  // grobe Heuristik
  switch (el.tagName.toLowerCase()) {
    case "a":
      return "link";
    case "button":
      return "button";
    case "input":
      return (el as HTMLInputElement).type || "textbox";
    case "select":
      return "combobox";
    case "textarea":
      return "textbox (multiline)";
    default:
      return el.tagName.toLowerCase();
  }
}

/** Sortiert wie echte Tab-Reihenfolge: positive tabindex zuerst (aufsteigend), dann DOM-Order (tabIndex 0 / nicht gesetzt) */
function sortByTabOrder(nodes: HTMLElement[]): HTMLElement[] {
  const withMeta = nodes.map((el, i) => ({
    el,
    idx: i,
    tab: el.getAttribute("tabindex") ? el.tabIndex : 0,
    hasExplicit: el.hasAttribute("tabindex"),
  }));

  const positive = withMeta
    .filter((n) => n.tab > 0)
    .sort((a, b) => a.tab - b.tab || a.idx - b.idx);
  const normal = withMeta
    .filter((n) => n.tab <= 0)
    .sort((a, b) => a.idx - b.idx);
  return [...positive, ...normal].map((n) => n.el);
}

function badgePosition(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  // Badge oben links leicht versetzt
  return {
    top: Math.max(0, rect.top + window.scrollY - 8),
    left: Math.max(0, rect.left + window.scrollX - 8),
  };
}

// ------------------------- Component -------------------------

type Issue =
  | "no-name"
  | "positive-tabindex"
  | "tiny-target"
  | "low-contrast"
  | "offscreen";

interface ItemInfo {
  el: HTMLElement;
  id: string; // stable id
  order: number; // tab order index (1-based)
  tabindex: number;
  role: string;
  name: string;
  issues: Issue[];
}

interface OverlayProps {
  hotkey?: string; // Anzeige-Text, Logik nutzt Ctrl/Cmd + Alt + K standardmäßig
  enabledByDefault?: boolean;
}

const OVERLAY_ROOT_ID = "kbdcheck-overlay-root";

export default function KeyboardNavCheckOverlay({
  hotkey = "Ctrl+Alt+K",
  enabledByDefault = false,
}: OverlayProps) {
  const [enabled, setEnabled] = useState(enabledByDefault);
  const [items, setItems] = useState<ItemInfo[]>([]);
  const [focusTrail, setFocusTrail] = useState<string[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );

  // Create overlay root once
  const overlayRoot = useMemo(() => {
    let root = document.getElementById(OVERLAY_ROOT_ID);
    if (!root) {
      root = document.createElement("div");
      root.id = OVERLAY_ROOT_ID;
      root.setAttribute("aria-hidden", "true");
      document.body.appendChild(root);
    }
    return root;
  }, []);

  // Toggle per Hotkey: Ctrl/Cmd + Alt + K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const k = e.key.toLowerCase();
      const ctrlOrMeta = e.ctrlKey || e.metaKey;
      if (ctrlOrMeta && e.altKey && k === "k") {
        e.preventDefault();
        setEnabled((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Track Änderungen Dark/Light (Tailwind: html.dark)
  useEffect(() => {
    const obs = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    });
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);

  // Sammle tabbierbare Elemente & berechne Liste
  const recalc = useCallback(() => {
    const nodes = sortByTabOrder(queryTabbables(document));

    const mapped: ItemInfo[] = nodes.map((el, i) => {
      const name = getAccessibleName(el);
      const role = getRole(el);
      const tabindex = el.tabIndex;
      const rect = el.getBoundingClientRect();
      const issues: Issue[] = [];
      if (!name || name === "(ohne Namen)") issues.push("no-name");
      if (el.hasAttribute("tabindex") && tabindex > 0)
        issues.push("positive-tabindex");
      if (rect.width < 24 || rect.height < 24) issues.push("tiny-target");
      if (
        rect.bottom < 0 ||
        rect.right < 0 ||
        rect.top > window.innerHeight ||
        rect.left > window.innerWidth
      )
        issues.push("offscreen");
      // low-contrast: heuristik weglassen; zuverlässige Messung sprengt den Rahmen.

      return {
        el,
        id: `kbd-${i}-${el.tagName.toLowerCase()}-${Math.abs(
          (el.outerHTML?.slice(0, 20) && (String.prototype as any).hashCode
            ? (el.outerHTML.slice(0, 20) as any).hashCode()
            : i) ?? i
        )}`,
        order: i + 1,
        tabindex,
        role,
        name,
        issues,
      };
    });

    setItems(mapped);
  }, []);

  // Polyfill mini: String.hashCode (für stabile IDs ohne externe Lib)
  if (!(String.prototype as any).hashCode) {
    (String.prototype as any).hashCode = function hashCode(this: string) {
      let h = 0;
      for (let i = 0; i < this.length; i++) {
        h = (h << 5) - h + this.charCodeAt(i);
        h |= 0;
      }
      return h;
    };
  }

  useEffect(() => {
    if (!enabled) return;
    recalc();

    const mo = new MutationObserver(() => recalc());
    mo.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      characterData: true,
    });

    const onResize = () => recalc();
    const onScroll = () => recalc();

    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    function onFocusin(e: FocusEvent) {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const descr = describeElement(t);
      setFocusTrail((prev) =>
        (prev[prev.length - 1] === descr ? prev : [...prev, descr]).slice(-50)
      );
    }
    window.addEventListener("focusin", onFocusin, true);

    return () => {
      mo.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("focusin", onFocusin, true);
    };
  }, [enabled, recalc]);

  if (!enabled) return null;

  return createPortal(
    <>
      {/* Badges */}
      {items.map((it) => {
        const pos = badgePosition(it.el);
        return (
          <div
            key={it.id}
            className={`pointer-events-none absolute z-[9998] select-none rounded-full px-2 py-1 text-xs font-bold shadow ${
              theme === "dark"
                ? "bg-yellow-300 text-black"
                : "bg-teal-600 text-white"
            }`}
            style={{ top: pos.top, left: pos.left }}
            aria-hidden
          >
            {it.order}
          </div>
        );
      })}

      {/* Bounding-Boxes als dezente Umrandung */}
      {items.map((it) => {
        const r = it.el.getBoundingClientRect();
        const style: React.CSSProperties = {
          position: "absolute",
          top: r.top + window.scrollY,
          left: r.left + window.scrollX,
          width: r.width,
          height: r.height,
          border: `2px dashed ${theme === "dark" ? "#fde047" : "#0d9488"}`,
          borderRadius: 6,
          zIndex: 9997,
          pointerEvents: "none",
        };
        return <div key={it.id + "-box"} style={style} aria-hidden />;
      })}

      {/* Panel */}
      <div
        className={`fixed bottom-4 right-4 z-[9999] w-[min(95vw,720px)] max-h-[70vh] overflow-hidden rounded-2xl shadow-xl border ${
          theme === "dark"
            ? "bg-gray-900/95 text-gray-100 border-gray-700"
            : "bg-white/95 text-gray-900 border-gray-200"
        }`}
        role="region"
        aria-label="Keyboard Navigation Check Panel"
      >
        <header className="flex items-center justify-between gap-3 border-b px-4 py-3 text-sm">
          <div className="font-semibold">
            Tastaturnavigation – {items.length} Elemente
          </div>
          <div className="opacity-70">Toggle: {hotkey}</div>
        </header>
        <div className="max-h-[55vh] overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr
                className={`${theme === "dark" ? "bg-gray-800" : "bg-gray-50"}`}
              >
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">Rolle</th>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">tabindex</th>
                <th className="px-3 py-2 text-left">Probleme</th>
                <th className="px-3 py-2 text-left">Snippet</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr
                  key={it.id}
                  className={`${
                    theme === "dark"
                      ? "odd:bg-gray-900/40 even:bg-gray-800/40"
                      : "odd:bg-white even:bg-gray-50"
                  }`}
                >
                  <td className="px-3 py-2 align-top font-mono">{it.order}</td>
                  <td className="px-3 py-2 align-top">{it.role}</td>
                  <td className="px-3 py-2 align-top">{it.name}</td>
                  <td className="px-3 py-2 align-top">{it.tabindex}</td>
                  <td className="px-3 py-2 align-top">
                    {it.issues.length === 0 ? (
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-100">
                        ok
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {it.issues.map((issue) => (
                          <span
                            key={issue}
                            className="rounded bg-amber-100 px-2 py-0.5 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
                          >
                            {issue}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td
                    className="px-3 py-2 align-top max-w-[22ch] truncate"
                    title={it.el.outerHTML.replace(/\s+/g, " ").slice(0, 400)}
                  >
                    {it.el.outerHTML.replace(/\s+/g, " ").slice(0, 70)}…
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <footer
          className={`border-t px-4 py-2 text-xs ${
            theme === "dark" ? "border-gray-800" : "border-gray-200"
          }`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="opacity-70">Fokuspfad (live):</span>
            <span className="font-mono truncate">
              {focusTrail.join(" → ") || "–"}
            </span>
          </div>
        </footer>
      </div>
    </>,
    overlayRoot
  );
}

function describeElement(el: HTMLElement): string {
  const role = getRole(el);
  const name = getAccessibleName(el);
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : "";
  const cls = el.classList.length
    ? "." + Array.from(el.classList).slice(0, 2).join(".")
    : "";
  return `${tag}${id}${cls} [${role}] "${name.slice(0, 24)}"`;
}
