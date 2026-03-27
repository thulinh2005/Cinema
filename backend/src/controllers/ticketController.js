const Ticket = require("../models/ticketModel");

exports.getTickets = (req, res) => {

Ticket.getAll(req.query.search, (err, data) => {
if (err) return res.status(500).json(err);
res.json(data);
});

};

exports.cancelTicket = (req, res) => {

Ticket.cancel(req.params.id, (err) => {
if (err) return res.status(500).json(err);
res.json({ message: "Đã hủy vé" });
});

};