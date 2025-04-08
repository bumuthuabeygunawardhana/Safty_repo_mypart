import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    date: { type: String, required: true },
    entryTime: { type: String, required: true },
    exitTime: { type: String, required: true }
});

const ParkingSlotSchema = new mongoose.Schema({
    slotNumber: { type: Number, required: true, unique: true },
    floor: { type: Number, required: true },
    bookings: [BookingSchema] // Array of bookings per slot
});

const ParkingSlot = mongoose.model("ParkingSlot", ParkingSlotSchema);

export default ParkingSlot;
