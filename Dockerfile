# Usar imagem Node.js 22 (compatível com a versão do projeto)
FROM node:22-alpine

# Instalar pnpm globalmente
RUN npm install -g pnpm@10.15.1

# Definir fuso horário
ENV TZ=America/Sao_Paulo

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Instalar dependências
RUN apk add --no-cache libreoffice openjdk11-jre ttf-dejavu fontconfig zip unzip fontconfig g++ python3 make
RUN pnpm install --no-frozen-lockfile

# Copiar todo o código fonte
COPY . .

# Fazer o Build da aplicação
RUN pnpm build

# Definir variável de ambiente para produção
ENV NODE_ENV=production

# Expor porta da aplicação
EXPOSE 3000

# Comando para iniciar em produção
CMD ["pnpm", "start"]