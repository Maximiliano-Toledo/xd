# OSSACRA Cartilla - Guía de Instalación con Docker

Este documento proporciona instrucciones detalladas para configurar y ejecutar el sistema OSSACRA Cartilla utilizando Docker y Docker Compose.

## Requisitos previos

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- Git (opcional, para clonar el repositorio)

## Estructura de archivos

El proyecto debe tener la siguiente estructura de archivos:

```
ossacra-cartilla/
├── api/                  # Código fuente del backend
├── client/               # Código fuente del frontend
├── db/                   # Scripts SQL y configuración de base de datos
│   └── init.sql          # Script SQL inicial para crear tablas y datos
├── Dockerfile.api        # Dockerfile para el backend
├── Dockerfile.client     # Dockerfile para el frontend
├── docker-compose.yml    # Configuración de Docker Compose
├── .env                  # Variables de entorno (opcional)
└── nginx.conf            # Configuración de Nginx (opcional)
```

## Configuración

### 1. Configuración de la base de datos

Asegúrate de que el archivo `api/config/db.js` esté configurado para leer variables de entorno:

```javascript
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,  // Debe usar la variable de entorno
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = {
    pool,
};
```

### 2. Configuración de docker-compose.yml

Asegúrate de que tu archivo `docker-compose.yml` esté configurado correctamente:

```yaml
version: '3.8'

services:
  # Servicio MariaDB
  db:
    image: mariadb:10.6
    restart: always
    environment:
      MARIADB_ROOT_PASSWORD: rootpassword
      MARIADB_DATABASE: ossacra
      MARIADB_USER: ossacra_user
      MARIADB_PASSWORD: ossacra_password
    volumes:
      - mysql_data:/var/lib/mysql
      - ./db/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "3307:3306"  # Puerto mapeado a 3307 para evitar conflictos
    networks:
      - ossacra-network
    command: 
      - --character-set-server=utf8mb4
      - --collation-server=utf8mb4_unicode_ci
      - --skip-character-set-client-handshake

  # Servicio API
  api:
    build:
      context: .
      dockerfile: Dockerfile.api
    restart: always
    depends_on:
      - db
    environment:
      NODE_ENV: production
      DB_HOST: db
      DB_USER: ossacra_user
      DB_PASSWORD: ossacra_password
      DB_NAME: ossacra
      JWT_SECRET: your_jwt_secret
      JWT_REFRESH_SECRET: your_jwt_refresh_secret
      JWT_EXPIRES_IN: 1h
      JWT_REFRESH_EXPIRES_IN: 7d
    ports:
      - "3000:3000"
    networks:
      - ossacra-network

  # Servicio Cliente
  client:
    build:
      context: .
      dockerfile: Dockerfile.client
    restart: always
    depends_on:
      - api
    ports:
      - "8080:80"  # Puerto mapeado a 8080 para evitar conflictos
    networks:
      - ossacra-network

networks:
  ossacra-network:
    driver: bridge

volumes:
  mysql_data:
```

### 3. Archivo Dockerfile.api

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar package.json y package-lock.json
COPY api/package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de los archivos de la API
COPY api/ ./

# Exponer el puerto en el que se ejecutará la API
EXPOSE 3000

# Comando para iniciar la API
CMD ["node", "app.js"]
```

### 4. Archivo Dockerfile.client

```dockerfile
# Etapa de construcción
FROM node:18-alpine as build

WORKDIR /app

# Copiar los archivos de package.json primero para aprovechar la caché de Docker
COPY client/package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de los archivos del cliente
COPY client/ ./

# Crear build de producción
RUN npm run build

# Etapa de producción con Nginx
FROM nginx:alpine

# Copiar la build de producción desde la etapa anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar la configuración personalizada de nginx si es necesaria
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

## Comandos Docker

### Construir e iniciar los contenedores

```bash
# Construir e iniciar todos los servicios en segundo plano
docker-compose up -d

# Ver los logs para monitorear el progreso
docker-compose logs -f
```

### Detener los contenedores

```bash
docker-compose down
```

### Reconstruir los contenedores (después de cambios)

```bash
docker-compose down
docker-compose build
docker-compose up -d
```

### Reconstruir un servicio específico

```bash
docker-compose build api
docker-compose up -d api
```

### Ver logs de un servicio específico

```bash
docker-compose logs -f api
```

### Ejecutar comandos dentro de un contenedor

```bash
# Acceder al shell del contenedor de la API
docker-compose exec api sh

# Acceder al shell del contenedor de la base de datos
docker-compose exec db bash

# Ejecutar un comando específico en el contenedor de la base de datos
docker-compose exec db mysql -u ossacra_user -possacra_password -D ossacra
```

## Importar una base de datos existente

### Opción 1: Usando el archivo init.sql

Coloca tu script SQL completo en `db/init.sql` antes de iniciar los contenedores. Este script se ejecutará automáticamente cuando se inicie el contenedor de la base de datos por primera vez.

### Opción 2: Importar a un contenedor en ejecución

```bash
# Copiar el archivo SQL al contenedor
docker cp tu_dump.sql ossacra-cartilla-db-1:/tmp/

# Importar el SQL a la base de datos
docker exec -i ossacra-cartilla-db-1 mysql -u root -prootpassword ossacra < /tmp/tu_dump.sql
```

### Opción 3: Usar el comando MySQL directamente

```bash
# Importar desde un archivo local
cat tu_dump.sql | docker exec -i ossacra-cartilla-db-1 mysql -u root -prootpassword ossacra
```

## Solución de problemas comunes

### Error de conexión a la base de datos

Si ves errores como "Access denied for user..." o "Connection refused":

1. Verifica que las credenciales en `docker-compose.yml` y en la aplicación coincidan
2. Confirma que el servicio de base de datos está en funcionamiento:
   ```bash
   docker-compose ps
   ```
3. Prueba a conectarte manualmente a la base de datos:
   ```bash
   docker exec -it ossacra-cartilla-db-1 mysql -u ossacra_user -possacra_password -D ossacra
   ```

### Puertos ya en uso

Si ves errores como "Ports are not available":

1. Verifica qué proceso está usando ese puerto:
   - Windows: `netstat -ano | findstr :<PORT>`
   - Linux/Mac: `lsof -i :<PORT>`
2. Cambia el mapeo de puertos en `docker-compose.yml` por uno disponible

### Volúmenes no disponibles o datos persistentes perdidos

Si los datos no persisten entre reinicios:

1. Verifica que el volumen esté configurado correctamente en `docker-compose.yml`
2. Inspecciona los volúmenes:
   ```bash
   docker volume ls
   docker volume inspect ossacra-cartilla_mysql_data
   ```

## Acceder a la aplicación

Una vez que los contenedores estén en funcionamiento, puedes acceder a:

- **Frontend**: http://localhost:8080
- **API**: http://localhost:3000
- **Base de datos**: localhost:3307 (usando un cliente MySQL)

## Mantenimiento

### Realizar copias de seguridad de la base de datos

```bash
# Exportar la base de datos
docker exec -i ossacra-cartilla-db-1 mysqldump -u root -prootpassword ossacra > backup.sql
```

### Actualizar el código

1. Actualiza los archivos en tu sistema local
2. Reconstruye los contenedores:
   ```bash
   docker-compose build
   docker-compose up -d
   ```

## Notas adicionales

- Los datos de la base de datos se almacenan en un volumen Docker llamado `ossacra-cartilla_mysql_data`
- Si necesitas realizar un reseteo completo, puedes eliminar este volumen con `docker volume rm ossacra-cartilla_mysql_data`
- Considera usar un administrador de base de datos como Adminer o phpMyAdmin para facilitar la gestión:
  ```yaml
  adminer:
    image: adminer
    restart: always
    ports:
      - "8081:8080"
    networks:
      - ossacra-network
  ```