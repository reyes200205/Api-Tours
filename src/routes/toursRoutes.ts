import { Router, Request, Response } from "express";
import { insertTour } from "../controller/toursController";
import { inactivateTour } from "../controller/toursController";
import { activateTour } from "../controller/toursController";
import { getTours } from "../controller/toursController";

const router = Router();


router.post("/insert", (req: Request, res: Response) => {   
    insertTour(req, res);
});

router.patch("/inactivate/:id", async (req: Request, res: Response) => {
    await inactivateTour(req, res);
});

router.patch("/activate/:id", async (req: Request, res: Response) => {
    await activateTour(req, res);
});

router.get("/category/:category?", async (req: Request, res: Response) => {
    await getTours(req, res);
});
export default router;