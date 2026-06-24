# Remix: Générateur de Célébration Liturgique

Une application full-stack moderne (React + Express + Vite + Google Gemini API) conçue pour aider les prêtres, enseignants et animateurs pastoraux à concevoir des célébrations et célébrations liturgiques de haute qualité, prêtes à l'emploi et adaptées à chaque cycle scolaire.

## 🌟 Fonctionnalités

- **Génération Intelligente (Gemini AI)** : Créez des célébrations complètes avec chants d'entrée/sortie, textes bibliques, homélies, rituels et conseils pratiques basés sur le thème liturgique et l'âge des élèves.
- **Export Microsoft Word (.doc)** : Exportation directe en un clic d'un fichier `.doc` hautement compatible avec Microsoft Word, LibreOffice et Google Docs pour une utilisation immédiate.
- **Design Épuré et Éditorial** : Interface soignée utilisant des polices classiques et une mise en page d'inspiration éditoriale adaptée pour une lecture et une impression aisées.
- **Intégration Facilitée** : Prêt à être déployé sur Cloud Run ou à être intégré dans un Google Sites d'établissement scolaire.

---

## 🛠️ Installation et Démarrage Local

### Prérequis
- [Node.js](https://nodejs.org/) (Version 20 ou supérieure recommandée)
- Un compte Google AI Studio pour obtenir une clé API Gemini.

### 1. Cloner le dépôt et installer les dépendances
```bash
# Installer les dépendances
npm install
```

### 2. Configurer les variables d'environnement
Créez un fichier `.env` à la racine du projet (copié de `.env.example`) :
```env
GEMINI_API_KEY="VOTRE_CLE_API_GEMINI"
APP_URL="http://localhost:3000"
```

### 3. Lancer l'application en mode développement
```bash
npm run dev
```
L'application sera accessible localement sur `http://localhost:3000`.

---

## 🚀 Script de Construction et Production

Pour compiler l'application de manière optimisée pour la production :

```bash
# Étape de build (compile le client Vite et l'Express Server)
npm run build

# Démarrer le serveur de production
npm run start
```

Le script de build rassemble l'ensemble de l'application (le serveur et le client statique) dans le dossier `/dist`.

---

## 🐙 Intégration GitHub & GitHub Actions

Un workflow d'intégration continue (**CI**) a été ajouté dans le dossier `.github/workflows/ci.yml`. Il s'exécute automatiquement à chaque fois que vous poussez du code sur `main` ou `master` ou ouvrez une pull request.

### Fonctionnement du Workflow GitHub Actions :
1. **Validation** : Vérifie la syntaxe de votre code TypeScript et l'absence d'erreurs d'importation (`npm run lint`).
2. **Construction** : Vérifie que le processus complet de build (`npm run build`) se déroule sans erreur pour garantir que votre application est toujours déployable.

### Comment pousser votre projet sur GitHub :

1. Initialisez git dans votre dossier de projet si ce n'est pas déjà fait :
   ```bash
   git init
   git add .
   git commit -m "Initial commit avec générateur liturgique et GitHub Actions"
   ```

2. Créez un dépôt sur GitHub, puis liez-le à votre dépôt local :
   ```bash
   git remote add origin https://github.com/VOTRE_NOM_UTILISATEUR/NOM_DU_REPO.git
   git branch -M main
   git push -u origin main
   ```

3. Ajoutez votre clé API sur GitHub (facultatif pour le CI standard, mais obligatoire pour vos déploiements continus) :
   - Allez sur votre dépôt GitHub -> **Settings** -> **Secrets and variables** -> **Actions**.
   - Cliquez sur **New repository secret**.
   - Nommez-le `GEMINI_API_KEY` et collez-y votre clé d'API Google AI Studio.

---

## 📂 Structure du Projet

```text
├── .github/workflows/ci.yml  # Workflow d'intégration continue GitHub Actions
├── assets/                   # Assets statiques de l'application
├── src/
│   ├── components/
│   │   └── MarkdownRenderer.tsx # Rendu et formatage élégant du texte de célébration
│   ├── App.tsx               # Interface utilisateur principale
│   ├── index.css             # Styles globaux et configuration du thème Tailwind
│   └── main.tsx              # Point d'entrée de l'application React
├── server.ts                 # Serveur Express gérant l'API de génération Gemini et le service statique
├── package.json              # Gestion des dépendances et scripts npm
├── tsconfig.json             # Configuration de TypeScript
└── vite.config.ts            # Configuration du bundler Vite
```
