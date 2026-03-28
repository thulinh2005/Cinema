const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const verifyToken = require("../middlewares/verifyToken");

router.get("/room-types", verifyToken, roomController.getRoomTypes);
router.get("/", verifyToken, roomController.getAllRooms);
router.post("/", verifyToken, roomController.createRoom);
router.put("/:id", verifyToken, roomController.updateRoom);
router.delete("/:id", verifyToken, roomController.deleteRoom);
router.get("/:id/seats", verifyToken, roomController.getSeatsByRoom);
router.put("/:id/seats", verifyToken, roomController.updateSeats);
module.exports = router;