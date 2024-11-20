import express from "express";
import bodyParser from "body-parser";
import actionRoutes from "./routes/actions";
import { connectDB } from "./db";

const app = express();
app.use(bodyParser.json());
app.use("/actions", actionRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {
  await connectDB();
  console.log(`History Service running on port ${PORT}`);
});
