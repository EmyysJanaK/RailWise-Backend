import express from "express";
import { catchAsync } from "../utils/catchAsync.utils.js";
import {
  getBookingsCount,
  getTotalFare,
  getUserRegistrations,
  getBookingClassDistribution,
  getBookingsDetails,
  getSchedules,
  getSchedulesDetails,
  login,
} from "../controllers/admin.controller.js";

const router = express.Router();


router.get("/schedules", catchAsync(getSchedules));
router.post("/login", catchAsync(login));

// Graphs
router.get(
  "/bookingsCount/:status/:scheduleId/:timeFrame",
  catchAsync(getBookingsCount)
);
router.get("/totalFare/:scheduleId/:timeFrame", catchAsync(getTotalFare));
router.get("/userRegistrations/:timeFrame", catchAsync(getUserRegistrations));
router.get(
  "/bookingClassDistribution/:scheduleId/:timeFrame",
  catchAsync(getBookingClassDistribution)
);

// Tables
router.get("/bookingsDetails/:status/:scheduleId", catchAsync(getBookingsDetails));
router.get("/schedulesDetails", catchAsync(getSchedulesDetails));


export default router;
