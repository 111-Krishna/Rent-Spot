// routes/propertyRoutes.js
import express from "express";
import {
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  deleteProperty,
} from "../controllers/propertyController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";
import multer from "multer";

const router = express.Router();

// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // folder must exist
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });


// Public routes
router.get("/", getProperties);
router.get("/:id", getProperty);

// Admin routes
// router.post("/", protect, authorize("admin"), upload.array("images", 5), createProperty);
router.post(
  "/",
  protect,
  authorize("admin", "user"), // ✅ allow both admin and normal user
  upload.array("images", 5),
  createProperty
);

router.put("/:id", protect, authorize("admin"), upload.array("images", 5), updateProperty);
router.delete("/:id", protect, authorize("admin"), deleteProperty);

export default router;
