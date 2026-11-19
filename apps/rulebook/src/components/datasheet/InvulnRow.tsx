/** The shield under the stat line, sitting below the Sv box. */
export default function InvulnRow({ value }: { value: string }) {
  return (
    <>
      <div className="col-start-3 flex justify-center">
        <div className="shield flex h-11 w-10 items-start justify-center bg-ink/60 pt-px sm:h-12 sm:w-11">
          <div className="shield flex h-10 w-9 items-start justify-center bg-stat-box pt-1.5 text-lg font-extrabold text-ink sm:h-11 sm:w-10 sm:text-xl">
            {value}
          </div>
        </div>
      </div>
      <div className="col-span-3 -ml-3 self-center justify-self-start bg-black/55 py-0.5 pr-3 pl-4 text-sm font-bold tracking-wide uppercase sm:-ml-4">
        Invsv
      </div>
    </>
  );
}
