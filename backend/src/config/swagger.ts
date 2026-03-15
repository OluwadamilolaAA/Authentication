import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env";

const swaggerDefinition = {
  openapi: "3.0.3",
  info: {
    title: "Authentication API",
    version: "1.0.0",
    description: "Express + TypeScript authentication backend",
  },
  servers: [
    {
      url: `http://localhost:${env.port}`,
      description: "Local server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          code: { type: "string", nullable: true },
          details: { nullable: true },
        },
      },
    },
  },
};

export const swaggerSpec = swaggerJsdoc({
  definition: swaggerDefinition,
  apis: ["src/docs/*.ts"],
});
