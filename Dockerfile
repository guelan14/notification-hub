FROM node:24-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm approve-builds --all && pnpm rebuild

COPY . .

RUN pnpm exec prisma generate

RUN pnpm build && ls dist/

EXPOSE 3000

CMD sh -c "pnpm exec prisma migrate deploy && node dist/src/index.js"