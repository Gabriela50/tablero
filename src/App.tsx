import { useMemo, useRef, useState } from "react";
import ZoomMeeting from "./components/ZoomMeeting";
import BoardCanvas from "./components/board/BoardCanvas";
import BoardToolbar from "./components/board/BoardToolbar";
import { useBoard } from "./hooks/useBoard";
import type { Tool } from "./types/board";
import { analyzeBoard } from "./api/analysisApi";

function App() {
  const [aiStatus, setAiStatus] = useState(
    "La clase está lista. El siguiente paso será conectar Zoom y el análisis del backend."
  );
  const [analysisSummary, setAnalysisSummary] = useState("");
  const [analysisCorrections, setAnalysisCorrections] = useState<string[]>([]);
  const [analysisScore, setAnalysisScore] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");

  const stageRef = useRef<any>(null);

  const {
    selectedTool,
    setSelectedTool,
    selectedColor,
    setSelectedColor,
    lines,
    texts,
    images,
    selectedElement,
    setSelectedElement,
    textInput,
    setTextInput,
    pendingTextPosition,
    clearBoard,
    startDrawing,
    draw,
    stopDrawing,
    addTextToBoard,
    cancelText,
    updateTextPosition,
    addImageToBoard,
    updateImagePosition,
    deleteSelectedElement,
  } = useBoard();

  const stageSize = useMemo(() => {
    const width =
      window.innerWidth >= 1024
        ? Math.min(window.innerWidth * 0.62, 1100)
        : window.innerWidth * 0.9;

    const height = 420;

    return { width, height };
  }, []);

  const toolLabel =
    selectedTool === "pen"
      ? "Lápiz"
      : selectedTool === "eraser"
      ? "Borrador"
      : "Texto";

  const totalElements = lines.length + texts.length + images.length;

  const handleSelectTool = (tool: Tool) => {
    setSelectedTool(tool);

    if (tool === "pen") {
      setAiStatus("Modo lápiz activado.");
    } else if (tool === "eraser") {
      setAiStatus("Modo borrador activado.");
    } else {
      setAiStatus("Modo texto activado. Haz clic en el tablero.");
    }
  };

  const handleSelectColor = (color: string) => {
    setSelectedColor(color);
    if (selectedTool !== "eraser") {
      setSelectedTool("pen");
    }
    setAiStatus("Color actualizado.");
  };

  const handleClearBoard = () => {
    clearBoard();
    setAnalysisSummary("");
    setAnalysisCorrections([]);
    setAnalysisScore(null);
    setAnalysisError("");
    setAiStatus("El tablero fue limpiado.");
  };

  const handleUploadImage = (file: File) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        addImageToBoard(result);
        setAiStatus("Imagen agregada al tablero.");
      }
    };

    reader.readAsDataURL(file);
  };

  const exportBoardAsBase64 = (): string | null => {
    const stage = stageRef.current;
    if (!stage) return null;
    return stage.toDataURL({ pixelRatio: 2 });
  };

  const downloadBoard = () => {
    const dataURL = exportBoardAsBase64();
    if (!dataURL) return;

    const link = document.createElement("a");
    link.download = "tablero-edulive.png";
    link.href = dataURL;
    link.click();

    setAiStatus("El tablero fue exportado como imagen.");
  };

  const handleAddTextToBoard = () => {
    addTextToBoard();
    setAiStatus("Texto agregado al tablero.");
  };

  const handleCancelText = () => {
    cancelText();
    setAiStatus("Inserción de texto cancelada.");
  };

  const handleDeleteSelected = () => {
    deleteSelectedElement();
    setAiStatus("Elemento eliminado del tablero.");
  };

  const handleAnalyze = async () => {
    try {
      const base64Image = exportBoardAsBase64();

      if (!base64Image) {
        setAiStatus("No se pudo exportar el tablero para analizar.");
        setAnalysisError("No se pudo generar la imagen del tablero.");
        return;
      }

      setIsAnalyzing(true);
      setAnalysisError("");
      setAnalysisSummary("");
      setAnalysisCorrections([]);
      setAnalysisScore(null);
      setAiStatus("Analizando tablero...");

      const response = await analyzeBoard({
        subject: "Matematicas",
        base64Image,
      });

      setAnalysisSummary(response.summary);
      setAnalysisCorrections(response.corrections);
      setAnalysisScore(response.score ?? null);
      setAiStatus("Análisis completado correctamente.");
    } catch (error) {
      console.error(error);
      setAnalysisError(
        "No se pudo conectar con el backend o el endpoint devolvió un error."
      );
      setAiStatus("Ocurrió un error al analizar el tablero.");
    } finally {
      setIsAnalyzing(false);
    }
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
              disabled={isAnalyzing}
              className="rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isAnalyzing ? "Analizando..." : "Analizar"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-88px)] max-w-[1700px] grid-cols-12 gap-5 p-5">
        <aside className="col-span-12 xl:col-span-2">
          <BoardToolbar
            selectedTool={selectedTool}
            selectedColor={selectedColor}
            totalElements={totalElements}
            onSelectTool={handleSelectTool}
            onSelectColor={handleSelectColor}
            onClearBoard={handleClearBoard}
            onUploadImage={handleUploadImage}
          />
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

                  <button
                    onClick={handleDeleteSelected}
                    disabled={!selectedElement}
                    className="rounded-full bg-rose-100 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Eliminar seleccionado
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
                      onClick={handleAddTextToBoard}
                      className="rounded-2xl bg-gradient-to-r from-pink-500 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-white shadow-md"
                    >
                      Agregar
                    </button>

                    <button
                      onClick={handleCancelText}
                      className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              <BoardCanvas
                stageRef={stageRef}
                width={stageSize.width}
                height={stageSize.height}
                lines={lines}
                texts={texts}
                images={images}
                selectedElement={selectedElement}
                onStartDrawing={startDrawing}
                onDraw={draw}
                onStopDrawing={stopDrawing}
                onUpdateTextPosition={updateTextPosition}
                onUpdateImagePosition={updateImagePosition}
                onSelectText={(id) => setSelectedElement({ type: "text", id })}
                onSelectImage={(id) => setSelectedElement({ type: "image", id })}
                onClearSelection={() => setSelectedElement(null)}
              />
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
                <p className="font-bold text-green-300">
                  {isAnalyzing ? "Analizando..." : "Activo ahora"}
                </p>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="mt-5 w-full rounded-2xl bg-white py-3 font-bold text-slate-900 transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isAnalyzing ? "Analizando..." : "Analizar tablero"}
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

            <div className="rounded-[30px] border border-slate-100 bg-white p-5 shadow-xl">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Analysis Result
              </p>

              <h3 className="mt-2 text-xl font-bold text-slate-900">
                Resultado del análisis
              </h3>

              {analysisError && (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {analysisError}
                </div>
              )}

              <div className="mt-4 space-y-4 text-sm text-slate-600">
                <div>
                  <p className="font-semibold text-slate-800">Resumen</p>
                  <p>{analysisSummary || "Aún no hay análisis."}</p>
                </div>

                <div>
                  <p className="font-semibold text-slate-800">Correcciones</p>
                  {analysisCorrections.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {analysisCorrections.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No hay correcciones todavía.</p>
                  )}
                </div>

                <div>
                  <p className="font-semibold text-slate-800">Puntaje</p>
                  <p>{analysisScore !== null ? analysisScore : "Sin puntaje"}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default App;