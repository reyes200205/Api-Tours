import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from 'cloudinary'; 


cloudinary.config({
  cloud_name: 'tu_cloud_name',  
  api_key: 'tu_api_key',       
  api_secret: 'tu_api_secret'  
});

const prisma = new PrismaClient();

export const insertTour = async (req: Request, res: Response) => {
    try {
        const { name, description, price, imageUrl,location, startDate, endDate, maxCapacity, category } = req.body;

        
        if (!name || !description || !price || !imageUrl || !location || !startDate || !endDate || !maxCapacity ||!category) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const cloudinaryResponse = await cloudinary.uploader.upload(imageUrl, {
            folder: 'tours', 
        });

        const allowedNames = ["asia", "europa", "america-latina"];

        if (!allowedNames.includes(category.toLowerCase())) {
            return res.status(400).json({ message: "Invalid category" });
        }
        

        
        const imageCloudinaryUrl = cloudinaryResponse.secure_url;

        const startDateParsed = new Date(startDate);
        const endDateParsed = new Date(endDate);
        
        const newTour = await prisma.tour.create({
            data: { name, description, price, imageUrl: imageCloudinaryUrl, location, startDate: startDateParsed, endDate: endDateParsed, maxCapacity, category },
        });

        return res.status(201).json({ message: "Tour created successfully", tour: newTour });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error inserting tour" });
    }
};

export const activateTour = async (req: Request, res: Response) => {
    try{
        const { id } = req.params;
        const tourId = parseInt(id);
        const tour = await prisma.tour.findUnique({
            where: { id: tourId },
            select: { state: true },
        });

        if (!tour) {
            return res.status(404).json({ message: "Tour not found" });
        }

        if (tour.state === "Inactive") {
            const updatedTour = await prisma.tour.update({
                where: { id: tourId },
                data: { state: "Active" },
            });
            return res.status(200).json({ message: "Tour activated successfully" });
        } else {
            return res.status(400).json({ message: "Tour is already active" });
        }
    }catch(error){
        res.status(500).json({ message: "Error activating tour" });
    }
}

export const inactivateTour = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const tourId = parseInt(id);
        const tour = await prisma.tour.findUnique({
            where: { id: tourId },
            select: { state: true },
        });

        if (!tour) {
            return res.status(404).json({ message: "Tour not found" });
        }

        if (tour.state === "Active") {
            const updatedTour = await prisma.tour.update({
                where: { id: tourId },
                data: { state: "Inactive" },
            });
            return res.status(200).json({ message: "Tour inactivated successfully" });
        } else {
            return res.status(400).json({ message: "Tour is already inactive" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error inactivating tour" });
    }
};


export const getTours = async (req: Request, res: Response) => {
    try {
        const { category } = req.params;

        
        const categoryFilter = typeof category === 'string' ? category : undefined;

        if (!category) {
            return res.status(400).json({ message: "Category parameter is required" });
        }
            
        
        const tours = await prisma.tour.findMany({
            where: {
                category: categoryFilter,
                state: "Active",
            },
        });

        if (tours.length === 0) {
            return res.status(404).json({ message: "No tours found" });
        }

        return res.status(200).json({message: "Tours retrieved successfully", tours});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error retrieving tours' });
    }
};
