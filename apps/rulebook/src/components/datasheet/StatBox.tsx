export default function StatBox({ value }: { value: string }) {
  return (
    <div className="flex size-10 items-center justify-center rounded-md border-2 border-ink/60 bg-stat-box text-xl font-extrabold text-ink shadow-[2px_2px_0_rgb(0_0_0/0.45)] sm:size-12 sm:text-2xl">
      {value}
    </div>
  );
}
