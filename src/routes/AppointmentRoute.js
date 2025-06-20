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
router.get("/get-all-appointments-by-doctor/:doctorId", Authenticate,Authorize(["admin","doctor"]), AppointmentController.getAllAppointmentsByDoctor);
router.put("/cancel-appointment/:id", Authenticate, AppointmentController.cancelAppointment);
router.put("/confirm-appointment/:id", Authenticate, Authorize(["admin"]), AppointmentController.confirmAppointment);
router.put("/complete-appointment/:id", Authenticate, Authorize(["doctor"]), AppointmentController.completeAppointment);
module.exports = router;