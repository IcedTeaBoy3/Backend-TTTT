const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");
const { Authenticate, Authorize } = require("../middlewares/AuthMiddleware");
const upload = require('../middlewares/UploadMiddleware');

router.get("/get-all-users",Authenticate,Authorize(["admin"]), UserController.getAllUsers);
router.get("/get-user/:id",Authenticate, UserController.getUser);
router.put("/update-user/:id",Authenticate, UserController.updateUser);
router.delete("/delete-user/:id",Authenticate, Authorize(["admin"]), UserController.deleteUser);
router.post("/delete-all-users",Authenticate, Authorize(["admin"]), UserController.deleteManyUsers);
router.post("/insert-many-users",Authenticate, Authorize(["admin"]), UserController.insertManyUsers);
router.post("/upload-avatar/:id", Authenticate,upload.single("avatar"), UserController.uploadAvatar);
module.exports = router;