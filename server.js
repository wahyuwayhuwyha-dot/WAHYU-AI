const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 3000;

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error("OPENAI_API_KEY belum diatur!");
  process.exit(1);
}

const client = new OpenAI({ apiKey });

const allowedOrigins = (process.env.FRONTEND_ORIGIN || "")
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // Permintaan tanpa Origin, misalnya health check.
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origin tidak diizinkan"));
  }
}));

app.use(express.json({ limit: "10kb" }));

app.get("/", (req, res) => {
  res.send("WAHYU AI backend aktif!");
});

app.post("/chat", async (req, res) => {
  try {
    const message = req.body?.message;

    if (typeof message !== "string" ||
        !message.trim() ||
        message.length > 2000) {
      return res.status(400).json({
        error: "Pesan wajib diisi dan maksimal 2000 karakter."
      });
    }

    const result = await client.responses.create({
      model: "gpt-4.1-mini",
      instructions:
        "Kamu adalah WAHYU AI, asisten yang ramah. " +
        "Jawab dengan jelas dalam bahasa yang digunakan pengguna.",
      input: message.trim(),
      max_output_tokens: 600
    });

    res.json({
      reply: result.output_text || "Maaf, belum ada jawaban."
    });
  } catch (error) {
    console.error("AI request gagal:", error.message);

    res.status(500).json({
      error: "AI sedang mengalami masalah. Coba lagi nanti."
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`WAHYU AI berjalan di port ${PORT}`);
});
