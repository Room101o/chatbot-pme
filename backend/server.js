const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : '*'
}));
app.use(express.json());
app.use(express.static('public'));

// ─── Claude client ────────────────────────────────────────────
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// ─── Route principale — chat ──────────────────────────────────
app.post('/api/chat', async (req, res) => {
  try {
    const { message, config, history = [] } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message vide.' });
    }

    // Construction du system prompt selon la config client
    const systemPrompt = `Tu es ${config?.botName || 'Assistant'}, assistant virtuel de ${config?.bizName || 'notre entreprise'}.
Secteur d'activité : ${config?.sector || 'Non précisé'}.
${config?.instructions ? 'Instructions spéciales : ' + config.instructions : ''}

Règles :
- Réponds toujours en français (ou en darija si le client écrit en darija)
- Sois concis, professionnel et utile (max 3 phrases)
- Si tu ne sais pas quelque chose, propose de contacter l'équipe
- Ne mentionne jamais Claude ou Anthropic`;

    // Historique de conversation (multi-turn)
    const messages = [
      ...history.slice(-10), // max 10 derniers messages
      { role: 'user', content: message }
    ];

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: systemPrompt,
      messages
    });

    const reply = response.content[0].text;

    res.json({
      reply,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens
      }
    });

  } catch (error) {
    console.error('Erreur Claude API:', error.message);
    res.status(500).json({
      error: 'Erreur serveur. Réessayez dans quelques instants.'
    });
  }
});

// ─── Route health check (Railway/Render) ─────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Route config publique (sans API key) ────────────────────
app.get('/api/config', (req, res) => {
  res.json({
    botName: process.env.BOT_NAME || 'Assistant',
    bizName: process.env.BIZ_NAME || 'Notre Entreprise',
    sector: process.env.SECTOR || '',
    welcomeMessage: process.env.WELCOME_MESSAGE || 'Bonjour ! Comment puis-je vous aider ?'
  });
});

// ─── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Chatbot PME démarré sur le port ${PORT}`);
});
