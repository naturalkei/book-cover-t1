# VRT Starter R1

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-9-4B32C3?style=flat-square&logo=eslint&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

> **2026 Modern Frontend Boilerplate**
> <br> A highly opinionated starter template featuring **React 19**, **Vite 7**, and **Tailwind CSS 4**.
> <br> Formatted exclusively with **ESLint 9** (No Prettier, No Semicolons).

![VRT](./public/vrt-260108-1.png)

## 🚀 Features

* **⚡️ Blazing Fast:** Built with **Vite 7** for instant server start and HMR.
* **⚛️ React 19:** Full support for the latest React features (Server Components, Actions).
* **🎨 Tailwind CSS v4:** Configured with the new oxide engine using TypeScript.
* **✨ Zero Prettier:** Styling and formatting are handled entirely by **ESLint 9** (`@stylistic/eslint-plugin`).
    * *Single Quotes*
    * *No Semicolons*
* **🛡️ Type Safe:** Strict TypeScript 5 configuration with separated `app` and `node` environments.
* **🛣️ Smart Routing:** **React Router v6** with auto-mapped path aliases (`@/` -> `src/`).
* **🤖 CI/CD Ready:** Automated deployment to **GitHub Pages** via GitHub Actions.
* **📱 PWA Ready:** Includes proper meta tags, favicons, and Open Graph setups.

## 📦 Tech Stack

| Category | Technology | Version |
| :--- | :--- | :--- |
| **Framework** | [React](https://react.dev) | v19 |
| **Build Tool** | [Vite](https://vitejs.dev) | v7 |
| **Styling** | [Tailwind CSS](https://tailwindcss.com) | v4 |
| **Language** | [TypeScript](https://www.typescriptlang.org) | v5 |
| **Linter** | [ESLint (Flat Config)](https://eslint.org) | v9 |
| **Router** | [React Router](https://reactrouter.com) | v6 |
| **Package Manager** | [pnpm](https://pnpm.io) | v9+ |

## 🛠 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/vrt-starter-r1.git
cd vrt-starter-r1
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Setup Environment Variables (Optional)

Create a `.env` file in the root directory if you need to customize local development variables.

```conf
VITE_BASE_URL="/{reponame}"
VITE_GITHUB_URL="https://github.com/{username}/{reponame}"
VITE_SITE_URL="https://{username}.github.io/{reponame}/"
```

### 4. Run Development Server

```bash
pnpm dev
```

## 📜 Scripts

| Script            | Description                                                                |
|-------------------|----------------------------------------------------------------------------|
| `pnpm dev`        | Starts the development server.                                              |
| `pnpm build`      | Runs TypeScript type checking (`tsc -b`) and builds for production.         |
| `pnpm serve`      | Previews the production build locally.                                      |
| `pnpm lint`       | Runs ESLint styling issues.                                                 |
| `pnpm lint:fix`   | Automatically fixes all ESLint auto-fixable style issues.                   |


## 🧩 Project Structure

```text
vrt-starter-r1/
├── .github/workflows/   # GitHub Actions (Deployment)
├── public/              # Static assets (Favicon, etc.)
├── src/
│   ├── components/      # Shared components (Layout, UI)
│   ├── pages/           # Page components (Home, etc.)
│   ├── App.tsx          # App entry with Routes
│   ├── main.tsx         # React DOM rendering
│   └── index.css        # Tailwind imports & global styles
├── .env                 # Environment variables
├── eslint.config.ts     # ESLint 9 Flat Config
├── tailwind.config.ts   # Tailwind CSS Config
├── tsconfig.json        # TypeScript Root Config (References)
├── vite.config.ts       # Vite Config
└── package.json
```

## 💅 Code Style

(ESLint Only)This project does not use Prettier. Instead, it uses ESLint 9 with `@stylistic/eslint-plugin` to enforce specific formatting rules:

* Semi: Never (`const a = 1`)
* Quotes: Single (`'hello'`)
* JSX Quotes: Double (`<div className="box">`)
* Indent: 2 spaces
* Object Curly Spacing: Always (`{ key: value }`)
* React Hooks: Strictly enforced (`react-hooks/recommended`)

To fix style issues, simply run:
```bash
pnpm lint:fix
```

## 🚀 Deployment
This template is configured to deploy to GitHub Pages automatically.

1. Push your code to the main branch.
1. Go to your repository Settings > Pages.
1. Ensure the source is set to GitHub Actions.
1. The workflow defined in .github/workflows/deploy.yml will handle the rest.

## 📝 Naming Convention
The suffix `-r1` stands for Revision 1. This is a personal sequence numbering system for skeleton projects.
Future updates to the stack will be released as `-r2`, `-r3`, etc.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](/LICENSE) file for details.
