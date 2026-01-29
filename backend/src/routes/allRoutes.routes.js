import {Router} from "express";
import { getUrl,getHealth,getPaste,pasteText } from "../controllers/allControllers.controllers.js";
const router=Router();

router.get('/healthz',getHealth);
router.post('/pastes',pasteText);
router.get('/pastes/:id',getUrl);
router.get('/p/:id',getPaste);

export default router;