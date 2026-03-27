const express = require("express");
const router = express.Router();

const controller = require("../controllers/ticketController");

router.get("/", controller.getTickets);
router.put("/:id/cancel", controller.cancelTicket);

module.exports = router;