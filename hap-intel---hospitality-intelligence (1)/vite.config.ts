import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        {
          name: "local-business-profile-api",
          configureServer(server) {
            server.middlewares.use("/api/business-profile", async (req, res) => {
              const apiKey =
                env.GEMINI_API_KEY ||
                env.API_KEY ||
                process.env.GEMINI_API_KEY ||
                process.env.API_KEY;
              if (apiKey) {
                process.env.GEMINI_API_KEY = apiKey;
                process.env.API_KEY = apiKey;
              }

              const handlerModule = await import("../api/business-profile.js");
              const handler: any = (handlerModule as any).default || handlerModule;
              return handler(req, res);
            });
          },
        },
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
