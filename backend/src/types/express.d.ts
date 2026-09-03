import type { AdminRole } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      admin?: {
        id: string;
        email: string;
        role: AdminRole;
      };
      patient?: {
        id: string;
        email: string;
        name: string;
      };
    }
  }
}

export {};
