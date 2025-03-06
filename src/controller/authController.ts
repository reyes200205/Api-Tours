import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const twilio = require('twilio');
require('dotenv').config();

if(!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER){
    throw new Error("TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN or TWILIO_PHONE_NUMBER is not set");
}

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

if(!process.env.JWT_SECRET){
    throw new Error("JWT_SECRET is not set");
}

const secret = process.env.JWT_SECRET;

interface TokenPayload {
    userId: string;
    email: string;
}

const prisma = new PrismaClient();

export const registerUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password, phoneNumber, address } = req.body;

        if (!name || !email || !password || !phoneNumber || !address) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }


        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: { name, email, password: hashedPassword, phoneNumber, address },
        });


        const sendMessage = await client.messages.create({
            body: `Welcome to Tours, ${newUser.name}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: newUser.phoneNumber
        });



        return res.status(201).json({ message: "User created successfully", user: newUser });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erro registering user" });
    }
};

export const LoginUser = async (req: Request, res: Response) => {
    try {

        const { email, password } = req.body;
        console.log(email, password);

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(400).json({ message: "Credenciales are incorrectas" });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(400).json({ message: "Credentials are incorrect" });
        }

        const token = jwt.sign({
            userId: user.id,
            email: user.email,
        }, secret, {
            expiresIn: "1h",
        })

        return res.status(200).json({ message: "Logi successful" , token });


    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error logging in user" });
    }
}
