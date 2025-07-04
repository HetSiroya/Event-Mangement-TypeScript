import dotenv from "dotenv";
require("dotenv").config();
import express from "express";
import connetDB from "./config/db.config";
import { log } from "console";
import indexRoutes from "./routes/indexRoutes";
const app = express();

// Handling GET / Request
app.get("/", (req, res) => {
  res.send("Welcome to typescript backend!");
  log("GET / Request received");
});

// Server setup
app.use(express.json());
connetDB();
// indexRoutes
app.use(indexRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    "The application is listening " + "on port http://localhost:" + PORT
  );
});
