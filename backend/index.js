import express from "express";
import cors from "cors";
import checkRoute from "./routes/check.js";
import fixRouter from "./routes/fix.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/fix", fixRouter);

app.use("/check", checkRoute);

app.listen(3000, () => {
  console.log("Backend running on http://localhost:3000");
});
