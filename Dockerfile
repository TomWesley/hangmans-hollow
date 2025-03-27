FROM node:lts-alpine as builder

COPY package.json ./
RUN npm install
RUN mkdir /app-ui
RUN mv ./node_modules ./app-ui
WORKDIR /app-ui
COPY . .
RUN npm run build

FROM nginx:alpine

# Copy the nginx config directly
COPY ./nginx.conf /etc/nginx/nginx.conf

# Remove default nginx index page and replace it with the static files
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app-ui/build /usr/share/nginx/html

# Expose port 8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]