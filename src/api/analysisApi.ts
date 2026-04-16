import type {
  AnalyzeBoardRequest,
  AnalyzeBoardResponse,
} from "../types/analysis";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is missing.");
}

export async function analyzeBoard(
  payload: AnalyzeBoardRequest
): Promise<AnalyzeBoardResponse> {
  const response = await fetch(`${API_BASE_URL}/board/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Error analyzing board.");
  }

  return response.json();
}