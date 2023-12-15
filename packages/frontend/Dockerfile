# FROM --platform=linux/amd64 node:21.4-alpine as base

# # install packages
# RUN apk --no-cache add curl

# WORKDIR /app
# COPY package*.json ./

# # install and prune node_modules
# RUN npm install

# # RUN npm install --production && \
# #     curl -sf https://gobinaries.com/tj/node-prune | sh && \
# #     node-prune

# # prune node_modules
# # RUN curl -sf https://gobinaries.com/tj/node-prune | sh
# # RUN node-prune

# RUN addgroup -g 1001 -S nodejs
# RUN adduser -S nextjs -u 1001
# USER nextjs

# RUN npm run build

# COPY . .
# EXPOSE 8080
# ENV NODE_OPTIONS=--max_old_space_size=1024
# CMD ["npm","run","dev"]

FROM --platform=linux/amd64 node:21.4-alpine as base
RUN apk add --no-cache g++ make py3-pip libc6-compat
WORKDIR /app
COPY package*.json ./
EXPOSE 3000

FROM base as builder
WORKDIR /app
RUN npm i
COPY . .
RUN npm run build


FROM base as production
WORKDIR /app

ENV NODE_ENV=production
RUN npm i

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs


COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

CMD npm start

FROM base as dev
ENV NODE_ENV=development
RUN npm install 
COPY . .
CMD npm run dev