FROM node:16

WORKDIR /chat

COPY package.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 5173

CMD ["npm", "run","dev"]
