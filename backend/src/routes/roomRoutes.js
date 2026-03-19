const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const verifyToken = require("../middlewares/verifyToken");

router.get("/room-types", verifyToken, roomController.getRoomTypes);
router.get("/rooms", verifyToken, roomController.getAllRooms);
router.post("/rooms", verifyToken, roomController.createRoom);
router.put("/rooms/:id", verifyToken, roomController.updateRoom);
router.delete("/rooms/:id", verifyToken, roomController.deleteRoom);
router.get("/rooms/:id/seats", verifyToken, roomController.getSeatsByRoom);

module.exports = router;