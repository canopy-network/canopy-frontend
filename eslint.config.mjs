import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // Disable unused vars rule completely
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-vars": "off",
      // Disable explicit any rule
      "@typescript-eslint/no-explicit-any": "off",
      // Disable unused expressions rule
      "@typescript-eslint/no-unused-expressions": "off",
      "no-unused-expressions": "off",
      // Disable Next.js rule for <img>
      "@next/next/no-img-element": "off",
    },
  },
];

export default eslintConfig;
