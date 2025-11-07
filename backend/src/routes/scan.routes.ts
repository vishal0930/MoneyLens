import express from "express";
import multer from "multer";
import { scanReceiptController } from "../controllers/scanReceipt.controller";

const router = express.Router();

// Store uploaded files temporarily in 'uploads/'
const upload = multer({ dest: "uploads/" });

router.post("/scan", upload.single("file"), scanReceiptController);

export default router;
