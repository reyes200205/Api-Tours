import { Router, Request, Response } from "express";
import { registerUser } from "../controller/authController";
import { LoginUser } from "../controller/authController";
import { verifyToken } from "../controller/tokenController";


const router = Router();


router.post("/register", (req: Request, res: Response) => {
    registerUser(req, res);
});

router.post("/login", (req: Request, res: Response) => {
    LoginUser(req, res);
});

router.get("/test", verifyToken, (req: Request, res: Response) => {
    res.send("Test");
});


export default router;