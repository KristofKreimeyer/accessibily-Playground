interface ShortCutHintProps {
  hotkey: string;
}

export default function ShortCutHint({
  hotkey = "Ctrl+Alt+K",
}: ShortCutHintProps) {
  return (
    <p
      className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1"
      aria-label={`Tastaturnavigation-Check mit ${hotkey} aufrufen`}
    >
      <span className="font-medium">Tastaturnavi-Check:</span>
      <kbd className="rounded bg-gray-200 dark:bg-gray-700 px-1 py-0.5 text-[10px] font-mono">
        {hotkey}
      </kbd>
    </p>
  );
}
