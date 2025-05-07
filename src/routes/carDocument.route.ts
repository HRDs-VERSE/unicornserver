import { Router } from "express";
import { deleteCarDocuments, getCarDocuments, updateCarDocuments, uploadCarDocuments } from "../controllers/carDocument.controller";

const router: Router = Router();

router.route("/create").post(uploadCarDocuments);
router.route("/get-user/:userId").get(getCarDocuments);
router.route("/update/:userId").patch(updateCarDocuments);
router.route("/delete/:id").delete(deleteCarDocuments);

export default router;
