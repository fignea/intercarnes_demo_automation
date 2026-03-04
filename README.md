## Demo de pedidos / órdenes - Intercarnes

Aplicación de ejemplo en **Node.js + Express + MySQL** que permite:

- **Crear/actualizar una intención** de orden vía API.
- **Confirmar una intención como orden**, o crear una orden directamente sin intención.
- **Listar y ver órdenes** desde un frontend público (sin login).

### 1. Configuración de entorno

Copiá `example.env` a `.env` en la raíz del proyecto:

```bash
cp example.env .env
```

Asegurate de que los datos de MySQL coincidan con tu base de datos:

- `mysql_user`
- `mysql_password`
- `mysql_database`
- `mysql_host`
- `mysql_port`

### 2. Estructura de tablas MySQL

Ejecutá este SQL en tu base de datos vacía:

```sql
CREATE TABLE intentions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  intention_key VARCHAR(100) NOT NULL UNIQUE,
  producto VARCHAR(255) NULL,
  cantidad INT NULL,
  foto_url TEXT NULL,
  audio_url TEXT NULL,
  telefono VARCHAR(50) NULL,
  nombre VARCHAR(255) NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  intention_key VARCHAR(100) NULL,
  producto VARCHAR(255) NULL,
  cantidad INT NULL,
  foto_url TEXT NULL,
  audio_url TEXT NULL,
  telefono VARCHAR(50) NULL,
  nombre VARCHAR(255) NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);
```

### 3. Instalación y ejecución

```bash
npm install
npm run dev   # modo desarrollo (nodemon)
# o
npm start     # modo producción
```

La app escucha por defecto en `http://localhost:3000`.

### 4. Endpoints de la API

#### Crear / actualizar intención

`POST /api/intentions`

Body JSON (todos opcionales, se guardan contra una intención única):

```json
{
  "intentionId": "INT-123", // opcional, si no se manda se genera uno
  "producto": "Bolsa de asado",
  "cantidad": 3,
  "foto_url": "https://tu-ftp/.../foto.jpg",
  "audio_url": "https://tu-ftp/.../audio.mp3",
  "telefono": "+54 9 11 1234-5678",
  "nombre": "Juan Pérez"
}
```

Si la `intentionId` ya existe, se **actualiza** la misma intención.

Respuesta:

```json
{
  "ok": true,
  "intention": { "...campos de la intención..." }
}
```

#### Obtener una intención

`GET /api/intentions/:intentionKey`

Devuelve la intención asociada a esa clave.

---

#### Crear orden (confirmar intención o crear directa)

`POST /api/orders`

Body JSON:

```json
{
  "intentionKey": "INT-123", // opcional
  "producto": "Bolsa de asado", // opcional, pisa lo de la intención si viene
  "cantidad": 3,
  "foto_url": "https://tu-ftp/.../foto.jpg",
  "audio_url": "https://tu-ftp/.../audio.mp3",
  "telefono": "+54 9 11 1234-5678",
  "nombre": "Juan Pérez"
}
```

- Si se envía `intentionKey`, el sistema busca la intención y completa los campos que falten con los datos de la intención.
- Podés **confirmar una orden sin completar todos los campos de la intención** (o incluso **sin intención**, sólo mandando los datos en el body).

Respuesta:

```json
{
  "ok": true,
  "order": { "...campos de la orden..." }
}
```

#### Listar órdenes (API)

`GET /api/orders`

Devuelve un array de órdenes (listado resumido).

#### Obtener detalle de una orden (API)

`GET /api/orders/:id`

Devuelve el detalle completo de la orden.

### 5. Frontend (visualización pública)

No requiere login. Es solo para ver lo que se generó por API.

- `GET /orders` → Lista todas las órdenes en una tabla.
- `GET /orders/:id` → Muestra el detalle de la orden, con:
  - datos básicos (producto, cantidad, usuario, teléfono)
  - **foto** del producto (si `foto_url` está cargada)
  - **audio** de confirmación (si `audio_url` está cargada)

La carga de la imagen y el audio se hace por afuera (por ejemplo, vía FTP usando las credenciales del `.env`) y en la intención/orden sólo se guarda la URL pública.

# intercarnes_demo_automation
