import { createTRPCRouter, publicProcedure } from "./trpc";
import { z } from "zod";

interface StableDiffusionOutput {
  image_base64: string;
}

interface BananaStartResponse {
  id: string;
  message: string;
  // Unix timestamp
  created: number;
  apiVersion: string;
  callID: string;
  finished: boolean;
  // Contains a result if the model was able to finish fast enough
  modelOutputs: StableDiffusionOutput[];
}

interface BananaCheckResponse {
  id: string;
  message: string;
  // Unix timestamp
  created: number;
  apiVersion: string;
  // Contains a result if the model has finished
  modelOutputs: StableDiffusionOutput[];
}

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  start: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(async ({ input }) => {
      console.log("Starting the model to generate with the prompt: " + input.text);
      console.log("waiting...");

      const call = await fetch("https://api.banana.dev/start/v4/", {
        headers: {
          'Content-Type': "application/json"
        },
        method: "POST",
        body: JSON.stringify({
          apiKey: process.env.BANANA_API,
          modelKey: process.env.BANANA_MODEL_KEY,
          startOnly: true,  
          modelInputs: {
            prompt: input.text
          }
        })
      })
      const res: BananaStartResponse = await call.json();
      console.log("callID: " + res.callID);
      return res;
    }),

    check: publicProcedure
      .input(z.object({ callID: z.string() }))
      .query(async ({ input }) => {
        if (input) {
          console.log("fetching result with callID: " + input.callID);
          const call = await fetch("https://api.banana.dev/check/v4/", {
            headers: {
              'Content-Type': "application/json"
            },
            method: "POST",
            body: JSON.stringify({
              apiKey: process.env.BANANA_API,
              callID: input.callID
            })
          })

          const res: BananaCheckResponse = await call.json();
          return res;
        }
      })
});

// export type definition of API
export type AppRouter = typeof appRouter;
