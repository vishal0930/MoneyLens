import { Mistral } from "@mistralai/mistralai";
import { Env } from "./env.config.js";

export const mistral = new Mistral({
  apiKey: Env.MISTRAL_API_KEY,
});

export const mistralModel = "pixtral-12b-2409";
