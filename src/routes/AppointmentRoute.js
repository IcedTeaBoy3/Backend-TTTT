const express = require("express");
const router = express.Router();
const AppointmentController = require("../controllers/AppointmentController");
const { Authenticate, Authorize } = require("../middlewares/AuthMiddleware");

router.post("/create-appointment",Authenticate, Authorize(["patient","doctor","admin"]), AppointmentController.createAppointment);
router.get("/get-all-appointments", Authenticate, Authorize(["admin"]), AppointmentController.getAllAppointments);
module.exports = router;