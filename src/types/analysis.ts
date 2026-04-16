export type AnalyzeBoardRequest = {
  subject: string;
  base64Image: string;
};

export type AnalyzeBoardResponse = {
  success: boolean;
  summary: string;
  corrections: string[];
  score?: number;
};