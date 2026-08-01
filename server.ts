import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI Insights endpoint
  app.post("/api/ai-insights", async (req, res) => {
    try {
      const { expenses, profile, totalSpent, remaining, currency = '৳' } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // Fallback local response if no API key is provided
        return res.json({
          overview: `You have spent ${currency}${totalSpent?.toFixed(2) || '0.00'} out of your ${currency}${profile?.totalLimit || 25000} ${profile?.period || 'monthly'} budget. Remaining balance is ${currency}${remaining?.toFixed(2) || '0.00'}.`,
          score: Math.min(100, Math.max(0, Math.round(((remaining || 10000) / (profile?.totalLimit || 25000)) * 100))),
          savingsTips: [
            "Track recurring subscription bills and eliminate unused ones.",
            "Set category caps for Food and Shopping to prevent impulse purchases.",
            "Transfer remaining balance at the end of every week directly to a savings account."
          ],
          warnings: remaining < 0 ? ["Budget limit exceeded! Reduce non-essential spending."] : [],
          suggestedAction: "Maintain your daily spend under " + currency + Math.max(100, Math.round((remaining || 5000) / 15)) + " per day for the rest of the period."
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `Analyze this personal finance data:
Budget Profile: ${profile?.name || 'Personal'} (${profile?.period || 'monthly'})
Currency: ${currency}
Total Budget Limit: ${currency}${profile?.totalLimit}
Total Spent So Far: ${currency}${totalSpent}
Remaining Balance: ${currency}${remaining}
Recent Expenses List (last 10 items):
${JSON.stringify((expenses || []).slice(0, 10), null, 2)}

Provide structured actionable spending advice, score from 0 to 100, 3 specific savings tips, any budget warnings, and a concise clear summary formatted using the currency symbol ${currency}.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an expert personal financial advisor and budget analyst. Return helpful, concise, positive, and realistic spending analysis in JSON format.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overview: { type: Type.STRING },
              score: { type: Type.INTEGER },
              savingsTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              warnings: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              suggestedAction: { type: Type.STRING }
            },
            required: ["overview", "score", "savingsTips", "warnings", "suggestedAction"]
          }
        }
      });

      const responseText = response.text || "{}";
      const parsedData = JSON.parse(responseText);
      return res.json(parsedData);
    } catch (err: any) {
      console.error("Error generating AI insights:", err);
      return res.status(500).json({ error: err?.message || "Failed to generate AI insights" });
    }
  });

  // AI Text Expense Parser endpoint
  app.post("/api/parse-expense", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Text prompt is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      const todayStr = new Date().toISOString().split('T')[0];

      if (!apiKey) {
        // Simple regex fallback
        const amountMatch = text.match(/(?:৳|Tk|TK|\$)?\s*(\d+(?:\.\d+)?)/i);
        const amount = amountMatch ? parseFloat(amountMatch[1]) : 150.0;
        return res.json({
          amount,
          category: "Food",
          note: text,
          date: todayStr,
          time: "12:00",
          paymentMethod: "Card"
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Parse this transaction entry: "${text}". Today's date is ${todayStr}. Extract the exact numeric amount, category (Must be one of: Food, Transport, Shopping, Bills, Entertainment, Health, Education, Others), short note, date (YYYY-MM-DD format), time (HH:mm format 24hr), and paymentMethod (Must be one of: Cash, Card, Digital Wallet, Bank Transfer).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              amount: { type: Type.NUMBER },
              category: { type: Type.STRING },
              note: { type: Type.STRING },
              date: { type: Type.STRING },
              time: { type: Type.STRING },
              paymentMethod: { type: Type.STRING }
            },
            required: ["amount", "category", "note", "date", "time", "paymentMethod"]
          }
        }
      });

      const responseText = response.text || "{}";
      const parsedData = JSON.parse(responseText);
      return res.json(parsedData);
    } catch (err: any) {
      console.error("Error parsing expense:", err);
      return res.status(500).json({ error: err?.message || "Failed to parse expense text" });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
