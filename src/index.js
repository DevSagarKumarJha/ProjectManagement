import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/index.js";

dotenv.config({
    path: "./.env",
});

const port = process.env.PORT || 8000;

connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`The server is running at http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.error("MoongoDB connection error: ", err);
    });
