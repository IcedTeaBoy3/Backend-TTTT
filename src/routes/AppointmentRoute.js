const express = require("express");
const router = express.Router();
const AppointmentController = require("../controllers/AppointmentController");
const { Authenticate, Authorize } = require("../middlewares/AuthMiddleware");

router.post("/create-appointment",Authenticate, AppointmentController.createAppointment);
router.delete("/delete-appointment/:id", Authenticate, Authorize(["admin"]), AppointmentController.deleteAppointment);
router.post("/delete-many-appointments", Authenticate, Authorize(["admin"]), AppointmentController.deleteManyAppointments);
router.put("/update-appointment/:id", Authenticate, Authorize(["admin"]), AppointmentController.updateAppointment);
router.get("/get-all-appointments", Authenticate, Authorize(["admin"]), AppointmentController.getAllAppointments);
router.get("/get-all-appointments-by-patient/:patientId", Authenticate, AppointmentController.getAllAppointmentsByPatient);
module.exports = router;