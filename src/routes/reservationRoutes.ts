import { Router, Request, Response } from "express";
import { createSession } from "../controller/reservationController";
import { confirmPayment } from "../controller/reservationController";
import { getReservation } from "../controller/reservationController";


const router = Router();


router.get("/test", (req: Request, res: Response) => {
    res.send("Test reservation");
});

router.post("/createPay", (req: Request, res: Response) => {
    createSession(req, res);
});

router.get("/success", (req: Request, res: Response) => {
    confirmPayment(req, res);
});

router.get("/:id", async (req: Request, res: Response) => {
    await getReservation(req, res);
});
export default router;