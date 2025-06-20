const express = require("express");
const router = express.Router();
const WorkingScheduleController = require("../controllers/WorkingScheduleController");
const { Authenticate, Authorize } = require("../middlewares/AuthMiddleware");

router.get("/get-all-working-schedules", WorkingScheduleController.getAllWorkingSchedules);
router.post("/create-working-schedule", Authenticate, Authorize(["admin","doctor"]), WorkingScheduleController.createWorkingSchedule);
router.put("/update-working-schedule/:id", Authenticate, Authorize(["admin","doctor"]), WorkingScheduleController.updateWorkingSchedule);
router.delete("/delete-working-schedule/:id", Authenticate, Authorize(["admin","doctor"]), WorkingScheduleController.deleteWorkingSchedule);
router.post("/delete-many-working-schedules", Authenticate, Authorize(["admin","doctor"]), WorkingScheduleController.deleteManyWorkingSchedules);
router.get("/get-working-schedule-by-doctor/:doctorId", WorkingScheduleController.getWorkingScheduleByDoctor);
module.exports = router;