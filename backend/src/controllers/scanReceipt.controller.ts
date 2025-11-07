import { Request, Response } from "express";
import {asyncHandler } from "../middlewares/asyncHandler.middlerware";

import { scanReceiptService } from "../services/scanReceipt.service";
import { HTTPSTATUS } from "../config/http.config";

export const scanReceiptController = asyncHandler(
  async (req: Request, res: Response) => {
    const file = req.file;

    const result = await scanReceiptService(file);

    return res.status(HTTPSTATUS.OK).json({
      message: "Receipt scanned successfully",
      data: result,
    });
  }
);
