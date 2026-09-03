
# CrazySupportHub

Sistema de gestión de tickets de soporte técnico con enriquecimiento asíncrono mediante IA, panel Kanban responsivo y control de acceso basado en roles (RBAC).

# Requisitos Previos

Herramientas instaladas en tu entorno local antes de iniciar:

* Node.js v18+ y npm v9+
* PostgreSQL v15+ (local o en contenedor)
* n8n (instancia local vía npm)
* Docker & Docker Desktop

#  Configuración del Entorno (Variables de Entorno)

Crea los archivos de entorno correspondientes utilizando las plantillas de ejemplo.

# 1. Backend (`backend/.env`)
.env:

PORT=4000
DATABASE_URL="postgresql://postgres:password@localhost:5432/crazysupporthub?schema=public"
JWT_SECRET="super_secret_jwt_key"
N8N_WEBHOOK_URL="http://localhost:5678/webhook/enrichment"
N8N_WEBHOOK_SECRET="super_secret_n8n_key"
GEMINI_API_KEY=your_gemini_api_key_here


# 2. Frontend (`frontend/.env`)

VITE_API_URL="http://localhost:4000/api"


# Instalación y Ejecución Local

# Opción A: Despliegue Rápido con Docker Compose

Si prefieres ejecutar toda la infraestructura (Base de Datos, Backend y Frontend) en un solo comando:

bash:
docker compose up --build -d


> Servicios:
> rontend (Nginx):** `http://localhost:80`
> Backend API:** `http://localhost:4000`


# Opción B: Instalación Manual por Componente

# 1. Base de Datos y Backend

bash:
# Navegar a la carpeta del backend
cd backend

# Aplicar migraciones y poblar la base de datos (Seed)
npx prisma migrate dev
npx prisma db seed

# Iniciar servidor:
npm run dev



# 2. Frontend

bash:
# Navegar a la carpeta del frontend
cd frontend

# Iniciar servidor de desarrollo con Vite
npm run dev


# 3. Configuración del Workflow en n8n

1. Iniciar n8n con variables de entorno del backend:
Para que n8n tome automáticamente las variables de entorno (como `GEMINI_API_KEY`, `N8N_WEBHOOK_SECRET` y los endpoints), ejecuta el siguiente comando desde la carpeta `backend/`:
bash
cd backend
npx dotenv-cli -e .env -- npx n8n


*Nota: n8n se iniciará por defecto en `http://localhost:5678`.*
2. Importar el Workflow:
* Abre la interfaz web de n8n en tu navegador (`http://localhost:5678`).
* Ve a la sección Workflows y selecciona 'Import from File'.
* Carga el archivo del flujo ubicado en la raíz del proyecto: `/n8n/workflow.json`.


3. Verificar Configuración:
* Gemini AI: El flujo ya tomará la API Key cargada mediante la variable `GEMINI_API_KEY` del `.env`.
* Callback HTTP Request: El nodo de retorno enviará la información de vuelta al backend utilizando la cabecera `x-webhook-secret` respaldada por `N8N_WEBHOOK_SECRET`.


4. Activar el Workflow:
* Cambia el interruptor en la esquina superior derecha de **Inactive** a Active (ON) para comenzar a escuchar las peticiones.

## Pruebas Automatizadas

El backend incluye una suite de integración desarrollada con **Vitest** y **Supertest** que valida los flujos críticos (autenticación, JWT y seguridad de webhooks).

Para ejecutar los tests:

bash
cd backend
npx dotenv-cli -e .env -- npx vitest run


# Decisiones Técnicas

Se eligió **Express con TypeScript** frente a NestJS para mantener una arquitectura ligera, explícita y rápida de iterar en una prueba técnica de alcance acotado. La persistencia se manejó con Prisma ORM por su tipado estricto end-to-end y facilidad para ejecutar migraciones y modelar esquemas complejos con PostgreSQL. El enriquecimiento con IA se diseñó bajo un patrón asíncrono no bloqueante (fire-and-forget): al crear un ticket, la API responde un estatus `201 Created` inmediato con el registro en estado `pending` y dispara una petición sin `await` hacia n8n. Esto desacopla por completo la disponibilidad de la API REST de la latencia o fallas de la llamada externa al modelo de lenguaje.

Para gestionar el estado asíncrono en el cliente sin añadir la sobrecarga de WebSockets, se implementó un mecanismo de polling temporalizado en el frontend que sondea la API cada segundo durante un máximo de 12 segundos tras la creación del ticket. Si n8n procesa la solicitud, la interfaz recibe la tarjeta en estado `done` y actualiza el Kanban dinámicamente; si se supera el tiempo límite o el procesamiento falla, el cliente ejecuta de forma transparente una petición de purga `DELETE` y notifica al usuario, asegurando que nunca queden datos corruptos o huérfanos en pantalla.

---

#  Uso de Herramientas de IA

Se utilizaron herramientas de asistencia basada en IA (Gemini / Cline) para acelerar etapas del desarrollo:

* Sintaxis de Nodos en n8n: Generación de scripts en JavaScript para el parseo semántico de etiquetas y formateo del payload en n8n.
* Scaffolding de Pruebas: Plantillas base para la suite de integración con Supertest y Vitest.
* Layout Responsivo: Apoyo en reglas de Tailwind CSS para la transición del tablero Kanban y el panel lateral (*Drawer*) en dispositivos móviles.

* Nota: La lógica de negocio, reglas de autorización por rol (RBAC), control de transacciones y arquitectura general del sistema fueron diseñadas, implementadas y auditadas manualmente.


# Advertencias, Pendientes y Bugs Conocidos

* Comunicación en Entornos Contenerizados: Al ejecutar la suite completa en contenedores de Docker, la variable `N8N_WEBHOOK_URL` dentro del backend debe apuntar a `http://host.docker.internal:5678` en lugar de `localhost` para permitir la comunicación entre contenedores.
* Paginación y Virtualización del Tablero: El listado del tablero Kanban carga las incidencias en memoria. Para un volumen superior a miles de tickets simultáneos, se recomienda implementar paginación por columna o infinite scroll.
* Evolución Futura (WebSockets): Aunque el mecanismo de *polling* cumple con la experiencia fluida en la creación individual, en un entorno de trabajo colaborativo multisitio es recomendable sustituir el sondeo por Server-Sent Events (SSE) o Socket.io para emitir actualizaciones en tiempo real a todos los agentes conectados.
