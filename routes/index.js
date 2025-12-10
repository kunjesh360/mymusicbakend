import { Router } from "express";
// import userRoutes from "./userRoutes.js";
import songRoutes from "./songRouts.js";

const router = Router();

// router.use("/user", userRoutes);
router.use("/song", songRoutes);

export default router;
