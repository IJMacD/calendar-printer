FROM node:22.2-slim
RUN apt-get update && apt-get install -y cups-client
WORKDIR /app
COPY package.json yarn.lock .
RUN ["yarn", "install", "--frozen-lockfile"]
COPY src/ .
CMD ["./init.sh"]