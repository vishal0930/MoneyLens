// src/helpers/genAI.helpers.ts
import { Part } from "@google/genai";

export const createUserContent = (parts: Part[]) => ({
  role: "user",
  parts,
});

export const createPartFromBase64 = (base64String: string, mimeType: string): Part => ({
  inlineData: {
    data: base64String,
    mimeType,
  },
});
