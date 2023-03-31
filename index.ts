import express, { Express } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import multer, { memoryStorage } from "multer";
import dotenv from "dotenv";
import { resourceRoute } from "./routeHandlers";
import { connect } from "mongoose";

const upload = multer({ storage: memoryStorage() });

dotenv.config();

const app: Express = express();

const port: number = parseInt(process.env.PORT as string) || 5000;

app.use(cors());

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(upload.single("file"));

app.use("/:id", resourceRoute);

app.use("/", resourceRoute);

(async () => {
  await connect(process.env.MURL as string);
  app.listen(port, () => {
    console.log(`kasroudra is running at port ${port}`);
  });
})();
