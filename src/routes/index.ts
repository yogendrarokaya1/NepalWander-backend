import { Router } from "express";
import authRoutes from "./auth.routes";

const router = Router();


console.log("✅ Routes loaded");
console.log("✅ Registering /auth routes");

router.use("/auth", authRoutes);

export default router;