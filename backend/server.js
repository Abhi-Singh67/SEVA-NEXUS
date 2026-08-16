const express = require("express");
const cors = require("cors");
require("dotenv").config();

const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(express.json());

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.get("/", (req, res) => {
    res.json({
        message: "SEVA-NEXUS Backend is running!"
    });
});

app.post("/api/analyze-emergency", async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                error: "Emergency description is required."
            });
        }

        const response = await client.responses.create({
            model: "gpt-4o-mini",
            input: [
                {
                    role: "system",
                    content: `You are SEVA-NEXUS Emergency Analysis AI.

Your job is to convert a natural-language disaster/emergency report into structured operational requirements.

Return ONLY valid JSON with these fields:
{
  "disaster_type": "",
  "location": "",
  "priority": "",
  "affected_people": 0,
  "required_skills": [],
  "required_volunteers": 0,
  "required_vehicles": 0,
  "required_supplies": []
}

Priority must be one of:
low, medium, high, critical.

Do not invent information that is not reasonably available from the request.
If a value is unknown, use an empty string, empty array, or 0.`
                },
                {
                    role: "user",
                    content: message
                }
            ]
        });

        const result = response.output_text;

        res.json({
            success: true,
            analysis: result
        });

    } catch (error) {
        console.error("OpenAI Error:", error);

        res.status(500).json({
            success: false,
            error: "Failed to analyze emergency."
        });
    }
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`SEVA-NEXUS Backend running on http://localhost:${PORT}`);
});