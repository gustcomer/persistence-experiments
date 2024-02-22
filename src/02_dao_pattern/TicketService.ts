import crypto from "crypto";
import pgp from "pg-promise";

export default class TicketService {

  constructor () {

  }

  async createTicket (requesterId: string, content: string) {
    const ticketId = crypto.randomUUID();
    const connection = pgp()("postgres://postgres:123456@localhost:5432/example");
    await connection.query("insert into example.ticket (ticket_id, requester_id, content, start_date, status) values ($1, $2, $3, $4, $5)", [ticketId, requesterId, content, new Date(), "open"]);
    await connection.$pool.end();

    return ticketId;
  }

  async getTicket(ticketId: string) {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/example");
    const [ticketData] = await connection.query("select * from example.ticket where ticket_id = $1", [ticketId]);
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
    return ticket;
  }

  async assignTicket(ticketId: string, assigneeId: string) {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/example");
    const [ticketData] = await connection.query("select * from example.ticket where ticket_id = $1", [ticketId]);
    if (ticketData.status === "closed") throw new Error("The ticket is closed");
    await connection.query("update example.ticket set status = $1, assignee_id = $2 where ticket_id = $3", ["assigned", assigneeId, ticketId]);
    await connection.$pool.end();
  }

  async closeTicket(ticketId: string) {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/example");
    const [ticketData] = await connection.query("select * from example.ticket where ticket_id = $1", [ticketId]);
    if (ticketData.status === "open") throw new Error("The ticket is not assigned");
    const endDate = new Date();
    const startDate = ticketData.start_date;
    const duration = endDate.getTime() - startDate.getTime();
    await connection.query("update example.ticket set status = $1, end_date = $2, duration = $3 where ticket_id = $4", ["closed", endDate, duration, ticketId]);
    await connection.$pool.end();
  }
}