import express, { Express } from "express";
import dotenv from "dotenv"
import userRoutes from "./routes/user.route";
import reviewRoutes from "./routes/review.route";
import tripRoutes from "./routes/trip.route";
import azureRoutes from "./routes/azure.route"
import carDocuments from "./routes/carDocument.route"
import googleAPI from "./routes/googleAPi.route";
import connectDB from "./lib/connectDb";
import cors from "cors";

dotenv.config()

const app: Express = express()
const port: number = Number(process.env.PORT) || 3000

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));


// Connect to MongoDB
connectDB()

app.use("/api/users", userRoutes)
app.use("/api/reviews", reviewRoutes)
app.use("/api/trips", tripRoutes)
app.use("/api/azure", azureRoutes)
app.use("/api/car-docs", carDocuments)
app.use("/api/google", googleAPI)

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
}) 