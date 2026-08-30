/** Hand-written OpenAPI 3.0 document served at /api/docs via swagger-ui-express. */
export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Aqsa Physiotherapy Centre API",
    version: "1.0.0",
    description: "Backend API for appointment requests, contact messages, and admin management.",
  },
  servers: [{ url: "/api" }],
  components: {
    securitySchemes: {
      cookieAuth: { type: "apiKey", in: "cookie", name: "admin_token" },
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      ApiSuccess: {
        type: "object",
        properties: { success: { type: "boolean", example: true }, message: { type: "string" }, data: {} },
      },
      ApiError: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string" },
          errors: {
            type: "array",
            items: { type: "object", properties: { path: { type: "string" }, message: { type: "string" } } },
          },
        },
      },
      AppointmentInput: {
        type: "object",
        required: ["fullName", "phone", "preferredDate", "preferredTime", "service"],
        properties: {
          fullName: { type: "string" },
          phone: { type: "string" },
          email: { type: "string" },
          preferredDate: { type: "string", format: "date", example: "2026-09-15" },
          preferredTime: { type: "string", example: "10:30" },
          service: { type: "string" },
          message: { type: "string" },
        },
      },
      ContactInput: {
        type: "object",
        required: ["name", "message"],
        properties: {
          name: { type: "string" },
          phone: { type: "string" },
          email: { type: "string" },
          message: { type: "string" },
        },
      },
      LoginInput: {
        type: "object",
        required: ["email", "password"],
        properties: { email: { type: "string" }, password: { type: "string" } },
      },
    },
  },
  paths: {
    "/health": {
      get: { summary: "Liveness check", responses: { 200: { description: "OK" } } },
    },
    "/appointments": {
      post: {
        summary: "Submit an appointment request (public)",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/AppointmentInput" } } },
        },
        responses: {
          201: { description: "Created, status PENDING" },
          400: { description: "Validation failed" },
          409: { description: "Slot already booked" },
          429: { description: "Rate limited" },
        },
      },
    },
    "/appointments/availability": {
      get: {
        summary: "Get open time slots for a date (public)",
        parameters: [
          { name: "date", in: "query", required: true, schema: { type: "string", format: "date" } },
        ],
        responses: { 200: { description: "OK" }, 400: { description: "Invalid date" } },
      },
    },
    "/contact": {
      post: {
        summary: "Submit a contact message (public)",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ContactInput" } } },
        },
        responses: { 201: { description: "Created" }, 400: { description: "Validation failed" } },
      },
    },
    "/admin/auth/login": {
      post: {
        summary: "Admin login",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/LoginInput" } } },
        },
        responses: { 200: { description: "OK, sets httpOnly cookie" }, 401: { description: "Invalid credentials" } },
      },
    },
    "/admin/auth/logout": {
      post: { summary: "Admin logout", security: [{ cookieAuth: [] }], responses: { 200: { description: "OK" } } },
    },
    "/admin/auth/me": {
      get: { summary: "Current admin profile", security: [{ cookieAuth: [] }], responses: { 200: { description: "OK" } } },
    },
    "/admin/appointments": {
      get: {
        summary: "List appointments (admin)",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer" } },
          { name: "limit", in: "query", schema: { type: "integer" } },
          { name: "status", in: "query", schema: { type: "string" } },
          { name: "date", in: "query", schema: { type: "string", format: "date" } },
          { name: "search", in: "query", schema: { type: "string" } },
        ],
        responses: { 200: { description: "OK" } },
      },
    },
    "/admin/appointments/{id}": {
      get: {
        summary: "Get appointment by id (admin)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "OK" }, 404: { description: "Not found" } },
      },
      patch: {
        summary: "Update appointment status/notes (admin)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "OK" } },
      },
      delete: {
        summary: "Delete appointment (admin)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "OK" } },
      },
    },
    "/admin/messages": {
      get: { summary: "List contact messages (admin)", security: [{ cookieAuth: [] }], responses: { 200: { description: "OK" } } },
    },
    "/admin/messages/{id}": {
      get: {
        summary: "Get message by id (admin)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "OK" } },
      },
      patch: {
        summary: "Update message status (admin)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "OK" } },
      },
      delete: {
        summary: "Delete message (admin)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "OK" } },
      },
    },
    "/admin/dashboard": {
      get: { summary: "Dashboard statistics (admin)", security: [{ cookieAuth: [] }], responses: { 200: { description: "OK" } } },
    },
  },
};
