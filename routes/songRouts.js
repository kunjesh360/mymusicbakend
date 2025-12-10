import { Router } from "express";
import { search, song } from "../controllers/spaceControllers.js";


const router = Router();

router.post('/addsong',song);
router.get('/search', search);
export default router;