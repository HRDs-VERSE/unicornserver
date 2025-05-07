import mongoose, { Document, Schema, model } from "mongoose";

interface ITrip extends Document {
    vendorId: mongoose.Types.ObjectId; 
    driverId?: mongoose.Types.ObjectId;
    pickupLocation: string;
    dropoffLocation: string;
    pickupDate?: Date;
    pickupTime?: Date;
    duration: number;
    durationUnit: "hours" | "days";
    fare: number;
    commission: number;
    tripType: "one-way" | "round" | "multi-city";
    commissionState: "received" | "transferred"
    paymentId: string,
    carType: "sedan" | "suv" | "mpv" | "luxury" | "luxury suv" | "traveller";
    carName?: string;
    status: "pending" | "accepted" | "completed" | "cancelled";
    additional: string;
    verifyCode: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const tripSchema = new Schema<ITrip>({
    vendorId: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    driverId: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
        required: false 
    },
    pickupLocation: { 
        type: String, 
        required: true 
    },
    dropoffLocation: { 
        type: String, 
        required: true 
    },
    pickupDate: {
        type: Date,
        required: true
    },
    pickupTime: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    durationUnit: {
        type: String,
        enum: ["hours", "days"],
        required: true
    },
    tripType: {
        type: String,
        enum: ["one-way", "round", "multi-city"],
        required: true
    },
    fare: { 
        type: Number, 
        required: true 
    },
    commission: {
        type: Number,
        required: true
    },
    commissionState: {
        type: String,
        enum: ["received", "transferred"]
    },
    paymentId: {
        type: String
    },
    carType: {
        type: String,
        enum: ["sedan", "suv", "mpv", "luxury sedan", "luxury suv", "traveller", "urbania", "bus"],
        required: true
    },
    carName: {
        type: String
    },
    additional: {
        type: String
    },
    status: { 
        type: String, 
        enum: ["pending", "accepted", "completed", "cancelled"], 
        default: "pending" 
    },
    verifyCode: {
        type: String
    }
}, { timestamps: true });

const Trip = model<ITrip>("Trip", tripSchema);
export default Trip
