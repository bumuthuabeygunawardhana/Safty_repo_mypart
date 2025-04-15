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

//  ADD THIS NEW ENDPOINT FOR DELETE BOOKING
router.delete("/user/delete", async (req, res) => {
    const { userId, slotNumber, date, entryTime, exitTime } = req.body;

    try {
        // Find the correct parking slot
        const slot = await ParkingSlot.findOne({ slotNumber });

        if (!slot) {
            return res.status(404).json({ message: "Slot not found." });
        }

        // Filter out the booking to delete
        const updatedBookings = slot.bookings.filter(
            booking => !(
                booking.userId === userId &&
                booking.date === date &&
                booking.entryTime === entryTime &&
                booking.exitTime === exitTime
            )
        );

        // If no booking was removed, it means nothing matched
        if (updatedBookings.length === slot.bookings.length) {
            return res.status(404).json({ message: "Booking not found for deletion." });
        }

        // Update the bookings array
        slot.bookings = updatedBookings;
        await slot.save();

        return res.json({ message: "Booking deleted successfully." });

    } catch (error) {
        return res.status(500).json({ message: "Error deleting booking", error });
    }
});
//  DELETE ENDPOINT ENDS HERE

export default router;
