process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/testdb";
process.env.JWT_SECRET = "test-only-secret-do-not-use-in-prod-123456";
process.env.JWT_EXPIRES_IN = "1h";
process.env.FRONTEND_URL = "http://localhost:5173";
process.env.CLINIC_NOTIFICATION_EMAIL = "";
process.env.SMTP_HOST = "";
