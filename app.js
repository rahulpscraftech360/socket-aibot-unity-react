const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const os = require("os");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle light random lamp

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });

  socket.on("button-clicked", (buttonIndex) => {
    console.log(`Button clicked: ${buttonIndex}`);
    io.emit("button-clicked", buttonIndex); // Emit to all clients
  });

  socket.on("videoFinished", (data) => {
    if (
      data &&
      data.message &&
      data.videoIndex !== undefined &&
      data.success !== undefined
    ) {
      console.log(
        `Response from Unity: ${data.message}, Video Index: ${data.videoIndex}, Success: ${data.success}`
      );
      if (data.success) {
        console.log("The video finished successfully.");
      }
    } else {
      console.log("Received undefined or malformed data from Unity.");
    }
    io.emit("stop-message", "STOP");
  });
});

const port = 3000;

console.log("Starting HTTP server...");
server.listen(port, "0.0.0.0", () => {
  const ipAddress = getServerIPAddress();
  console.log(`Server is running on http://${ipAddress}:${port}`);
});

// Function to get the server IP address
function getServerIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const interfaceName in interfaces) {
    const addresses = interfaces[interfaceName];
    for (const addressInfo of addresses) {
      if (addressInfo.family === "IPv4" && !addressInfo.internal) {
        return addressInfo.address;
      }
    }
  }
  return "0.0.0.0";
}
