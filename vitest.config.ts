import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",

    include: ["tests/**/*.test.ts"],

    coverage: {
      reporter: ["text", "html"],
      include: [
        "src/services/**/*.ts",
        "src/controllers/**/*.ts",
        "src/middleware/**/*.ts",
      ],
      exclude: [
        "src/services/LeituraService.ts",
        "src/controllers/AreaController.ts",
        "src/controllers/LeituraController.ts",
        "src/controllers/SensorController.ts",
        "src/middleware/authMidd.ts",
      ],
    },
  },
});
