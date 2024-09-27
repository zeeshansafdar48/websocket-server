const WebSocket = require("ws");
const server = new WebSocket.Server({ port: process.env.PORT || 8080 });

server.on("connection", (ws) => {
  console.log("Client connected");

  // Simulate sending a notification to the client every 5 seconds
  const sendNotification = setInterval(() => {
    const notification = {
      title: "New Notification",
      message: "You have a new message!",
      time: new Date().toLocaleTimeString()
    };
    ws.send(JSON.stringify(notification));
  }, 60000);

  ws.on("message", (message) => {
    console.log(`Received: ${message}`);
    ws.send(`Hello, you sent -> ${message}`);
  });

  ws.on("close", () => {
    clearInterval(sendNotification);
    console.log("Client disconnected");
  });
});

console.log("WebSocket server is running...");
