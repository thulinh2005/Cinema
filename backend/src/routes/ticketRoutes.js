const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticketController");

router.get("/", ticketController.getTickets);
router.put("/:id", ticketController.updateTicket);
router.delete("/:id", ticketController.deleteTicket);

module.exports = router;
