import { useState } from "react";
import type {
  BoardImage,
  BoardText,
  DrawLine,
  PendingTextPosition,
  SelectedElement,
  Tool,
} from "../types/board";

export function useBoard() {
  const [selectedTool, setSelectedTool] = useState<Tool>("pen");
  const [selectedColor, setSelectedColor] = useState("#ec4899");
  const [lines, setLines] = useState<DrawLine[]>([]);
  const [texts, setTexts] = useState<BoardText[]>([]);
  const [images, setImages] = useState<BoardImage[]>([]);
  const [selectedElement, setSelectedElement] = useState<SelectedElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const [textInput, setTextInput] = useState("");
  const [pendingTextPosition, setPendingTextPosition] =
    useState<PendingTextPosition>(null);

  const clearBoard = () => {
    setLines([]);
    setTexts([]);
    setImages([]);
    setSelectedElement(null);
    setTextInput("");
    setPendingTextPosition(null);
  };

  const startDrawing = (x: number, y: number) => {
    setSelectedElement(null);

    if (selectedTool === "text") {
      setPendingTextPosition({ x, y });
      return;
    }

    setIsDrawing(true);

    const newLine: DrawLine = {
      tool: selectedTool === "eraser" ? "eraser" : "pen",
      color: selectedTool === "eraser" ? "#ffffff" : selectedColor,
      points: [x, y],
    };

    setLines((prev) => [...prev, newLine]);
  };

  const draw = (x: number, y: number) => {
    if (!isDrawing) return;
    if (selectedTool === "text") return;

    setLines((prev) => {
      const lastLine = prev[prev.length - 1];
      if (!lastLine) return prev;

      const updatedLine: DrawLine = {
        ...lastLine,
        points: [...lastLine.points, x, y],
      };

      return [...prev.slice(0, -1), updatedLine];
    });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const addTextToBoard = () => {
    if (!pendingTextPosition) return;
    if (!textInput.trim()) return;

    const newText: BoardText = {
      id: Date.now(),
      x: pendingTextPosition.x,
      y: pendingTextPosition.y,
      text: textInput.trim(),
      color: selectedColor,
    };

    setTexts((prev) => [...prev, newText]);
    setSelectedElement({ type: "text", id: newText.id });
    setTextInput("");
    setPendingTextPosition(null);
  };

  const cancelText = () => {
    setTextInput("");
    setPendingTextPosition(null);
  };

  const updateTextPosition = (id: number, x: number, y: number) => {
    setTexts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, x, y } : item))
    );
  };

  const addImageToBoard = (src: string) => {
    const newImage: BoardImage = {
      id: Date.now(),
      x: 60,
      y: 60,
      width: 220,
      height: 160,
      src,
    };

    setImages((prev) => [...prev, newImage]);
    setSelectedElement({ type: "image", id: newImage.id });
  };

  const updateImagePosition = (id: number, x: number, y: number) => {
    setImages((prev) =>
      prev.map((item) => (item.id === id ? { ...item, x, y } : item))
    );
  };

  const deleteSelectedElement = () => {
    if (!selectedElement) return;

    if (selectedElement.type === "text") {
      setTexts((prev) => prev.filter((item) => item.id !== selectedElement.id));
    }

    if (selectedElement.type === "image") {
      setImages((prev) =>
        prev.filter((item) => item.id !== selectedElement.id)
      );
    }

    setSelectedElement(null);
  };

  return {
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
  };
}