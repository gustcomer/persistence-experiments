import express from "express";
const app = express();
import crypto from "crypto";
import pgp from "pg-promise";
import TicketService from "./TicketService";

app.use(express.json());

const ticketService = new TicketService();

app.post("/tickets", async function (req, res) {
	const ticketId = await ticketService.createTicket(req.body.requesterId, req.body.content)
	res.json({
		ticketId
	});
});

app.get("/tickets/:ticketId", async function (req, res) {
	const ticket = await ticketService.getTicket(req.params.ticketId)
	res.json(ticket);
});

app.post("/tickets/:ticketId/assign", async function(req, res) {
	await ticketService.assignTicket(req.params.ticketId, req.body.assigneeId)
	res.end();
});

app.post("/tickets/:ticketId/close", async function(req, res) {
	await ticketService.closeTicket(req.params.ticketId)
	res.end();
});

app.listen(3000);