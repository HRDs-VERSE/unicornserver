import { Router } from "express";
import { auth, getUserProfile, initiateRegistration, updateUserProfile, verifyUser } from "../controllers/user.controller";
        
const router: Router = Router()

router.route("/auth-boarding").post(initiateRegistration)
router.route("/auth").post(auth)
router.route("/profile/:id").get(getUserProfile)
router.route("/profile/update/:id").patch(updateUserProfile)
router.route("/verify").patch(verifyUser)

export default router 