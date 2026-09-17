import penguin from "@/assets/penguin-walk.png.asset.json";

export function AssessmentGuideMoment({ message }: { message: string }) {
  return (
    <div className="assessment-companion flex min-h-[58vh] flex-col items-center justify-center px-4 text-center">
      <img
        src={penguin.url}
        alt=""
        aria-hidden
        className="w-28 select-none md:w-32"
        draggable={false}
      />
      <p className="mt-6 max-w-xl text-lg font-bold leading-relaxed md:text-xl" role="status" aria-live="polite">
        {message}
      </p>
    </div>
  );
}