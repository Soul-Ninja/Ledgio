const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  {
    ignores: [
      "**/node_modules/**",
      "assets/js/*.min.js",
      "assets/vendor/**",
      ".*/**",
      ".agents/**",
      ".claude/**",
      "scripts/**",
      "tests/**",
      "backend/**",
      "scratch/**",
      "graphify-out/**",
      "docs/**"
    ]
  },
  {
    files: ["eslint.config.js", "scripts/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        ...globals.node
      }
    }
  },
  js.configs.recommended,
  {
    files: ["assets/js/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        ...globals.browser,
        // Third-party CDN / vendor libraries
        supabase: "readonly",
        Chart: "readonly",
        // App globals and cross-module bridges
        LEDGIO_VERSION: "writable",
        LedgioAuth: "writable",
        LedgioVault: "writable",
        LedgioSync: "writable",
        LedgioCategories: "writable",
        LedgioExpenses: "writable",
        LedgioGoals: "writable",
        LedgioLoans: "writable",
        LedgioIncome: "writable",
        LedgioPwa: "writable",
        DEFAULT_CATEGORIES: "writable",
        // Shared helpers exposed across modules
        escapeHtml: "writable",
        formatCurrency: "writable",
        getUserId: "writable",
        showToast: "writable",
        showConfirm: "writable",
        broadcastSyncEvent: "writable",
        sanitizeIcon: "writable",
        sanitizeColor: "writable",
        bootstrapLedgioApp: "writable",
        app: "writable"
      }
    },
    rules: {
      "no-undef": "error"
    }
  },
  {
    files: ["sw.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        ...globals.serviceworker
      }
    },
    rules: {
      "no-undef": "error"
    }
  }
];
