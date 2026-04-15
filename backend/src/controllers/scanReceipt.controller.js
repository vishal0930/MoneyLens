import { asyncHandler } from "../middlewares/asyncHandler.middlerware.js";
import { scanReceiptService } from "../services/scanReceipt.service.js";
import { HTTPSTATUS } from "../config/http.config.js";

export const scanReceiptController = asyncHandler(
  async (req, res) => {
    const file = req.file;

    if (!file) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: "No file uploaded",
      });
    }

    const result = await scanReceiptService(file);

    return res.status(HTTPSTATUS.OK).json({
      message: "Receipt scanned successfully",
      data: result,
    });
  }
);
