FROM node:lts-alpine as builder

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine

# Copy nginx config directly (not as a template)
COPY nginx.conf /etc/nginx/nginx.conf

# Remove default nginx index page
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Make port 8080 available
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]