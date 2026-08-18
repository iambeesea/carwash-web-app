import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config.js";
import { errorHandler, notFound } from "./middleware/error.js";
import { adminRouter } from "./routes/admin.js";
import { customerRouter } from "./routes/customer.js";
import { publicRouter } from "./routes/public.js";

export const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || config.FRONTEND_URL.split(",").map((value) => value.trim()).includes(origin)) {
        return callback(null, true);
      }
      callback(new Error("Origin is not allowed by CORS."));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "100kb" }));
app.use(morgan(config.NODE_ENV === "production" ? "combined" : "dev"));

app.use("/api", publicRouter);
app.use("/api", customerRouter);
app.use("/api/admin", adminRouter);

app.use(notFound);
app.use(errorHandler);
