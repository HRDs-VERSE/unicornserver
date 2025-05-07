import mongoose, { Document, Schema, model } from "mongoose";

interface IReview extends Document {
    userId: Schema.Types.ObjectId;
    reviewerId: Schema.Types.ObjectId;  
    rating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
}

const reviewSchema = new Schema<IReview>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reviewerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    }
}, { 
    timestamps: true 
});

// Index for efficient querying
reviewSchema.index({ userId: 1, reviewerId: 1 }, { unique: true });

const Review = model<IReview>("Review", reviewSchema);
export default Review; 