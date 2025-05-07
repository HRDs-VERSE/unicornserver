import { Router } from "express";
import { createReview, getUserReviews, updateReview, deleteReview } from "../controllers/review.controller";
        
const router: Router = Router()

router.route("/create").post(createReview)
router.route("/user/:userId").get(getUserReviews)
router.route("update/:reviewId").patch(updateReview)
router.route("/delete/:reviewId").delete(deleteReview)

export default router 