/**
 * Chatbot PME Widget — v1.0
 * Intégration : <script src="chatbot.js"></script>
 * puis ChatbotPME.init({ ... })
 */
(function (window) {
  'use strict';

  // ─── Styles injectés dans la page client ──────────────────
  const CSS = `
    #cpme-btn {
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      width: 56px; height: 56px; border-radius: 50%;
      background: var(--cpme-color, #1a73e8); color: #fff;
      border: none; cursor: pointer; font-size: 24px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s;
    }
    #cpme-btn:hover { transform: scale(1.08); }
    #cpme-box {
      position: fixed; bottom: 92px; right: 24px; z-index: 9999;
      width: 340px; max-width: calc(100vw - 32px);
      background: #fff; border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      display: flex; flex-direction: column;
      overflow: hidden; font-family: sans-serif;
      transition: opacity 0.2s, transform 0.2s;
    }
    #cpme-box.hidden { opacity: 0; pointer-events: none; transform: translateY(12px); }
    #cpme-header {
      background: var(--cpme-color, #1a73e8); color: #fff;
      padding: 14px 16px; display: flex; align-items: center; gap: 10px;
    }
    #cpme-header .avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: rgba(255,255,255,0.25);
      display: flex; align-items: center; justify-content: center; font-size: 18px;
    }
    #cpme-header .info .name { font-weight: 600; font-size: 15px; }
    #cpme-header .info .status { font-size: 12px; opacity: 0.85; }
    #cpme-messages {
      flex: 1; padding: 14px; overflow-y: auto;
      max-height: 300px; min-height: 180px;
      display: flex; flex-direction: column; gap: 8px;
      background: #f8f9fa;
    }
    .cpme-msg {
      max-width: 82%; padding: 9px 13px; border-radius: 14px;
      font-size: 14px; line-height: 1.5;
    }
    .cpme-msg.bot {
      background: #fff; color: #1a1a1a; align-self: flex-start;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }
    .cpme-msg.user {
      background: var(--cpme-color, #1a73e8); color: #fff;
      align-self: flex-end; border-bottom-right-radius: 4px;
    }
    .cpme-typing {
      display: flex; gap: 4px; align-items: center;
      padding: 10px 13px; background: #fff; border-radius: 14px;
      align-self: flex-start; box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }
    .cpme-typing span {
      width: 7px; height: 7px; border-radius: 50%;
      background: #aaa; animation: cpme-bounce 1.2s infinite;
    }
    .cpme-typing span:nth-child(2) { animation-delay: 0.2s; }
    .cpme-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes cpme-bounce {
      0%,60%,100% { transform: translateY(0); }
      30% { transform: translateY(-5px); }
    }
    #cpme-footer {
      padding: 10px 12px; border-top: 1px solid #eee;
      display: flex; gap: 8px; background: #fff;
    }
    #cpme-input {
      flex: 1; border: 1px solid #ddd; border-radius: 20px;
      padding: 8px 14px; font-size: 14px; outline: none;
    }
    #cpme-input:focus { border-color: var(--cpme-color, #1a73e8); }
    #cpme-send {
      width: 36px; height: 36px; border-radius: 50%;
      background: var(--cpme-color, #1a73e8); color: #fff;
      border: none; cursor: pointer; font-size: 16px;
      display: flex; align-items: center; justify-content: center;
    }
    #cpme-branding {
      text-align: center; font-size: 11px; color: #bbb;
      padding: 4px 0 8px; background: #fff;
    }
  `;

  // ─── HTML du widget ────────────────────────────────────────
  function createWidget(config) {
    const style = document.createElement('style');
    style.textContent = CSS;
    if (config.primaryColor) {
      style.textContent += `
        :root { --cpme-color: ${config.primaryColor}; }
      `;
    }
    document.head.appendChild(style);

    document.body.insertAdjacentHTML('beforeend', `
      <button id="cpme-btn" aria-label="Ouvrir le chat">💬</button>
      <div id="cpme-box" class="hidden" role="dialog" aria-label="Chat avec ${config.botName}">
        <div id="cpme-header">
          <div class="avatar">🤖</div>
          <div class="info">
            <div class="name">${config.botName}</div>
            <div class="status">🟢 En ligne</div>
          </div>
        </div>
        <div id="cpme-messages">
          <div class="cpme-msg bot">${config.welcomeMessage}</div>
        </div>
        <div id="cpme-footer">
          <input id="cpme-input" type="text" placeholder="Votre message..." maxlength="500" />
          <button id="cpme-send" aria-label="Envoyer">➤</button>
        </div>
        <div id="cpme-branding">Powered by IA</div>
      </div>
    `);
  }

  // ─── Logique ───────────────────────────────────────────────
  function initEvents(config) {
    const btn = document.getElementById('cpme-btn');
    const box = document.getElementById('cpme-box');
    const input = document.getElementById('cpme-input');
    const send = document.getElementById('cpme-send');
    const messages = document.getElementById('cpme-messages');
    let history = [];
    let isOpen = false;

    // Toggle ouverture
    btn.addEventListener('click', () => {
      isOpen = !isOpen;
      box.classList.toggle('hidden', !isOpen);
      btn.textContent = isOpen ? '✕' : '💬';
      if (isOpen) input.focus();
    });

    // Envoi message
    async function sendMessage() {
      const text = input.value.trim();
      if (!text) return;
      input.value = '';

      // Message utilisateur
      appendMsg(text, 'user');
      history.push({ role: 'user', content: text });

      // Typing indicator
      const typing = document.createElement('div');
      typing.className = 'cpme-typing';
      typing.innerHTML = '<span></span><span></span><span></span>';
      messages.appendChild(typing);
      scrollBottom();

      try {
        const res = await fetch(config.apiUrl + '/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            config: {
              botName: config.botName,
              bizName: config.bizName,
              sector: config.sector || '',
              instructions: config.instructions || ''
            },
            history: history.slice(-8)
          })
        });

        const data = await res.json();
        typing.remove();

        const reply = data.reply || 'Désolé, une erreur est survenue.';
        appendMsg(reply, 'bot');
        history.push({ role: 'assistant', content: reply });

      } catch (e) {
        typing.remove();
        appendMsg('Erreur de connexion. Réessayez dans quelques instants.', 'bot');
      }
    }

    send.addEventListener('click', sendMessage);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') sendMessage();
    });

    function appendMsg(text, type) {
      const div = document.createElement('div');
      div.className = `cpme-msg ${type}`;
      div.textContent = text;
      messages.appendChild(div);
      scrollBottom();
    }

    function scrollBottom() {
      messages.scrollTop = messages.scrollHeight;
    }
  }

  // ─── API publique ──────────────────────────────────────────
  window.ChatbotPME = {
    init: function (config) {
      const defaults = {
        botName: 'Assistant',
        bizName: 'Notre Entreprise',
        welcomeMessage: 'Bonjour ! Comment puis-je vous aider ?',
        primaryColor: '#1a73e8',
        apiUrl: 'http://localhost:3000',
        sector: '',
        instructions: ''
      };
      const cfg = Object.assign({}, defaults, config);
      document.addEventListener('DOMContentLoaded', function () {
        createWidget(cfg);
        initEvents(cfg);
      });
      // Si DOM déjà prêt
      if (document.readyState !== 'loading') {
        createWidget(cfg);
        initEvents(cfg);
      }
    }
  };

})(window);
