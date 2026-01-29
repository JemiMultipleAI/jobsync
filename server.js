const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  // Initialize Socket.io
  // Using require with tsx allows importing TypeScript files directly
  try {
    console.log("[Server] Loading WebSocket server module...");
    const { initializeSocketIO } = require("./src/lib/websocket/server");
    console.log("[Server] WebSocket module loaded, initializing...");
    initializeSocketIO(httpServer);
    console.log("[Server] Socket.io initialized successfully");
  } catch (error) {
    console.error("[Server] Failed to initialize Socket.io:", error);
    console.error("[Server] Error details:", error.message);
    console.error("[Server] Stack trace:", error.stack);
    // Continue without WebSocket if it fails
  }

  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
