import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import CarDocument from "../models/carDocument.model";

// Upload Car Documents
export const uploadCarDocuments = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { userId, documents } = req.body;

    if (!userId || !documents) {
        res.status(400).json({ success: false, message: "User ID and documents are required" });
        return;
    }

    const existingDoc = await CarDocument.findOne({ userId });

    if (existingDoc) {
        res.status(400).json({ success: false, message: "Documents already uploaded for this user" });
        return;
    }

    const newCarDocument = await CarDocument.create({
        userId,
        ...documents,
    });

    if (!newCarDocument) {
        res.status(500).json({ success: false, message: "Failed to upload documents" });
        return;
    }

    res.status(201).json({ success: true, message: "Documents uploaded successfully", document: newCarDocument });
    return;
});

// Get Car Documents by User ID
export const getCarDocuments = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.userId;

    if (!userId) {
        res.status(400).json({ success: false, message: "User ID is required" });
        return;
    }

    const carDocuments = await CarDocument.findOne({ userId });

    if (!carDocuments) {
        res.status(404).json({ success: false, message: "Documents not found" });
        return;
    }

    res.status(200).json({ success: true, message: "Documents fetched successfully", documents: carDocuments });
    return;
});

// Update Car Documents
export const updateCarDocuments = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.userId;
    const documents = req.body;

    if (!userId || !documents) {
        res.status(400).json({ success: false, message: "User ID and documents are required" });
        return;
    }

    const updatedDocuments = await CarDocument.findOneAndUpdate(
        { userId },
        { $set: documents },
        { new: true }
    );

    if (!updatedDocuments) {
        res.status(404).json({ success: false, message: "Documents not found" });
        return;
    }
    
    res.status(200).json({ success: true, message: "Documents updated successfully", documents: updatedDocuments });
    return;
});

// Delete Car Documents
export const deleteCarDocuments = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.userId;

    if (!userId) {
        res.status(400).json({ success: false, message: "User ID is required" });
        return;
    }

    const deletedDocument = await CarDocument.findOneAndDelete({ userId });

    if (!deletedDocument) {
        res.status(404).json({ success: false, message: "Documents not found" });
        return;
    }

    res.status(200).json({ success: true, message: "Documents deleted successfully" });
    return;
});
