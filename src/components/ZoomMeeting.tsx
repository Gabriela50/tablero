export default function ZoomMeeting() {
  return (
    <div className="rounded-[30px] border border-white/50 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            Live meeting
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            Llamada Zoom
          </h2>
          <p className="text-sm text-slate-500">
            Contenedor preparado para la videollamada
          </p>
        </div>

        <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
          Zoom ready
        </div>
      </div>

      <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-slate-950 shadow-inner">
        <div className="flex min-h-[420px] items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.18),_rgba(15,23,42,1)_60%)] px-6 text-center text-white">
          <div>
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-3xl">
              🎥
            </div>
            <h3 className="text-2xl font-bold">Zoom Classroom</h3>
            <p className="mt-2 max-w-xl text-sm text-slate-300">
              Esta sección ya quedó lista para integrar la reunión real de Zoom
              en el siguiente paso.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}