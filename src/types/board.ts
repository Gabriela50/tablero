export type Tool = "pen" | "eraser" | "text";

export type DrawLine = {
  tool: "pen" | "eraser";
  color: string;
  points: number[];
};

export type BoardText = {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
};

export type BoardImage = {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  src: string;
};

export type PendingTextPosition = {
  x: number;
  y: number;
} | null;

export type SelectedElement =
  | { type: "text"; id: number }
  | { type: "image"; id: number }
  | null;