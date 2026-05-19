# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Environment Variables

- **VITE_GAS_URL**: 本地開發用的 Google Apps Script Web App URL（範例: https://script.google.com/macros/s/xxx/exec）。
  - 在本地開發可於 `.env` 檔案中加入 `VITE_GAS_URL=...`。

### GitHub Actions Secrets

以下 secrets 用於 staging/production 分流部署：

- **VITE_GAS_URL_PROD**: production 環境的 GAS URL。
- **VITE_GAS_URL_STAGING**: staging 環境的 GAS URL。

## Deployment (GitFlow)

- `prod` branch: 觸發 production 部署，發佈到 GitHub Pages 根目錄。
- `staging` branch: 觸發 staging 部署，發佈到 `staging` 子目錄。

### Workflows

- `.github/workflows/deploy.yml`：production workflow（監聽 `prod`）。
- `.github/workflows/deploy-staging.yml`：staging workflow（監聽 `staging`）。

### URLs

- Production: `https://<account>.github.io/<repo>/`
- Staging: `https://<account>.github.io/<repo>/staging/`

### Build Commands

- `npm run build`：一般 build。
- `npm run build:prod`：production build（由 workflow 注入 base path 與 production secrets）。
- `npm run build:staging`：staging build（由 workflow 注入 base path 與 staging secrets）。

## Versioning Automation

每次 GitHub Actions 部署都會自動建立版本資訊，並隨部署產出 `version.json`。

- Production version endpoint: `https://<account>.github.io/<repo>/version.json`
- Staging version endpoint: `https://<account>.github.io/<repo>/staging/version.json`

`version.json` 內容包含：

- env（staging 或 production）
- version（格式：`<package-version>-<env>.<run-number>+<short-sha>`）
- packageVersion
- runNumber
- commit
- branch
- buildTime（UTC）

