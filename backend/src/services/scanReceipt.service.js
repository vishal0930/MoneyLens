import fs from "fs/promises";
import { HTTPSTATUS } from "../config/http.config.js";
import { v2 as cloudinary } from "cloudinary";
import { mistral, mistralModel } from "../config/mistral.config.js";

class BadRequestException extends Error {
  constructor(message) {
    super(message);
    this.status = HTTPSTATUS.BAD_REQUEST;
  }
}

export const scanReceiptService = async (file) => {
  if (!file) throw new BadRequestException("No file uploaded");

  try {
    console.log("📂 Processing file with Mistral AI...");

    let base64String;

    // ✅ Process file to base64
    if (file.buffer) {
      base64String = file.buffer.toString("base64");
    } else if (file.path) {
      const fileBuffer = await fs.readFile(file.path);
      base64String = fileBuffer.toString("base64");
    } else {
      throw new BadRequestException("Invalid file input");
    }

    const prompt = "Extract structured JSON from receipt (title, amount, date, description, category, paymentMethod, type). Return ONLY JSON.";

    let aiResponse;

    try {
      // ✅ Using Mistral with improved prompt structure and JSON enforcement
      const mistralResponse = await mistral.chat.complete({
        model: mistralModel, 
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: `${prompt}. Return it as a clean JSON object.` },
              {
                type: "image_url",
                imageUrl: {
                  url: `data:${file.mimetype};base64,${base64String}`,
                },
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0,
      });

      aiResponse = mistralResponse.choices[0].message.content;
      console.log("✅ Mistral scan successful.");
    } catch (err) {
      console.error("❌ Mistral scan failed:", err.message || err);
      console.error("Full error details:", JSON.stringify(err, null, 2));
      console.log("Falling back to Mock Data...");

      // Final Mock Fallback for Development
      aiResponse = JSON.stringify({
        title: `Mock: ${file.originalname || "Receipt"}`,
        amount: 10.0,
        date: new Date().toISOString().split("T")[0],
        description: "Mocked response due to AI failure",
        category: "General",
        paymentMethod: "CASH",
        type: "EXPENSE",
      });
    }

    // ✅ Clean response
    const cleaned = aiResponse
      .replace(/```json|```/g, "")
      .replace(/\n/g, " ")
      .trim();

    if (!cleaned) {
      return { error: "Could not read receipt content" };
    }

    // ✅ Safe JSON parse
    let data;
    try {
      data = JSON.parse(cleaned);
    } catch {
      return { error: "Invalid JSON response from AI" };
    }

    if (!data || (!data.amount && !data.date)) {
      return { error: "Receipt missing required information" };
    }

    // ✅ Upload to Cloudinary if needed
    let receiptUrl = "";
    if (file.path) {
      const uploadResult = await cloudinary.uploader.upload(file.path, {
        folder: "receipts",
      });
      receiptUrl = uploadResult.secure_url;
      await fs.unlink(file.path).catch(() => {});
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
