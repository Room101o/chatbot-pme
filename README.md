# 🤖 Chatbot PME — Powered by Claude AI

Assistant AI customisable pour PME — Backend Express + Widget JS intégrable sur n'importe quel site.

---

## 📁 Structure du projet

```
chatbot-pme/
├── backend/
│   ├── server.js          ← API Express (déployer sur Railway/Render)
│   ├── package.json
│   └── .env.example       ← Copier en .env et remplir
└── frontend/
    ├── chatbot.js         ← Widget à héberger / servir au client
    └── demo.html          ← Page de démonstration
```

---

## 🚀 Installation locale

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Remplir ANTHROPIC_API_KEY dans .env
npm start
```

Le serveur démarre sur `http://localhost:3000`

### 2. Frontend (test)

Ouvrir `frontend/demo.html` dans le navigateur — le chatbot apparaît en bas à droite.

---

## ☁️ Déploiement Railway

1. Pusher le dossier `backend/` sur GitHub
2. Aller sur [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Ajouter les variables d'environnement :
   - `ANTHROPIC_API_KEY` = votre clé API Anthropic
   - `BOT_NAME`, `BIZ_NAME`, etc. (optionnel)
4. Copier l'URL publique générée (ex: `chatbot-pme.up.railway.app`)
5. Mettre cette URL dans `ChatbotPME.init({ apiUrl: "..." })`

## ☁️ Déploiement Render (gratuit sans carte)

1. Aller sur [render.com](https://render.com) → New Web Service
2. Connecter le repo GitHub
3. Build command : `npm install`
4. Start command : `node server.js`
5. Ajouter `ANTHROPIC_API_KEY` dans Environment Variables

---

## 🔌 Intégration chez le client

Ajouter ces lignes dans le HTML du site client (avant `</body>`) :

```html
<script src="https://VOTRE-API.up.railway.app/chatbot.js"></script>
<script>
  ChatbotPME.init({
    botName: "Assistant Karima",
    bizName: "Restaurant Dar Zitoun",
    sector: "Restauration",
    instructions: "Nous sommes ouverts de 12h à 23h. Menu disponible sur notre site.",
    welcomeMessage: "Bonjour ! Réservation ou renseignement ? 😊",
    primaryColor: "#e8a020",
    apiUrl: "https://VOTRE-API.up.railway.app"
  });
</script>
```

---

## ⚙️ Options de configuration

| Option | Type | Description |
|--------|------|-------------|
| `botName` | string | Nom du bot affiché |
| `bizName` | string | Nom de l'entreprise |
| `sector` | string | Secteur d'activité |
| `instructions` | string | Contexte métier détaillé |
| `welcomeMessage` | string | Message d'accueil |
| `primaryColor` | string | Couleur principale (hex) |
| `apiUrl` | string | URL de votre backend déployé |

---

## 💰 Modèle de pricing suggéré

| Plan | Prix | Messages/mois |
|------|------|---------------|
| Starter | 199 MAD/mois | 500 |
| Business | 499 MAD/mois | 3 000 |
| Pro | 999 MAD/mois | Illimité |

Coût Claude API : ~$0.003 / message → marge ~82% sur le plan Business.

---

## 📞 Support

Développé par Issam — disponible pour customisation et intégration sur mesure.
