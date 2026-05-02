const http = require("http");
const dotenv = require("dotenv");

dotenv.config();

const { createApp } = require("./app");
const { connectDb } = require("./lib/db");
const { attachSocket } = require("./realtime/socket");
const { startPriceEngine } = require("./services/priceEngine");

async function main() {
  await connectDb(process.env.MONGODB_URI);

  const app = createApp();
  const server = http.createServer(app);

  const io = attachSocket(server);
  app.set("io", io);
  startPriceEngine({ io });

  const port = Number(process.env.PORT || 5000);
  server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on :${port}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Fatal startup error", err);
  process.exitCode = 1;
});

