# MysticTarot — An AI Tarot Reading System with Ritual and Aesthetic Excellence

[中文版](./README.md) | English

![MysticTarot Preview](./public/image.png)

MysticTarot is a premium online tarot reading web application built with **Nuxt 3**, **Three.js (TresJS)**, and **OpenAI**. It aims to provide users with a ritualistic journey of self-exploration through deep dark aesthetics, delicate 3D interactive animations, and profound AI interpretations.

## ✨ Core Features

- **🔮 Immersive Interaction**: Uses Three.js and GSAP to achieve physical shuffling, fan-shaped spreading, and 3D card flipping effects.
- **🤖 Deep AI Interpretation**: Integrated OpenAI API, supporting streaming (SSE) output of personalized reading reports with a gentle and insightful tone.
- **🛡️ Smart Fallback**: Automatically falls back to a built-in database of 78 tarot cards with authentic interpretations when the API key is missing or network is unstable.
- **🌌 Minimalist Dark Aesthetics**: Emerald Glow paired with deep black backgrounds, combined with dynamic starry sky particles and Glassmorphism UI.
- **🌍 Multi-language Support**: Internationalization architecture based on `@nuxtjs/i18n`, supporting both Chinese and English.
- **📱 Responsive Design**: Mobile First strategy, perfectly adapted for iOS/Android browsers and desktops.
- **🎵 Ambient Sound**: Built-in ambient background music to enhance the meditative ritual.

## 🛠️ Tech Stack

- **Framework**: [Nuxt 3](https://nuxt.com/) (Vue 3 + TypeScript)
- **3D Engine**: [TresJS](https://tresjs.org/) / Three.js
- **Animation**: [GSAP](https://gsap.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Utilities**: [VueUse](https://vueuse.org/)
- **AI**: OpenAI SDK (Streaming support)

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone git@github.com:liuxinyea/MysticTarot.git
cd MysticTarot
```

### 2. Install dependencies
```bash
pnpm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env` and fill in your OpenAI API Key:
```bash
OPENAI_API_KEY=sk-xxxx...
```
*Note: If no Key is configured, the application will automatically run in "Local Interpretation Mode".*

### 4. Start Development Server
```bash
pnpm dev
```
Visit [http://localhost:3000](http://localhost:3000) to start your experience.

## 📁 Directory Structure

```text
├── assets/           # Static assets, global styles, and raw data
├── components/       # Reusable Vue components (3D scenes, UI interaction)
├── locales/          # I18n translation files
├── pages/            # Page routes (Core logic in index.vue)
├── public/           # Static assets (Card images, JSON databases)
├── server/api/       # Nitro backend API (AI interpretation SSE)
├── stores/           # Pinia state management
├── types/            # TypeScript type definitions
└── utils/            # General utility functions
```

## 🤝 Contribution

Contributions are welcome! Whether it's UI optimization, new spread suggestions, or multi-language translations, feel free to submit an Issue or Pull Request.

## 📄 License

This project is open-sourced under the [MIT License](LICENSE).

## ☕ Support

If you find this project helpful or like the design, consider buying the author a coffee!

<img src="./public/weiPay.png" width="200px" alt="WeChat Pay" />

---
*May the stars guide you to your inner answers. 💚*
