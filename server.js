const amqp = require("amqplib");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

// This will store connected clients for SSE
let clients = [];

app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders(); // flush the headers to establish SSE

  clients.push(res);

  req.on("close", () => {
    clients = clients.filter((client) => client !== res);
  });
});

// Simulate sending messages every 10 seconds for testing
setInterval(() => {
  const testMessage = `Test Notification at ${new Date().toLocaleTimeString()}`;

  // Send the test message to all connected clients
  clients.forEach((client) => {
    client.write(`data: ${testMessage}\n\n`);
  });

  console.log("Sent:", testMessage); // Log to see in the console
}, 10000); // Send message every 10 seconds

async function consumeRabbitMQ() {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();
    const queue = "starzplay_queue";

    await channel.assertQueue(queue, { durable: false });
    console.log("Waiting for messages in %s", queue);

    channel.consume(queue, (msg) => {
      if (msg !== null) {
        const messageContent = msg.content.toString();
        console.log("Received:", messageContent);

        // Send the message to all connected clients
        clients.forEach((client) => {
          client.write(`data: ${messageContent}\n\n`);
        });

        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error("Error in RabbitMQ consumer:", error);
  }
}

consumeRabbitMQ();

app.listen(8080, () => {
  console.log("SSE server listening on port 8080");
});
