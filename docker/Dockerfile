# Erste Stufe: Build des Frontend
FROM node:21 as frontend-build-stage

# Setzen des Arbeitsverzeichnisses für das Frontend
WORKDIR /app

# Kopieren der Frontend-Dateien
COPY quiz-app-frontend/package.json ./
RUN npm install
COPY quiz-app-frontend/ .
RUN npm run build

# Zweite Stufe: Build des Backend
FROM node:latest as backend-build-stage

WORKDIR /usr/src/app

COPY quiz-app-backend/package.json ./
RUN npm install
COPY quiz-app-backend/ .
RUN npm run build

# Dritte Stufe: Nginx zum Ausführen des Frontend und als Proxy für das Backend
FROM nginx:alpine

# Kopieren der Frontend-Build-Artefakte zum Nginx-Server
COPY --from=frontend-build-stage /app/dist /usr/share/nginx/html
COPY --from=backend-build-stage /usr/src/app/dist /backend

# Anpassen der Nginx-Konfiguration für das Routing und das Ausführen des Node.js-Servers
COPY ./docker/nginx.conf /etc/nginx/nginx.conf

# Installieren von Node.js in Nginx Container
RUN apk add --update nodejs npm

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]