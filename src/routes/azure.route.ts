import express from "express";
import { uploadImageToAzure, deleteImageFromAzure } from "../controllers/azure.controller";

const router = express.Router();

router.post("/blob/upload", uploadImageToAzure);
router.delete("/blob/delete", deleteImageFromAzure);

export default router;
