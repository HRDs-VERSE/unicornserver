import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { azureBlobUpload } from "../lib/azureBlobUpload";
import { deleteBlobUpload } from "../lib/deleteBlobUpload";

export const uploadImageToAzure = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { base64Image, containerName } = req.body;

    if (!base64Image || !containerName) {
        res.status(400).json({ message: "base64Image and containerName are required" });
        return;
    }

    const result = await azureBlobUpload(base64Image, containerName);
    
    if (!result.success) {
        res.status(500).json({ message: "Failed to upload image" });
        return;
    }

    res.status(201).json({ success: true, url: result.url });
    return;
});

export const deleteImageFromAzure = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { blobUrl } = req.body;

    if (!blobUrl) {
        res.status(400).json({ message: "blobUrl is required" });
        return;
    }

    const result = await deleteBlobUpload(blobUrl);

    if (!result.success) {
        res.status(500).json({ message: result.message });
        return;
    }

    res.status(200).json({ success: true, message: result.message });
    return;
});
