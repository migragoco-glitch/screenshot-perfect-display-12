import penguin from "@/assets/penguin-walk.png.asset.json";

/**
 * The mascot appears ONLY here: while the AI analyzes the questionnaire and
 * while the 12-week roadmap is generated. It walks horizontally across the
 * screen — never a static image, never a persistent character.
 */
export function PenguinLoader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl overflow-hidden">
        <div className="penguin-track w-28 md:w-32">
          <img
            src={penguin.url}
            alt=""
            aria-hidden
            className="penguin-body w-full select-none"
            draggable={false}
          />
        </div>
        <div className="mt-2 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>
      <div className="mt-8 text-center" role="status" aria-live="polite">
        <h2 className="text-xl font-bold md:text-2xl">{title}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}
