FROM node:24-alpine@sha256:116b800c3754b440ee0aa3ed2f20f5bf3d99a554bfd9adeea09ea8017f6e85f5
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force \
    && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx /opt/yarn-v* /usr/local/bin/yarn /usr/local/bin/yarnpkg
COPY --chown=node:node . .
RUN mkdir -p /app/public/uploads && chown -R node:node /app/public/uploads
USER node
EXPOSE 5000
CMD ["node", "index.js"]
