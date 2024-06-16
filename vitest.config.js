import { defineConfig } from "vite";
import viteTsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [viteTsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    resolve: {
      alias: {
        "@": "./src",
      },
    },
  },
});
