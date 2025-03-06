import express, { Request, Response } from "express";
import authRoutes from "./routes/authRoutes";
import { v2 as cloudinary } from 'cloudinary';
import tourRoutes from "./routes/toursRoutes";
import reservationRoutes from "./routes/reservationRoutes";
import cors from 'cors';

cloudinary.config({
  cloud_name: 'dpyjfaze9',  
  api_key: '827673878626392',
  api_secret: 'avCrwPrhrTsqcGTWZFVtV5pTcRE',    
});

const app = express();


app.use(cors({
  origin: [
    'http://localhost:5176',  
    'http://localhost:3006',  
    'https://checkout.stripe.com' 
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Access-Control-Allow-Origin'
  ],
  credentials: true
}));

app.options('*', cors());

app.get("/", (req: Request, res: Response) => {
  res.send("Servidor corriendo🚀!");
});

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/tours", tourRoutes);
app.use("/reservations", reservationRoutes);

const PORT = process.env.PORT || 3007;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

export default app;