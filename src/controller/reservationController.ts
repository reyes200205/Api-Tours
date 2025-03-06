import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const YOUR_DOMAIN = "http://localhost:3007";

export const createSession = async (req: Request, res: Response) => {
  try {
    console.log("Datos recibidos para crear la sesión:", req.body);
    const { userId, numberOfPeople, tourId } = req.body;

    if (!numberOfPeople || !tourId) {
      console.error("Faltan parámetros en la solicitud:", {
        numberOfPeople,
        tourId,
      });
      return res
        .status(400)
        .json({ message: "Faltan datos: numberOfPeople o tourId" });
    }

    const tour = await prisma.tour.findUnique({
      where: { id: Number(tourId) },
    });

    console.log("Tour encontrado:", tour);

    if (!tour) {
      console.error(`Tour con id ${tourId} no encontrado`);
      return res.status(404).json({ message: "Tour not found" });
    }

    const price = numberOfPeople * tour.price;

    console.log("Precio calculado:", price);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: tour.name,
            },
            unit_amount: price * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${YOUR_DOMAIN}/reservations/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${YOUR_DOMAIN}/cancel`,
      metadata: {
        userId,
        tourId,
        numberOfPeople,
      },
    });

    console.log("Sesión de Stripe creada con éxito:");

    return res.status(200).json({
      sessionUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Error creando la sesión de pago:", error);
    return res.status(500).json({
      message: "Error al crear la sesión de pago",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

export const confirmPayment = async (req: Request, res: Response) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ message: "session_id  requerido" });
    }

    const session = await stripe.checkout.sessions.retrieve(
      session_id as string
    );

    if (session.payment_status === "paid") {
      const metadata = session.metadata;
      if (!metadata) {
        return res
          .status(400)
          .json({
            message: "No se encontraron los datos de la reserva en metadata",
          });
      }

      const { userId, tourId, numberOfPeople } = metadata;

      if (!userId || !tourId || !numberOfPeople) {
        return res
          .status(400)
          .json({ message: "Faltan parámetros en metadata" });
      }

      const tour = await prisma.tour.findUnique({
        where: { id: Number(tourId) },
        select: { state: true },
      });

      if (!tour) {
        return res.status(404).json({ message: "Tour no encontrado" });
      }

      if (tour.state !== "Active") {
        return res.status(400).json({ message: "El tour no está activo" });
      }
      const newReservation = await prisma.reservation.create({
        data: {
          userId: Number(userId),
          tourId: Number(tourId),
          reservationDate: new Date(),
          status: "Confirmed",
          numberOfPeople: Number(numberOfPeople),
        },
      });

      return res.redirect(
        `http://localhost:5176/reservation-confirmed?id=${newReservation.id}`
      );
    } else {
      return res.status(400).json({ message: "Pago no completado" });
    }
  } catch (error) {
    console.error("Error al confirmar el pago:", error);
    return res.status(500).json({
      message: "Error al confirmar el pago",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

export const getReservation = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: Number(id) },
      include: {
        tour: true,
      },
    });

    if (reservation) {
      return res.status(200).json({
        id: reservation.id,
        tourName: reservation.tour.name,
        reservationDate: reservation.reservationDate,
        numberOfPeople: reservation.numberOfPeople,
      });
    } else {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }
  } catch (error) {
    console.error("Error al obtener la reserva:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};
