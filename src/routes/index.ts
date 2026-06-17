import { Router } from "express";
import authRoutes from "./auth.routes";
import adminRoutes from "./admin.routes";
import destinationRoutes from "./destination.routes";
import packageRoutes from "./package.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/destinations", destinationRoutes);
router.use("/packages", packageRoutes);

export default router;