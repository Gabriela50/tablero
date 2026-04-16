import type { Tool } from "../../types/board";

type BoardToolbarProps = {
  selectedTool: Tool;
  selectedColor: string;
  totalElements: number;
  onSelectTool: (tool: Tool) => void;
  onSelectColor: (color: string) => void;
  onClearBoard: () => void;
  onUploadImage: (file: File) => void;
};

const colors = [
  "#ec4899",
  "#0f172a",
  "#2563eb",
  "#16a34a",
  "#f97316",
  "#9333ea",
  "#dc2626",
  "#14b8a6",
];

export default function BoardToolbar({
  selectedTool,
  selectedColor,
  totalElements,
  onSelectTool,
  onSelectColor,
  onClearBoard,
  onUploadImage,
}: BoardToolbarProps) {
  const toolLabel =
    selectedTool === "pen"
      ? "Lápiz"
      : selectedTool === "eraser"
      ? "Borrador"
      : "Texto";

  return (
    <div className="h-full rounded-[28px] border border-white/50 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
          Board tools
        </p>
        <h2 className="mt-2 text-xl font-bold text-slate-900">
          Herramientas
        </h2>
        <p className="text-sm text-slate-500">
          Control del tablero durante la clase
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => onSelectTool("pen")}
          className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
            selectedTool === "pen"
              ? "border-pink-300 bg-pink-50 text-pink-600"
              : "border-slate-200/80 bg-white text-slate-700"
          }`}
        >
          Lápiz
        </button>

        <button
          onClick={() => onSelectTool("text")}
          className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
            selectedTool === "text"
              ? "border-pink-300 bg-pink-50 text-pink-600"
              : "border-slate-200/80 bg-white text-slate-700"
          }`}
        >
          Texto
        </button>

        <button
          onClick={() => onSelectTool("eraser")}
          className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
            selectedTool === "eraser"
              ? "border-pink-300 bg-pink-50 text-pink-600"
              : "border-slate-200/80 bg-white text-slate-700"
          }`}
        >
          Borrador
        </button>

        <label className="block cursor-pointer rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-pink-300 hover:shadow-md">
          Insertar imagen
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onUploadImage(file);
              }
              e.currentTarget.value = "";
            }}
          />
        </label>

        <button
          onClick={onClearBoard}
          className="w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-pink-300 hover:shadow-md"
        >
          Limpiar
        </button>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-sm font-semibold text-slate-700">Color</p>

        <div className="grid grid-cols-4 gap-3">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => onSelectColor(color)}
              className={`h-10 w-10 rounded-full border-4 transition ${
                selectedColor === color
                  ? "scale-105 border-slate-300"
                  : "border-white"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-700 p-4 text-white shadow-lg">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
          Session
        </p>
        <h3 className="mt-2 text-lg font-semibold">Matemáticas</h3>
        <p className="mt-1 text-sm text-slate-300">Reunión en vivo</p>
        <p className="mt-3 text-sm text-slate-300">
          Herramienta: {toolLabel}
        </p>
        <p className="mt-2 text-sm text-slate-300">
          Elementos: {totalElements}
        </p>
      </div>
    </div>
  );
}