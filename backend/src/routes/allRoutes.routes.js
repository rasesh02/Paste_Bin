import {Router} from "express";
import { getUrl,getHealth,getPaste,pasteText } from "../controllers/allControllers.controllers.js";
const router=Router();

router.get('/api/healthz',getHealth);
router.post('/api/pastes',pasteText);
router.get('/api/pastes/:id',getUrl);
router.get('/p/:id',getPaste);

export default router;