import penguin from "@/assets/penguin-walk.png.asset.json";
import { useEffect, useState } from "react";

/**
 * The mascot appears ONLY here: while the AI analyzes the questionnaire and
 * while the 12-week roadmap is generated.
 */
export function PenguinLoader({
  messages,
  durationMs,
  fullScreen = false,
}: {
  messages: readonly string[];
  durationMs: number;
  fullScreen?: boolean;
}) {
  const [stage, setStage] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setVisible(true));
    const stageId = messages.length > 1
      ? window.setTimeout(() => setStage(1), durationMs / 2)
      : undefined;
    const exitId = window.setTimeout(() => setVisible(false), Math.max(0, durationMs - 300));

    return () => {
      window.cancelAnimationFrame(frame);
      if (stageId !== undefined) window.clearTimeout(stageId);
      window.clearTimeout(exitId);
    };
  }, [durationMs, messages.length]);

  return (
    <div className={`flex ${fullScreen ? "min-h-screen" : "min-h-[70vh]"} flex-col items-center justify-center px-4`}>
      <img
        src={penguin.url}
        alt=""
        aria-hidden
        className={`w-28 select-none transition-opacity duration-300 md:w-32 ${visible ? "opacity-100" : "opacity-0"}`}
        draggable={false}
      />
      <div className="mt-8 text-center" role="status" aria-live="polite">
        <h2 key={stage} className="animate-fade-in max-w-2xl text-xl font-bold md:text-2xl">
          {messages[stage]}
        </h2>
      </div>
    </div>
  );
}
