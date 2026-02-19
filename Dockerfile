# --- ESTÁGIO 1: Base com Dependências de Runtime (O que SEMPRE será necessário) ---
FROM node:22-alpine AS base

# Definir fuso horário
ENV TZ=America/Sao_Paulo

# Instalar pnpm globalmente
RUN npm install -g pnpm@10.15.1

# Instalar dependências de SISTEMA (Runtime: PDF, Office, JRE)
# Esta camada é pesada mas raramente muda, ficando em cache.
RUN apk add --no-cache \
    libreoffice \
    openjdk11-jre \
    ttf-dejavu \
    fontconfig \
    zip \
    unzip \
    libc6-compat

WORKDIR /app

# --- ESTÁGIO 2: Build (Onde instalamos compiladores e geramos o código) ---
FROM base AS build

# Instalar dependências de COMPILAÇÃO (Necessárias apenas para instalar pacotes node)
# Removidas no estágio final para economizar MUITO espaço.
RUN apk add --no-cache g++ python3 make

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Instalar dependências usando cache mount
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --no-frozen-lockfile

# Copiar código e gerar build
COPY . .
RUN pnpm build

# --- ESTÁGIO 3: Final (Imagem leve apenas com o essencial) ---
FROM base AS final

# Copiar apenas o necessário do estágio de build
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=build /app/patches ./patches

# Instalar apenas dependências de produção para reduzir espaço
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --prod --no-frozen-lockfile

# Definir variável de ambiente para produção
ENV NODE_ENV=production

# Expor porta e comando
EXPOSE 3000
CMD ["pnpm", "start"]