import mongoose from "mongoose";
import { app } from "./app.js";
import { config } from "./config.js";
import { seedDefaults } from "./utils/seed.js";

async function start() {
  await mongoose.connect(config.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  await seedDefaults();
  app.listen(config.PORT, "0.0.0.0", () => {
    console.log(`WashWise API listening on 0.0.0.0:${config.PORT}`);
  });
}

start().catch((error) => {
  console.error("Unable to start WashWise API", error);
  process.exit(1);
});
