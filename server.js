// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();
const app = express();

app.use(express.json());

// Resend Client
const resend = new Resend(process.env.RESEND_API_KEY);

// CORS Configuration
const allowedOrigins = [
    "http://localhost:5500", // Local development (frontend)
    "http://127.0.0.1:5500", // Local development (frontend)
    "https://preprince.co.za", // Production (frontend)
    "http://preprince.co.za", // Production (frontend - without HTTPS)
    "http://localhost:3000", // Local development (backend)
    "https://preprince-backend.onrender.com", // Production (backend)
];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests from allowed origins or when origin is undefined (e.g., same-origin requests)
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));

// Add these new routes
app.get("/", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Preprince API is running",
        timestamp: new Date().toISOString(),
    });
});

// Email Endpoint
app.post("/send-email", async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const { data, error } = await resend.emails.send({
            from: `Preprince Contact <contact@preprince.co.za>`,
            to: ["admin@preprince.co.za"],
            subject: `New message from ${name}`,
            html: `<p>New Contact Form Submission</p>
        <p>Name: ${name}</p>
        <p>Email: ${email}</p>
        <p>Message:</p>
        <p>${message}</p>
      `,
        });

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
