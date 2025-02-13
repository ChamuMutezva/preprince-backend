// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();
const app = express();

// Middleware
app.use(
    cors({
        origin:
            process.env.NODE_ENV === "production"
                ? "https://preprince.co.za"
                : "http://localhost:5500",
        methods: ["POST", "OPTIONS"],
        allowedHeaders: ["Content-Type"],
    })
);
app.use(express.json());

// Resend Client
const resend = new Resend(process.env.RESEND_API_KEY);

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests from these origins
        const allowedOrigins = [
            "http://localhost:5500",
            "http://127.0.0.1:5500",
            "https://preprince.co.za",
        ];

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
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data, error } = await resend.emails.send({
            from: `Preprince Contact <contact@preprince.co.za>`,
            to: ["admin@preprince.co.za"],
            subject: `New message from ${name}`,
            html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
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
