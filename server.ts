import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Simple and robust custom CORS headers so that Google Sites embed or any other iframe can request the API.
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // API endpoint to generate the liturgical celebration using Gemini API
  app.post("/api/generate", async (req, res) => {
    const { theme, niveau } = req.body;

    if (!theme || !niveau) {
      return res.status(400).json({ error: "Le thème et le niveau sont requis." });
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ 
          error: "Clé API Gemini non configurée. Veuillez ajouter GEMINI_API_KEY dans les secrets." 
        });
      }

      // Initialize GoogleGenAI SDK with named parameter and 'aistudio-build' User-Agent header for telemetry
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const prompt = `Agis comme un expert en liturgie et en pédagogie chrétienne pour une école privée catholique. Je souhaite organiser une célébration sur le thème suivant : ${theme}.
Rédige-moi un déroulé complet, structuré pour ${niveau}, en suivant scrupuleusement le plan et le style de présentation ci-dessous.

Instructions pour chaque étape :
Accueil et introduction :
- Chant d'entrée : Suggère 2 titres adaptés.
- Mot d'accueil : Rédige un texte bienveillant introduisant le thème.
- Signe de croix et prière initiale : Une courte prière adaptée.

Liturgie de la Parole :
- Texte biblique : Choisis un passage court, pertinent et inspirant. Écris le texte complet avec la référence biblique.
- Temps de méditation : Précise le temps de silence et guide-le par une phrase.
- Commentaire/Homélie : Rédige un texte prêt à l'emploi structuré en 3 points pédagogiques clairs (environ 3 à 5 minutes par point, rédigé de manière fluide, chaleureuse et engageante pour le public cible).
- Examen de conscience (Guidé) : Propose 3 questions simples et directes (Envers Dieu, Envers les autres, Envers moi-même).

Rite de la célébration :
- Chant de recueillement : Suggère 2 titres.
- Rite/Geste symbolique : Propose une action concrète et marquante pour les élèves de ce niveau. Rédige l'explication à dire aux élèves pour introduire et vivre ce geste.

Action de grâce et envoi :
- Chant d'action de grâce : Suggère 2 titres.
- Prière universelle : Propose 3 intentions (pour l'école, pour les familles, pour le monde).
- Prière finale : adaptée au thème et une bénédiction finale d'envoi.
- Chant de sortie : Suggère 2 titres dynamiques.

Conseils finaux :
- Ajoute quelques recommandations concrètes pour l'aménagement de l'espace (le lieu de culte ou la salle), la participation active des élèves et le maintien d'un climat propice au recueillement.

Ton attendu : Chaleureux, solennel mais accessible, bienveillant, respectueux des traditions de l'enseignement catholique et très adapté à la sensibilité de la classe d'âge choisie (${niveau}).

Rédige l'ensemble du déroulé en français, de manière complète et riche, sans résumés ni raccourcis, afin que l'animateur puisse l'imprimer et l'utiliser directement. Utilise un formatage Markdown élégant (avec des titres, des listes à puces claires et des blocs de citations si nécessaire).`;

      let response;
      let lastError = null;
      const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
      
      for (const modelName of modelsToTry) {
        let attempts = 2;
        for (let attempt = 1; attempt <= attempts; attempt++) {
          try {
            console.log(`Tentative de génération avec le modèle ${modelName} (essai ${attempt}/${attempts})...`);
            response = await ai.models.generateContent({
              model: modelName,
              contents: prompt,
              config: {
                temperature: 0.7,
              },
            });
            break; // Succeeded!
          } catch (err: any) {
            lastError = err;
            console.warn(`Échec de génération avec ${modelName} (essai ${attempt}):`, err.message || err);
            if (attempt < attempts) {
              // Wait for 1.5 seconds before retrying
              await new Promise((resolve) => setTimeout(resolve, 1500));
            }
          }
        }
        if (response) {
          break; // Succeeded, don't try other models
        }
      }

      if (!response || !response.text) {
        throw lastError || new Error("Impossible de générer le contenu après plusieurs essais.");
      }

      const text = response.text;
      return res.json({ result: text });
    } catch (error: any) {
      console.error("Erreur lors de l'appel Gemini API:", error);
      return res.status(500).json({ 
        error: error.message || "Une erreur est survenue lors de la génération de la célébration." 
      });
    }
  });

  // Vite development middleware vs Static production serving
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
