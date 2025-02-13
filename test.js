
// server.js
require("dotenv").config();
const { Resend } = require("resend");
const express = require("express");
const cors = require("cors");
const app = express();

// Middleware
app.use(cors({ origin: "https://preprince.co.za" })); // Restrict to your domain
app.use(express.json());

// Resend Client
const resend = new Resend(process.env.RESEND_API_KEY); // Store key in environment variables

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

// Email Endpoint
app.post("/send-email", async (req, res) => {
    try {
        const { to, subject, html } = req.body;

        const { data, error } = await resend.emails.send({
            from: "Preprince <admin@preprince.co.za>",
            to: [to],
            subject: subject,
            html: html,
        });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

