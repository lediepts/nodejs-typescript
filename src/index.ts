/**
 * Required External Modules
 */
import cors from "cors";
import * as dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import * as rfs from "rotating-file-stream";
import { cmdRouter } from "./cmd/cmd.router";
import { itemsRouter } from "./items/items.router";

dotenv.config();
/**
 * App Variables
 */
if (!process.env.PORT) {
  process.exit(1);
}

const PORT: number = parseInt(process.env.PORT as string, 10);
const accessLogStream = rfs.createStream("access.log", {
  interval: "1h", // rotate daily
  path: path.join(__dirname, "log"),
});
const app = express();
/**
 *  App Configuration
 */
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("combined", { stream: accessLogStream }));
app.use(morgan("dev"));
app.use("/api/menu/items", itemsRouter);
app.use("/cmd", cmdRouter);
/**
 * Server Activation
 */
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
