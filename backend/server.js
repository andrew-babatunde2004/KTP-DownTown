require("dotenv").config();

const { randomUUID } = require("crypto");
const cors = require("cors");
const express = require("express");
const { sendMessage , sendRSVPMessage } = require("./bot");

const app = express();
const port = process.env.PORT || 3000;
const host =
  process.env.HOST || (process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1");
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN,
  process.env.FRONTEND_PREVIEW_ORIGIN,
].filter(Boolean);

let latestAlert = null;
const alertResponses = new Map();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS"));
    },
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/alert", async (req, res) => {
  const { name, destination, date, time } = req.body;

  if (!name || !destination || !date || !time) {
    return res.status(400).json({
      message: "name, destination, date, and time are required",
    });
  }

  const alert = {
    id: randomUUID(),
    name: String(name).trim(),
    destination: String(destination).trim(),
    date: String(date).trim(),
    time: String(time).trim(),
    createdAt: new Date().toISOString(),
  };

  latestAlert = alert;
  alertResponses.set(alert.id, []);

  const message = `@everyone ${alert.name} is planning an event at ${alert.destination} on ${alert.date} at ${alert.time}. RESPOND HERE: http://localhost:5173/#/respond`;

  try {
    await sendMessage(message);
    return res.status(201).json({
      message: "Alert sent successfully.",
      alert,
    });
  } catch (error) {
    console.error("Failed to send alert to Discord:", error);
    return res.status(500).json({
      message: "Error sending alert to Discord.",
      error: error.message,
    });
  }
});

app.get("/api/alerts/latest", (req, res) => {
  if (!latestAlert) {
    return res.status(404).json({
      message: "No recent alert found.",
    });
  }

  return res.json({
    alert: {
      ...latestAlert,
      responses: alertResponses.get(latestAlert.id) || [],
    },
  });
});

app.post("/api/alerts/respond", async (req, res) => {
  const { alertId, name, response } = req.body;

  if (!alertId || !name || !response) {
    return res.status(400).json({
      message: "alertId, name, and response are required",
    });
  }

  if (!latestAlert || latestAlert.id !== alertId) {
    return res.status(404).json({
      message: "That alert no longer exists.",
    });
  }

  const normalizedResponse = String(response).trim().toLowerCase();

  if (!["yes", "no"].includes(normalizedResponse)) {
    return res.status(400).json({
      message: "response must be either yes or no",
    });
  }

  const responseEntry = {
    id: randomUUID(),
    alertId,
    name: String(name).trim(),
    response: normalizedResponse,
    createdAt: new Date().toISOString(),
  };

  const responses = alertResponses.get(alertId) || [];
  responses.push(responseEntry);
  alertResponses.set(alertId, responses);

 
 const discordMessage = `${responseEntry.name} responded ${responseEntry.response.toUpperCase()} for ${latestAlert.name}'s event at ${latestAlert.destination} on ${latestAlert.date} at ${latestAlert.time}.`;
  try {
    await sendRSVPMessage(discordMessage);
    return res.json({
      message: `Response recorded: ${normalizedResponse}`,
      response: responseEntry,
    });
  } catch (error) {
    console.error("Failed to send response to Discord:", error);
    return res.status(500).json({
      message: "Error sending response to Discord.",
      error: error.message,
    });
  }
});

let server = null;

function startServer() {
  if (server) {
    return server;
  }

  server = app.listen({ port, host });

  server.once("listening", () => {
    const address = server.address();

    if (!address || typeof address === "string") {
      console.log(`Server running on port ${port}`);
      return;
    }

    console.log(`Server running on http://${address.address}:${address.port}`);
  });

  server.once("error", (error) => {
    console.error("Server failed to start:", error);
    server = null;
    process.exitCode = 1;
  });

  server.on("close", () => {
    console.log("Server closed.");
    server = null;
  });

  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
