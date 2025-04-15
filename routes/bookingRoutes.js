import express from "express";
import ParkingSlot from "../models/ParkingSlots.js";

const router = express.Router();

// Get Booking History (Total bookings + Dates) - POST request
router.post("/user", async (req, res) => {
    const { userId, type } = req.body; // type: "parking" or "seat"

    // Currently only supports "parking" (for "seat", future implementation needed)
    if (type !== "parking") {
        return res.status(400).json({ message: "Seat booking history not yet implemented." });
    }

    try {
        // Find all slots that have bookings for the user
        const slots = await ParkingSlot.find({ "bookings.userId": userId });

        let totalBookings = 0;
        let bookedDates = new Set();

        slots.forEach(slot => {
            slot.bookings.forEach(booking => {
                if (booking.userId === userId) {
                    totalBookings++;
                    bookedDates.add(booking.date);
                }
            });
        });

        return res.json({
            totalBookings,
            bookedDates: Array.from(bookedDates) // Convert Set to Array
        });

    } catch (error) {
        return res.status(500).json({ message: "Error fetching booking history", error });
    }
});

// Get Booking Details for a Specific Date - POST request
router.post("/user/details", async (req, res) => {
    const { userId, type, date } = req.body; 

    if (type !== "parking") {
        return res.status(400).json({ message: "Seat booking history not yet implemented." });
    }

    try {
        const slots = await ParkingSlot.find({ "bookings.userId": userId });

        let bookingDetails = [];

        slots.forEach(slot => {
            slot.bookings.forEach(booking => {
                if (booking.userId === userId && booking.date === date) {
                    bookingDetails.push({
                        slotNumber: slot.slotNumber,
                        floor: slot.floor,
                        date: booking.date,
                        entryTime: booking.entryTime,
                        exitTime: booking.exitTime
                    });
                }
            });
        });

        if (bookingDetails.length === 0) {
            return res.status(404).json({ message: "No bookings found for the selected date." });
        }

        return res.json(bookingDetails);

    } catch (error) {
        return res.status(500).json({ message: "Error fetching booking details", error });
    }
});

export default router;
