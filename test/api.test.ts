import axios from "axios";

test("Must create a new ticket", async function() {
  // given, arrange
  const input1 = {
    requesterId: "b7e6db47-3e5d-4220-9265-0e6eef8c4330",
    content: "The internet is not working"
  }
  // when, act
  const response1 = await axios.post("http://localhost:3000/tickets", input1);
  const output1 = response1.data;
  // then, assert
	const response2 = await axios.get(`http://localhost:3000/tickets/${output1.ticketId}`);
	const output2 = response2.data;
	expect(output2.ticketId).toBeDefined();
	expect(output2.requesterId).toBe(input1.requesterId);
	expect(output2.content).toBe(input1.content);
	expect(output2.status).toBe("open");
})