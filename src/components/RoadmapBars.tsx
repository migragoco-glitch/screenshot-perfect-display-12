import { Briefcase, House, Scale, Users } from "lucide-react";
import { useI18n, type TKey } from "@/lib/i18n";

const ROADMAP_PHASES = [
  { label: "hero.roadmapWeeks1", height: "h-1/4", compact: 31, color: "bg-[var(--navigator-light-teal)] text-[var(--navigator-light-teal)]", icon: Scale },
  { label: "hero.roadmapWeeks2", height: "h-[45%]", compact: 53, color: "bg-[var(--navigator-teal)] text-[var(--navigator-teal)]", icon: House },
  { label: "hero.roadmapWeeks3", height: "h-[65%]", compact: 79, color: "bg-[var(--navigator-olive)] text-[var(--navigator-olive)]", icon: Briefcase },
  { label: "hero.roadmapWeeks4", height: "h-full", compact: 104, color: "bg-[var(--navigator-gold)] text-[var(--navigator-gold)]", icon: Users },
] as const;

/** Shared roadmap column chart; the hero renders it non-compact exactly as before. */
export function RoadmapBars({ compact = false, dimmed, entered = true, className = "" }: { compact?: boolean; dimmed?: readonly boolean[]; entered?: boolean; className?: string }) {
  const { t, lang } = useI18n();
  return (
    <div className={`rounded-2xl bg-[var(--navigator-navy)] ${compact ? "px-3 pb-3 pt-3" : "px-4 pb-5 pt-4"}${entered ? " navigator-entered" : ""} ${className}`}>
      <div className={compact ? "grid grid-cols-4 gap-[10px]" : "mt-5 grid h-44 grid-cols-4 gap-2 sm:gap-3"}>
        {ROADMAP_PHASES.map((phase, index) => {
          const PhaseIcon = phase.icon;
          return (
            <div key={phase.label} className="grid min-w-0 grid-rows-[1fr_auto] gap-2" style={dimmed?.[index] ? { opacity: 0.35 } : undefined}>
              <div className="flex min-h-0 flex-col items-center justify-end">
                <PhaseIcon className={`mb-2 size-4 shrink-0 ${phase.color.split(" ")[1]}`} aria-hidden />
                <div
                  className={`roadmap-bar w-full ${compact ? "rounded-t-[10px]" : `rounded-t-lg ${phase.height}`} ${phase.color.split(" ")[0]}`}
                  style={{ animationDelay: `${(lang === "fa" ? ROADMAP_PHASES.length - 1 - index : index) * 100}ms`, ...(compact ? { height: phase.compact } : {}) }}
                  aria-hidden
                />
              </div>
              <span className={`text-center text-[9px] leading-tight text-[var(--navigator-cream)] sm:text-[10px] ${index === 3 ? "font-bold" : "font-medium opacity-80"}`} style={{ overflowWrap: "anywhere" }}>
                {t(phase.label as TKey)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
