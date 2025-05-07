import { Router } from "express";
import { 
    createTrip, 
    getVendorTrips, 
    getDriverTrips, 
    acceptTrip, 
    completeTrip, 
    getAllTripsWithFilters,
    cancelTripByVendor
} from "../controllers/trip.controller";
        
const router: Router = Router()

// Vendor routes
router.route("/create/:userId").post(createTrip)
router.route("/vendor/:userId").get(getVendorTrips)
router.route("/get-all/").get(getAllTripsWithFilters)

// Driver routes
router.route("/driver").get(getDriverTrips)
router.route("/accept/:tripId/:driverId/:paymentId").patch(acceptTrip)
router.route("/complete/:tripId").post(completeTrip)

// Common routes
router.route("/cancel/:tripId/:vendorId").patch(cancelTripByVendor)

export default router 