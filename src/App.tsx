import { useMemo, useRef, useState } from "react";
import { Layer, Line, Rect, Stage, Text } from "react-konva";
import ZoomMeeting from "./components/ZoomMeeting";

type Tool = "pen" | "eraser" | "text";

type DrawLine = {
  tool: "pen" | "eraser";
  color: string;
  points: number[];
};

type BoardText = {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
};

function App() {
  const [selectedTool, setSelectedTool] = useState<Tool>("pen");
  const [selectedColor, setSelectedColor] = useState("#ec4899");
  const [lines, setLines] = useState<DrawLine[]>([]);
  const [texts, setTexts] = useState<BoardText[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  const [textInput, setTextInput] = useState("");
  const [pendingTextPosition, setPendingTextPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const [aiStatus, setAiStatus] = useState(
    "La clase está lista. El siguiente paso será conectar Zoom y el análisis del backend."
  );

  const stageRef = useRef<any>(null);

  const stageSize = useMemo(() => {
    const width =
      window.innerWidth >= 1024
        ? Math.min(window.innerWidth * 0.62, 1100)
        : window.innerWidth * 0.9;

    const height = window.innerWidth >= 1024 ? 420 : 420;

    return { width, height };
  }, []);

  const toolLabel =
    selectedTool === "pen"
      ? "Lápiz"
      : selectedTool === "eraser"
      ? "Borrador"
      : "Texto";

  const totalElements = lines.length + texts.length;

  const handleMouseDown = () => {
    const stage = stageRef.current;
    if (!stage) return;

    const point = stage.getPointerPosition();
    if (!point) return;

    if (selectedTool === "text") {
      setPendingTextPosition({ x: point.x, y: point.y });
      setAiStatus("Escribe tu texto y agrégalo al tablero.");
      return;
    }

    setIsDrawing(true);

    const newLine: DrawLine = {
      tool: selectedTool === "eraser" ? "eraser" : "pen",
      color: selectedTool === "eraser" ? "#ffffff" : selectedColor,
      points: [point.x, point.y],
    };

    setLines((prev) => [...prev, newLine]);
  };

  const handleMouseMove = () => {
    if (!isDrawing || selectedTool === "text") return;

    const stage = stageRef.current;
    if (!stage) return;

    const point = stage.getPointerPosition();
    if (!point) return;

    setLines((prev) => {
      const lastLine = prev[prev.length - 1];
      if (!lastLine) return prev;

      const updatedLine: DrawLine = {
        ...lastLine,
        points: [...lastLine.points, point.x, point.y],
      };

      return [...prev.slice(0, -1), updatedLine];
    });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const clearBoard = () => {
    setLines([]);
    setTexts([]);
    setTextInput("");
    setPendingTextPosition(null);
    setAiStatus("El tablero fue limpiado.");
  };

  const downloadBoard = () => {
    const stage = stageRef.current;
    if (!stage) return;

    const dataURL = stage.toDataURL({ pixelRatio: 2 });
    const link = document.createElement("a");
    link.download = "tablero-edulive.png";
    link.href = dataURL;
    link.click();

    setAiStatus("El tablero fue exportado como imagen.");
  };

  const addTextToBoard = () => {
    if (!pendingTextPosition || !textInput.trim()) return;

    const newText: BoardText = {
      id: Date.now(),
      x: pendingTextPosition.x,
      y: pendingTextPosition.y,
      text: textInput.trim(),
      color: selectedColor,
    };

    setTexts((prev) => [...prev, newText]);
    setTextInput("");
    setPendingTextPosition(null);
    setAiStatus("Texto agregado al tablero.");
  };

  const cancelText = () => {
    setTextInput("");
    setPendingTextPosition(null);
    setAiStatus("Inserción de texto cancelada.");
  };

  const updateTextPosition = (id: number, x: number, y: number) => {
    setTexts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, x, y } : item))
    );
  };

  const handleAnalyze = () => {
    setAiStatus(
      "Botón listo. Falta conectarlo al backend para enviar la imagen del tablero."
    );
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#fce7f3,_#eef2ff_35%,_#ecfeff_70%,_#ffffff_100%)] text-slate-800">
      <header className="sticky top-0 z-30 border-b border-white/60 bg-white/75 px-6 py-4 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1700px] items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-pink-500">
              EduLive
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Live Classroom
            </h1>
            <p className="text-sm text-slate-500">
              Zoom + tablero interactivo + análisis inteligente
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 xl:block">
              Clase activa
            </div>

            <button className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              Historial
            </button>

            <button
              onClick={downloadBoard}
              className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Guardar
            </button>

            <button
              onClick={handleAnalyze}
              className="rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Analizar
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-88px)] max-w-[1700px] grid-cols-12 gap-5 p-5">
        <aside className="col-span-12 xl:col-span-2">
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
                onClick={() => {
                  setSelectedTool("pen");
                  setAiStatus("Modo lápiz activado.");
                }}
                className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                  selectedTool === "pen"
                    ? "border-pink-300 bg-pink-50 text-pink-600"
                    : "border-slate-200/80 bg-white text-slate-700"
                }`}
              >
                Lápiz
              </button>

              <button
                onClick={() => {
                  setSelectedTool("text");
                  setAiStatus("Modo texto activado. Haz clic en el tablero.");
                }}
                className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                  selectedTool === "text"
                    ? "border-pink-300 bg-pink-50 text-pink-600"
                    : "border-slate-200/80 bg-white text-slate-700"
                }`}
              >
                Texto
              </button>

              <button
                onClick={() => {
                  setSelectedTool("eraser");
                  setAiStatus("Modo borrador activado.");
                }}
                className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                  selectedTool === "eraser"
                    ? "border-pink-300 bg-pink-50 text-pink-600"
                    : "border-slate-200/80 bg-white text-slate-700"
                }`}
              >
                Borrador
              </button>

              <button
                onClick={clearBoard}
                className="w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-pink-300 hover:shadow-md"
              >
                Limpiar
              </button>
            </div>

            <div className="mt-6">
              <p className="mb-3 text-sm font-semibold text-slate-700">Color</p>

              <div className="grid grid-cols-4 gap-3">
                {[
                  "#ec4899",
                  "#0f172a",
                  "#2563eb",
                  "#16a34a",
                  "#f97316",
                  "#9333ea",
                  "#dc2626",
                  "#14b8a6",
                ].map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      setSelectedColor(color);
                      if (selectedTool !== "eraser") setSelectedTool("pen");
                      setAiStatus("Color actualizado.");
                    }}
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
        </aside>

        <section className="col-span-12 xl:col-span-7">
          <div className="grid gap-5">
            <ZoomMeeting />

            <div className="rounded-[30px] border border-white/50 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                    Workspace
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-900">
                    Tablero interactivo
                  </h2>
                  <p className="text-sm text-slate-500">
                    Trabajo colaborativo durante la llamada
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
                    Tool: {toolLabel}
                  </div>

                  <button
                    onClick={downloadBoard}
                    className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-200"
                  >
                    Exportar
                  </button>
                </div>
              </div>

              {pendingTextPosition && (
                <div className="mb-4 rounded-3xl border border-pink-200 bg-white p-4 shadow-sm">
                  <p className="mb-3 text-sm font-semibold text-slate-700">
                    Agregar texto al tablero
                  </p>

                  <div className="flex flex-col gap-3 lg:flex-row">
                    <input
                      type="text"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Escribe aquí tu texto"
                      className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-pink-400"
                    />

                    <button
                      onClick={addTextToBoard}
                      className="rounded-2xl bg-gradient-to-r from-pink-500 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-white shadow-md"
                    >
                      Agregar
                    </button>

                    <button
                      onClick={cancelText}
                      className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-auto rounded-[32px] border border-slate-200 bg-white shadow-inner">
                <Stage
                  ref={stageRef}
                  width={stageSize.width}
                  height={stageSize.height}
                  onMouseDown={handleMouseDown}
                  onMousemove={handleMouseMove}
                  onMouseup={handleMouseUp}
                  onTouchStart={handleMouseDown}
                  onTouchMove={handleMouseMove}
                  onTouchEnd={handleMouseUp}
                  className="rounded-[32px]"
                >
                  <Layer>
                    <Rect
                      x={0}
                      y={0}
                      width={stageSize.width}
                      height={stageSize.height}
                      fill="#ffffff"
                    />

                    {lines.map((line, index) => (
                      <Line
                        key={index}
                        points={line.points}
                        stroke={line.color}
                        strokeWidth={line.tool === "eraser" ? 22 : 4}
                        tension={0.5}
                        lineCap="round"
                        lineJoin="round"
                        globalCompositeOperation={
                          line.tool === "eraser"
                            ? "destination-out"
                            : "source-over"
                        }
                      />
                    ))}

                    {texts.map((item) => (
                      <Text
                        key={item.id}
                        x={item.x}
                        y={item.y}
                        text={item.text}
                        fontSize={24}
                        fill={item.color}
                        draggable
                        onDragEnd={(e) =>
                          updateTextPosition(item.id, e.target.x(), e.target.y())
                        }
                      />
                    ))}
                  </Layer>
                </Stage>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/50 bg-white/80 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <button className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-200">
                  Micrófono
                </button>
                <button className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-200">
                  Cámara
                </button>
                <button className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-200">
                  Compartir
                </button>
                <button className="rounded-2xl bg-gradient-to-r from-pink-500 to-fuchsia-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl">
                  Salir
                </button>
              </div>
            </div>
          </div>
        </section>

        <aside className="col-span-12 xl:col-span-3">
          <div className="space-y-5">
            <div className="rounded-[30px] bg-gradient-to-br from-slate-900 via-purple-900 to-pink-600 p-6 text-white shadow-2xl">
              <p className="text-xs uppercase tracking-[0.3em] text-pink-200">
                Live AI
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Asistente Inteligente
              </h2>

              <p className="mt-2 text-sm text-white/70">
                Analizando escritura, voz y ejercicios en tiempo real.
              </p>

              <div className="mt-6 rounded-2xl bg-white/10 p-4">
                <p className="text-sm">Estado:</p>
                <p className="font-bold text-green-300">Activo ahora</p>
              </div>

              <button
                onClick={handleAnalyze}
                className="mt-5 w-full rounded-2xl bg-white py-3 font-bold text-slate-900 transition hover:scale-105"
              >
                Analizar tablero
              </button>
            </div>

            <div className="rounded-[30px] border border-slate-100 bg-white p-5 shadow-xl">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Meeting Data
              </p>

              <h3 className="mt-2 text-xl font-bold text-slate-900">
                Sesión actual
              </h3>

              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Materia</span>
                  <span className="font-semibold">Matemáticas</span>
                </div>

                <div className="flex justify-between">
                  <span>Usuarios</span>
                  <span className="font-semibold">2 conectados</span>
                </div>

                <div className="flex justify-between">
                  <span>Micrófono</span>
                  <span className="font-semibold text-green-500">Activo</span>
                </div>

                <div className="flex justify-between">
                  <span>Herramienta</span>
                  <span className="font-semibold">{toolLabel}</span>
                </div>

                <div className="flex justify-between">
                  <span>Elementos</span>
                  <span className="font-semibold">{totalElements}</span>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-pink-100 bg-pink-50 p-5 shadow-lg">
              <p className="text-xs uppercase tracking-[0.3em] text-pink-400">
                Smart Status
              </p>

              <h3 className="mt-2 text-lg font-bold text-slate-900">
                Estado del sistema
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {aiStatus}
              </p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default App;