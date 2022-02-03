# Stage 0 - Build Frontend Assets
FROM node:12.16.3-alpine as build

WORKDIR /app

RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get update && apt-get install -y nodejs
COPY package*.json ./
RUN npm install
RUN npm fund
RUN npm audit fix
COPY . .
RUN npm run build

# Stage 1 - Serve Frontend Assets
FROM fholzer/nginx-brotli:v1.12.2

WORKDIR /etc/nginx
ADD nginx.conf /etc/nginx/nginx.conf

COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]