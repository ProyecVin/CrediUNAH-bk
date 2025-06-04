<<<<<<< HEAD
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
ENV PORT=8000
EXPOSE 8000
=======
#src/Dockerfile
FROM node:18-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Copia package.json primero para aprovechar la caché de capas de Docker
COPY package*.json ./

# Instala las dependencias
RUN npm ci --only=production

# Copia el resto del código de la aplicación
COPY . .


# Establece la variable de entorno para el puerto
ENV PORT=8000

# Expone el puerto que utilizará la aplicación
EXPOSE 8000


# Comando para ejecutar la aplicación asegurando que escuche en todas las interfaces
>>>>>>> d80ebb03ab2cfcdea2a686e74e3daa6fc6ec4320
CMD ["node", "src/app.js"]