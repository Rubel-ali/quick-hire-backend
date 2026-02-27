import express, { Application, NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import cors from "cors";
import cookieParser from "cookie-parser";
import GlobalErrorHandler from "./app/middlewares/globalErrorHandler";
import router from "./app/routes";

const app: Application = express();

/*
====================================================
CORS CONFIG (Production Ready)
====================================================
*/
export const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://learning-management-system-client-five.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

/*
====================================================
MIDDLEWARES
====================================================
*/

// ⭐ MUST be first middleware
app.use(cors(corsOptions));

// ⭐ Handle Preflight Request (Very Important for Vercel)
app.options("*", cors(corsOptions));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

/*
====================================================
ROUTES
====================================================
*/

app.get("/", (req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    success: true,
    message: "The server is running!"
  });
});

app.use("/api/v1", router);

/*
====================================================
ERROR HANDLING
====================================================
*/

app.use(GlobalErrorHandler);

// Not Found Route
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API NOT FOUND!",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not found!"
    }
  });
});

export default app;