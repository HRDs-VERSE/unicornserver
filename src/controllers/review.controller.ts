import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import Review from "../models/review.model";

// Create a new review
export const createReview = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { user, rating, comment } = req.body;
    const reviewer = req.params.id;

    if (!reviewer) {
        res.status(401).json({ message: "Not authorized" });
        return;
    }

    const review = await Review.create({
        userId: user,
        reviewerId: reviewer,
        rating,
        comment
    });

    res.status(201).json(review);
    return;
});

// Get all reviews for a user
export const getUserReviews = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;

    const reviews = await Review.find({ userId: userId })
        .populate('reviewer', 'fullName avatar')
        .sort('-createdAt');

    res.status(200).json(reviews);
    return;
});

// Update a review
export const updateReview = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const reviewer = req.params.id;

    const review = await Review.findById(reviewId);

    if (!review) {
        res.status(404).json({ message: "Review not found" });
        return;
    }

    if (review.reviewerId.toString() !== reviewer?.toString()) {
        res.status(401).json({ message: "Not authorized to update this review" });
        return;
    }

    review.rating = rating;
    review.comment = comment;
    await review.save();

    res.status(200).json(review);
    return;
});

// Delete a review
export const deleteReview = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { reviewId } = req.params;
    const reviewer = req.params.id;

    const review = await Review.findById(reviewId);

    if (!review) {
        res.status(404).json({ message: "Review not found" });
        return;
    }

    if (review.reviewerId.toString() !== reviewer?.toString()) {
        res.status(401).json({ message: "Not authorized to delete this review" });
        return;
    }

    await review.deleteOne();

    res.status(200).json({ message: "Review deleted successfully" });
    return;
}); 