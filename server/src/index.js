import cors from "cors";
import helmet from "helmet";
import express from "express";
import db from "./db/mongo.js";
import config from "./config.js";
import https from "https";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { Pair, fetchPairUpdates } from "./services/pairs/index.js";
import { Swap, fetchSwapUpdates } from "./services/swaps/index.js";

const app = express();
app.use(cors()); // handle cross origin request
// app.use(helmet())
app.use(express.json());

app.use(express.static("public")); // static files

app.get("/config", async (req, res) => {
  res.json(config);
});

app.get("/pairs", async (req, res) => {
  res.json(await Pair.find());
});

app.get("/swaps", async (req, res) => {
  res.json(await Swap.find());
});

app.get("/ping/:id", (req, res) => {
  res.send(`Sudoswap App! @ ${req.params.id}`);
});

const main = async () => {
  await db.connect(process.env.MONGODB_URI);

  const sslServer = https.createServer(
    {
      key: fs.readFileSync(path.join(__dirname, "certs", "key.pem")),
      cert: fs.readFileSync(path.join(__dirname, "certs", "cert.pem")),
    },
    app
  );

  const host = "0.0.0.0";
  const port = process.env.PORT || "8000";
  sslServer.listen(port, host, () => {
    console.log(`Secure Server running at http://${host}:${port}/`);
  });

  fetchPairUpdates();
  fetchSwapUpdates();
};

main();
