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

}