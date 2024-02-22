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
	const connection = pgp()("postgres://postgres:123456@localhost:5432/example");
	const [ticketData] = await connection.query("select * from example.ticket where ticket_id = $1", [req.params.ticketId]);
	if (ticketData.status === "closed") throw new Error("The ticket is closed");
	await connection.query("update example.ticket set status = $1, assignee_id = $2 where ticket_id = $3", [req.body.status, req.body.assigneeId, req.params.ticketId]);
	await connection.$pool.end();
	res.end();
});

app.listen(3000);