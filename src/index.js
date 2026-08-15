import connectDB from "./db/index.js";
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config({ path: "./.env" });

const PORT = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.on("error", (err) => {
      console.log("Server connection ERROR:", err);
      throw err;
    });
    app.listen(PORT, () => {
      console.log("Server is started on PORT", PORT);
    });
  })
  .catch((err) => {
    console.log("MONGODB connection failes!!!", err);
  });
