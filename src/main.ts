import express from "express";
const app = express();
import crypto from "crypto";
import pgp from "pg-promise";

app.use(express.json());

app.post("/tickets", async function (req, res) {
  const ticketId = crypto.randomUUID();
	const connection = pgp()("postgres://postgres:123456@localhost:5432/example");
	await connection.query("insert into example.ticket (ticket_id, requester_id, content, start_date, status) values ($1, $2, $3, $4, $5)", [ticketId, req.body.requesterId, req.body.content, new Date(), "open"]);
	await connection.$pool.end();
	res.json({
		ticketId
	});
});

app.get("/tickets/:ticketId", async function (req, res) {
	const connection = pgp()("postgres://postgres:123456@localhost:5432/example");
	const [ticketData] = await connection.query("select * from example.ticket where ticket_id = $1", [req.params.ticketId]);
	const ticket = {
		ticketId: ticketData.ticket_id,
		requesterId: ticketData.requester_id,
		assigneeId: ticketData.assignee_id,
		startDate: ticketData.start_date,
		endDate: ticketData.end_date,
		content: ticketData.content,
		status: ticketData.status,
		duration: ticketData.duration
	}
	await connection.$pool.end();
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