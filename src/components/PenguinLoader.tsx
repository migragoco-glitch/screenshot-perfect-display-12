import penguin from "@/assets/penguin-walk.png.asset.json";
import { useEffect, useState } from "react";

/**
 * The mascot appears ONLY here: while the AI analyzes the questionnaire and
 * while the 12-week roadmap is generated. It walks horizontally across the
 * screen — never a static image, never a persistent character.
 */
export function PenguinLoader({
  messages,
  durationMs,
}: {
  messages: readonly [string, string];
  durationMs: number;
}) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const id = window.setTimeout(() => setStage(1), durationMs / 2);
    return () => window.clearTimeout(id);
  }, [durationMs]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
      <div className="penguin-lane w-full max-w-2xl overflow-hidden">
        <div className="penguin-track w-28 md:w-32">
          <img
            src={penguin.url}
            alt=""
            aria-hidden
            className="w-full select-none"
            draggable={false}
          />
        </div>
        <div className="mt-2 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>
      <div className="mt-8 text-center" role="status" aria-live="polite">
        <h2 key={stage} className="animate-fade-in max-w-2xl text-xl font-bold md:text-2xl">
          {messages[stage]}
        </h2>
      </div>
    </div>
  );
}
