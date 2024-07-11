import Booking from "../models/booking.model.js";
import ExpressError from "../utils/ExpressError.utils.js";
import Halt from "../models/halt.model.js";
import WagonClass from "../models/wagonClass.model.js";

import { getBookedSeatsofSchedule } from "./helpers/booking.helper.js";


// create a pending booking until the user makes the payment
export const createPendingBooking = async (req, res, next) => {
  const {
    userId = undefined,
    scheduleId,
    date,
    fromHaltId,
    toHaltId,
    selectedSeatIds,
    selectedClassId,
  } = req.body;

  // get fromHalt and toHalt
  const fromHalt = await Halt.findById(fromHaltId).select("price");
  const toHalt = await Halt.findById(toHaltId).select("price");

  // get the fare multiplier for the selected class
  const selectedClass = await WagonClass.findById(selectedClassId).select("fareMultiplier");
  const fareMultiplier = selectedClass.fareMultiplier;

  // I want to check if the selected seats are available
  const bookedSeats = await getBookedSeatsofSchedule(scheduleId, date, fromHalt, toHalt);
  console.log("bookedSeats", bookedSeats);
  const bookedSeatStrings = bookedSeats.map(seatId => seatId.toString());
  console.log("bookedSeatStrings", bookedSeatStrings);
  const allAvailable = selectedSeatIds.every((seatId) => !bookedSeatStrings.includes(seatId.toString()));

  if (!allAvailable) {
    throw new ExpressError("One or more selected seats are not available", 400);
  }

  const totalFare = fareMultiplier * (toHalt.price - fromHalt.price) * selectedSeatIds.length;
  const pendingTime = new Date(Date.now() + 5 * 60 * 1000); // select pending time as 5 minutes from now
  const booking = new Booking({
    userRef: userId,
    scheduleRef: scheduleId,
    date,
    startHalt: fromHalt._id,
    endHalt: toHalt._id,
    totalFare,
    status: "pending",
    seats: selectedSeatIds,
    pendingTime, // store the expiry time of the hold
  });
  await booking.save();
  return res
    .status(200)
    .json({ bookingId: booking._id, expireTime: pendingTime });
};

export const confirmBooking = async (req, res, next) => {
  const { bookingId, email } = req.body;
  const booking = await Booking.findById(bookingId).populate({
    path: "startHalt",
    select: "stationRef platform",
    populate: {
      path: "stationRef",
      select: "name",
    }
  })

  booking.status = "approved";
  booking.pendingTime = undefined;
  await booking.save();

  // // Find the user by ID
  // const user = await User.findById(userId);
  // if (!user) {
  //   return res.status(404).json({ message: "User not found" });
  // }

  //   // Generate PDFs for each seat
  //   const pdfBuffers = await generateETickets(booking);

  //   // Send email to the user with e-tickets
  //   await sendConfirmationEmail(user.email, pdfBuffers);

  return res.status(200).json({ message: "Booking confirmed" });
};

export const cancelBooking = async (req, res, next) => {
  const { bookingId } = req.body;
  const booking = await Booking.findById(bookingId);
  if (booking.date - Date.now() <= 0) {
    throw new ExpressError("Cannot cancel past bookings", 400);
  }
  booking.status = "cancelled";
  booking.pendingTime = undefined;
  await booking.save();
  return res.status(200).json({ message: "Booking cancelled" });
};

export async function releaseExpiredPendingBookings() {
  const now = new Date();
  const bookings = await Booking.find({
    status: "pending",
    pendingTime: { $lt: now },
  });
  for (let booking of bookings) {
    booking.status = "cancelled";
    await booking.save();
  }
}