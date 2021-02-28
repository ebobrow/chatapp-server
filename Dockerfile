# Build
FROM node AS build
WORKDIR /usr/app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

# Run
FROM node
WORKDIR /usr/app
COPY package.json ./
RUN npm install --production
COPY --from=build /usr/app/dist ./dist

EXPOSE 4000

CMD ["node", "dist/src/index.js"]