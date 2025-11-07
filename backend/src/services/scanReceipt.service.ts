import fs from "fs";
import axios from "axios";
import { HTTPSTATUS } from "../config/http.config";
import { genAI, genAIModel } from "../config/google-ai.config";
import { createUserContent, createPartFromBase64 } from "../helpers/genAI.helpers";
import { receiptPrompt } from "../utils/prompt";
import { v2 as cloudinary } from "cloudinary";

class BadRequestException extends Error {
  status: number;
  constructor(message: string) {
    super(message);
    this.status = HTTPSTATUS.BAD_REQUEST;
  }
}

export const scanReceiptService = async (file: Express.Multer.File | undefined) => {
  if (!file) throw new BadRequestException("No file uploaded");

  try {
    if (!file.path) throw new BadRequestException("Failed to upload file");

    console.log("📂 Uploaded file path:", file.path);

    let base64String: string;
    const isCloudinaryUrl = file.path.startsWith("http");

    // ✅ Convert image to base64
    if (isCloudinaryUrl) {
      // File already uploaded to Cloudinary → download it
      const response = await axios.get(file.path, { responseType: "arraybuffer" });
      base64String = Buffer.from(response.data).toString("base64");
    } else {
      // Local file upload (rare, e.g., via Postman)
      const fileBuffer = fs.readFileSync(file.path);
      base64String = fileBuffer.toString("base64");
    }

    if (!base64String) throw new BadRequestException("Could not process file");

    // ✅ Send to Gemini / Google GenAI for content extraction
    const result = await genAI.models.generateContent({
      model: genAIModel,
      contents: [
        createUserContent([
          { text: receiptPrompt },
          createPartFromBase64(base64String, file.mimetype),
        ]),
      ],
      config: {
        temperature: 0,
        topP: 1,
        responseMimeType: "application/json",
      },
    });

    const response = result.text;
    const cleanedText = response?.replace(/```(?:json)?\n?/g, "").trim();

    if (!cleanedText) return { error: "Could not read receipt content" };

    const data = JSON.parse(cleanedText);

    if (!data.amount || !data.date) {
      return { error: "Receipt missing required information" };
    }

    // ✅ If already on Cloudinary → use the URL directly
    let receiptUrl = file.path;

    // If it was a local file → upload manually
    if (!isCloudinaryUrl) {
      const uploadResult = await cloudinary.uploader.upload(file.path, {
        folder: "receipts",
      });
      receiptUrl = uploadResult.secure_url;

      // Delete local temp file
      fs.unlinkSync(file.path);
    }

    return {
      title: data.title || "Receipt",
      amount: data.amount,
      date: data.date,
      description: data.description || "",
      category: data.category || "General",
      paymentMethod: data.paymentMethod || "CASH",
      type: data.type || "EXPENSE",
      receiptUrl,
    };
  } catch (error) {
    console.error("❌ Scan receipt error:", error);
    return { error: "Receipt scanning service unavailable" };
  }
};

