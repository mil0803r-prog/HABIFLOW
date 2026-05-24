import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // Initialize Gemini SDK with telemetry header
  // Note: key availability is handled externally and processed through process.env.GEMINI_API_KEY
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // API Route for Gemini Chat
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history, habits, goals, persona, customInstruction, maxLengthRule, model } = req.body;

      if (!message) {
        return res.status(400).json({ error: "El mensaje es requerido." });
      }

      // Format habits and goals context for the AI
      const habitsContext = (habits || []).map((h: any) => 
        `- Hábito: ${h.habit} (Frecuencia: ${h.frequency || 'N/A'}, Completados: ${h.completedDates?.length || 0} días)`
      ).join('\n');

      const goalsContext = (goals || []).map((g: any) => 
        `- Meta: ${g.objective} (Progreso: ${g.progress || 0}%, Nivel de prioridad: ${g.priority || 'N/A'}, Estado: ${g.status || 'N/A'})`
      ).join('\n');

      // Determine the core personality profile based on settings
      let personaInstruction = "Eres un coach experto personalizado sumamente sabio y motivador, especialista en todos los hábitos y metas del usuario.";
      if (persona === "critico") {
        personaInstruction = "Eres un coach sumamente crítico, irónico y humorístico. Analizas y cuestionas las excusas del usuario con ironía amistosa pero directa para sacudirle las ganas de postergar.";
      } else if (persona === "militar") {
        personaInstruction = "Eres un instructor sargento militar estricto, enérgico y disciplinado. Exiges excelencia, hablas con firmeza indiscutible, usas frases motivadoras de alta intensidad y no toleras excusas.";
      } else if (persona === "cientifico") {
        personaInstruction = "Eres un científico del comportamiento experto en neurociencia de hábitos. Explicas el progreso del usuario bajo términos de neuroplasticidad, psicología conductual y recomiendas tácticas probadas científicamente.";
      }

      // Determine response constraints
      let lengthConstraint = "LÍMITE DE LONGITUD DE RESPUESTA: Responde en un MÁXIMO absoluto de DOS (2) párrafos de texto. Tus respuestas deben ser sumamente memorables, concisas e incentivar la acción. Nunca superes los dos párrafos.";
      if (maxLengthRule === "medium") {
        lengthConstraint = "LÍMITE DE LONGITUD DE RESPUESTA: Brinda una respuesta de tamaño intermedio, entre DOS (2) y TRES (3) párrafos concisos.";
      } else if (maxLengthRule === "long") {
        lengthConstraint = "LÍMITE DE LONGITUD DE RESPUESTA: Brinda un desglose detallado e instructivo paso a paso. No tienes límite de tamaño pero sé directo y práctico.";
      }

      // User custom directive
      const userDirectiveSection = customInstruction && customInstruction.trim() 
        ? `\nDIRECTRICES ESPECIALES DEL USUARIO (Cumplir estrictamente):\n- El usuario te pide que adoptes esta consigna adicional: "${customInstruction}"` 
        : "";

      // Setup Gemini chat with history and core system instructions
      const systemInstruction = 
        `${personaInstruction}\n\n` +
        "INFORMACIÓN DEL USUARIO EN LA APP:\n" +
        "Metas configuradas:\n" +
        (goalsContext || "Ninguna registrada actualmente.\n") +
        "\nHábitos configurados:\n" +
        (habitsContext || "Ninguno registrado actualmente.\n") +
        userDirectiveSection +
        `\n\nREGLAS DE RESPUESTA CRÍTICAS (STRICT RULES):\n` +
        `1. Eres un coach motivacional directo, empático y experto. Habla en Español de manera natural y cálida.\n` +
        `2. Identifica y menciona de forma natural las metas y hábitos reales del usuario si se relaciona con lo que pregunta.\n` +
        `3. ${lengthConstraint}\n` +
        `4. Mantén la conversación fluida recordando lo que se habló anteriormente.`;

      const contents = [];
      
      // Map history into contents format { role: 'user' | 'model', parts: [{ text: string }] }
      if (history && history.length > 0) {
        for (const msg of history) {
          contents.push({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.text }],
          });
        }
      }
      
      // Append the current message
      contents.push({
        role: "user",
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: model || "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const replyText = response.text || "Lo siento, no pude procesar la respuesta.";
      return res.json({ text: replyText });
    } catch (error: any) {
      console.error("Error in /api/chat:", error);
      return res.status(500).json({ error: error.message || "Error al comunicarse con la IA." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
