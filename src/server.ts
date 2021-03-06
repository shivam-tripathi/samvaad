import "reflect-metadata";
import express from "express";
import morgan from "morgan";
import { createConnection } from "typeorm";
import v1 from "./routes/v1";
import config from "./config";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
app.use(express.json());
app.use(morgan(config().env));
app.use(cookieParser());

app.use('/v1', v1);

app.listen(config().app.port, async () => {
  console.log(`Running on port ${config().app.port}`);
  try {
    await createConnection();
  } catch (err) {
    console.log(err);
  }
});
