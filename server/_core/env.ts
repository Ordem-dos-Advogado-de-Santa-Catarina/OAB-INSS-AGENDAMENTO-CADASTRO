export const ENV = {
  // AQUI ESTAVA O PROBLEMA: Adicionamos um valor fixo caso a variável venha vazia
  appId: process.env.VITE_APP_ID || "agendamento-inss-web", 
  
  cookieSecret: process.env.JWT_SECRET || process.env.SESSION_SECRET || "#lmjmMJ2484#$22",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL || "http://localhost:3000",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};