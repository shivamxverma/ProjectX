import {Router} from 'express';
import { loginUser, LogoutUser, registerUser } from '../controllers/user.controller.js';
import {upload} from '../midddlewares/multer.middleware.js';
import { verifyJWT } from '../midddlewares/auth.middleware.js';

const router = Router();

router.route("/register").post(upload.fields([{name : 'avatar', maxCount : 1}, {name : 'coverImage', maxCount : 1}]), registerUser);

router.route("/login").post(loginUser);

// Secured Route

router.route("/logout").post(verifyJWT,LogoutUser);

export default router;
