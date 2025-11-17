// src/server/health.ts
export const health = async () => {
  return { status: "ok", timestamp: new Date().toISOString() };
};
