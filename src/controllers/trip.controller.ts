import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Trip from "../models/trip.model";

// Create a new trip
export const createTrip = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { pickupLocation, dropoffLocation, duration, fare, commission, carType, carName, additional, pickupDate, pickupTime, tripType, durationUnit } = req.body;
    const vendorId = req.params.userId;
   
    if (!vendorId) {
        res.status(401).json({success: false, message: "Not authorized" });
        return;
    }

    if(!pickupLocation || !dropoffLocation || !duration || !fare || !commission || !carType || !pickupDate || !pickupTime || !tripType || !durationUnit || !duration) {
        res.status(400).json({success: false, message: "All fields are required"});
        return;
    }

    const trip = await Trip.create({
        vendorId,
        pickupLocation,
        dropoffLocation,
        pickupDate,
        pickupTime,
        duration,
        durationUnit,
        tripType,
        fare,
        commission,
        carType,
        carName,
        additional,
        status: "pending"
    });

    res.status(201).json({success: true, message: "Trip created", trip});
    return;
});


export const getVendorTrips = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const vendorId = req.params.userId;
    const tripState = req.query.tripState as "pending" | "accepted" | "completed" | "cancelled";
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!vendorId) {
        res.status(400).json({ success: false, message: "Vendor ID is required" });
        return;
    }

    const matchStage: any = { vendorId };
    if (tripState) {
        matchStage.status = tripState;
        matchStage.vendorId = new mongoose.Types.ObjectId(vendorId)
    }

    const trips = await Trip.aggregate([
        { $match: matchStage },
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit }
    ]);

    const totalTrips = await Trip.countDocuments(matchStage);

    res.status(200).json({
        success: true,
        trips,
        pagination: {
            totalTrips,
            totalPages: Math.ceil(totalTrips / limit),
            currentPage: page,
            limit
        }
    });
});


// Get all trips for a driver
export const getDriverTrips = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const driverId = req.params.id;

    if (!driverId) {
        res.status(401).json({ message: "Not authorized" });
        return;
    }

    const trips = await Trip.find({ driverId })
        .populate('vendorId', 'fullName mobileNumber')
        .sort('-createdAt');

    res.status(200).json(trips);
    return;
});

export const getAllTripsWithFilters = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { vendorId, driverId, tripType, carType, tripStatus } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const matchStage: any = {};

    if (vendorId) matchStage.vendorId = new mongoose.Types.ObjectId(vendorId as string);
    if (driverId) matchStage.driverId = new mongoose.Types.ObjectId(driverId as string);
    if (tripType) matchStage.tripType = tripType;
    if (tripStatus) matchStage.status = tripStatus === "ongoing" ? "accepted" : tripStatus;
    if (carType) matchStage.carType = carType;

    console.log(matchStage)

    const trips = await Trip.aggregate([
        { $match: matchStage },
        {
            $lookup: {
                from: "users",
                localField: "vendorId",
                foreignField: "_id",
                as: "vendorDetails"
            }
        },
        { $unwind: { path: "$vendorDetails", preserveNullAndEmptyArrays: true } },
        {
            $project: {
              	fare: 1,
              	pickupLocation: 1,
                dropoffLocation: 1,
                duration: 1,
                commission: 1,
                carType: 1,
                tripType: 1,
                status: 1,
                carName: 1,
                additional: 1,
                pickupDate: 1,
                pickupTime: 1,
                vendorId: 1,
                "vendorDetails._id": 1,
                "vendorDetails.fullName": 1,
                "vendorDetails.mobileNumber": 1,
                "vendorDetails.avatar": 1
            }
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit }
    ]);

    const totalTrips = await Trip.countDocuments(matchStage);

    res.status(200).json({
        success: true,
        message: "Trips fetched successfully",
        currentPage: page,
        totalPages: Math.ceil(totalTrips / limit),
        totalTrips,
        trips
    });
});

// Accept a trip (by driver)
export const acceptTrip = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const tripId = req.params.tripId;
    const driverId = req.params.driverId;
    const paymentId = req.params.paymentId;

    if (!driverId) {
        res.status(401).json({ message: "Driver Id is required, Not authorized" });
        return;
    }

    if(!paymentId){
        res.status(401).json({success: false, message: "Payment Id is required"})
        return;
    }

    const trip = await Trip.findById(tripId);

    if (!trip) {
        res.status(404).json({ message: "Trip not found" });
        return;
    }

    if (trip.status !== "pending") {
        res.status(400).json({ message: "Trip is not available for acceptance" });
        return;
    }

    trip.driverId = new mongoose.Types.ObjectId(driverId);
    trip.status = "accepted";
    trip.commissionState = "received"
    trip.paymentId = paymentId
    await trip.save();

    res.status(200).json({message: "Trip accepted successfully", trip});
    return;
});

// Complete a trip
export const completeTrip = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { tripId } = req.params;
    const { verifyCode } = req.body;
    const driverId = req.params.id;

    if (!driverId) {
        res.status(401).json({ message: "Not authorized" });
        return;
    }

    const trip = await Trip.findById(tripId);

    if (!trip) {
        res.status(404).json({ message: "Trip not found" });
        return;
    }

    if (trip.driverId?.toString() !== driverId.toString()) {
        res.status(401).json({ message: "Not authorized to complete this trip" });
        return;
    }

    if (trip.status !== "accepted") {
        res.status(400).json({ message: "Trip is not in accepted state" });
        return;
    }

    if (trip.verifyCode !== verifyCode) {
        res.status(400).json({ message: "Invalid verification code" });
        return;
    }

    trip.status = "completed";
    await trip.save();

    res.status(200).json({message: "Trip completed successfully", trip});
    return;
});

// Cancel a trip
export const cancelTripByVendor = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { tripId, vendorId } = req.params;

    if (!vendorId) {
        res.status(401).json({ message: "Not authorized" });
        return;
    }

    const trip = await Trip.findById(tripId);

    if (!trip) {
        res.status(404).json({ message: "Trip not found" });
        return;
    }

    if (trip.vendorId.toString() !== vendorId.toString()) {
        res.status(401).json({ message: "Not authorized to cancel this trip" });
        return;
    }

    if (trip.status === "completed" || trip.status === "cancelled") {
        res.status(400).json({ message: "Trip cannot be cancelled" });
        return;
    }

    if(trip.status === "accepted"){
        res.status(400).json({ message: "Trip cannot be cancelled, driver has accepted the trip" });
    }

    trip.status = "cancelled";
    await trip.save();

    res.status(200).json({message: "Trip cancelled successfully" ,trip});
    return;
}); 