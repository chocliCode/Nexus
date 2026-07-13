# Caso 1: Login Seguro (Implementación 10 Niveles de Prueba)

Este documento centraliza la evidencia de las implementaciones de los 10 niveles de pruebas requeridos para el Caso de Uso: **Login Seguro**. A continuación, detallamos las 3 pruebas principales por cada nivel y cómo fueron construidas.

---

## 1.1 Análisis Estático (Lint & Types)
*Se valida la solidez estructural del código antes de la ejecución.*
1. **Validación Zod Estricta:** `loginSchema.parse()` garantiza que `email` sea string y contenga '@'.
2. **Tipado de Typescript (`AuthRequest`):** Forzamos que `req.body` corresponda a la interfaz de tipado antes de tocar `bcrypt`.
3. **Reglas de ESLint:** Se aplican reglas como `no-unused-vars` o `no-eval` en el controlador para evitar la inyección de comandos en runtime.

## 1.2 Pruebas Unitarias Backend (Caja Blanca)
*Aislamos el controlador de la base de datos usando `jest.mock()` en `auth.controller.unit.test.ts`.*
1. **UNIT-AUTH-CTRL-01:** Simula que `pool.query` retorna un arreglo vacío. Verifica que el endpoint retorne `401 Credenciales inválidas` sin llegar a llamar a `bcrypt` (ahorrando CPU).
2. **UNIT-AUTH-CTRL-02:** Simula que existe el usuario, pero inyecta un mock donde `bcrypt.compare` devuelve `false`. Valida el rechazo por contraseña.
3. **UNIT-AUTH-CTRL-03:** Inyecta un mock que devuelve `true` en validación de contraseñas y mockea `jwt.sign`. Retorna 200 y el token simulado.

## 1.3 Pruebas de Componente UI (Vitest + React Testing Library)
*Renderizamos la UI de Login aisladamente en `LoginPage.test.tsx`.*
1. **UI-AUTH-01:** Simula hacer clic en "Ingresar" con campos vacíos. Verificamos que los hooks muestren instantáneamente los mensajes "Email inválido" y "Contraseña requerida" interceptados por `react-hook-form` y Zod.
2. **UI-AUTH-02:** Rellena inputs con `userEvent` o `fireEvent` y simula el submit. Validamos que la función inyectada (`mockLogin`) se llama con los datos correctos.
3. **UI-AUTH-03:** Simula un fallo de red donde la función `login()` lanza un `AxiosError`. Verificamos que el componente UI renderiza dinámicamente un *toast* o banner rojo mostrando "Credenciales inválidas desde el servidor".

## 1.4 Pruebas de Seguridad OWASP
*Vectores de ataque en `auth.sqli.test.ts`.*
1. **SEC-SQLI-01 (Blind Time-Based SQLi):** Enviamos payload `'test@nexus.test'; SELECT pg_sleep(5)--`. Probamos midiendo tiempo que la petición toma <100ms, demostrando que `$1` parametrizado inutilizó el inyector.
2. **SEC-SQLI-02 (Error-Based SQLi):** Enviamos comentario mutilado `admin@nexus.test' /*`. Garantizamos que la API responde limpiamente (400) sin escupir *Stack Traces* que revelen la estructura interna de Postgres.
3. **SEC-SQLI-03 (JSON Parameter Pollution / NoSQLi):** Enviamos un objeto `email: { "$gt": "" }`. Zod atrapa esto afirmando que no es un string primitivo, previniendo escalamiento de privilegios o bypaseo del chequeo JWT.

## 1.5 Pruebas de Humo / Smoke
*Supervisión de salud rápida en `auth.smoke.test.ts`.*
1. **SMOKE-AUTH-01:** Dispara POST al endpoint `/login` con cuerpo vacío. Recibe 400. Verifica que las rutas de Express y validadores iniciales están vivos.
2. **SMOKE-AUTH-02:** Dispara POST al endpoint `/register` con cuerpo vacío para probar disponibilidad instantánea.
3. **SMOKE-AUTH-03:** Dispara GET a `/auth/me` sin token. Verifica que devuelve `401 AUTH_REQUIRED`, asegurando que la protección de Middleware global está de pie tras un despliegue.

## 1.6 Pruebas de Integración API + DB
*Validan inserción en `nexus_test` dentro de `auth.test.ts`.*
1. **INT-AUTH-01:** Retorna JWT usando credenciales sembradas (Seed real en BD) del padawan.
2. **INT-AUTH-02:** Intenta registrar cuenta usando email duplicado (`carlos@authtest.com`), esperando que la restricción UNIQUE en Postgres salte y retorne 409 `EMAIL_DUPLICATE`.
3. **INT-AUTH-03:** Solicita su propio perfil (`/me`) pasando el Bearer Token real, resolviendo con éxito y recuperando datos mediante SQL `JOIN`.

## 1.7 Pruebas de Aceptación BDD (Cucumber)
*Lenguaje humano evaluado dinámicamente en `nexus.feature`.*
1. **UAT-01 (Registro):** Given el sistema activo -> When nuevo usuario ingresa "nuevo@nexus.com" -> Then registra usuario y retorna 201.
2. **UAT-02 (Login Admin):** Given admin existe -> When intenta sesión -> Then retorna token JWT 200.
3. **UAT-03 (Login Padawan):** Given padawan existe -> When intenta sesión -> Then retorna acceso.

## 1.8 Pruebas E2E Playwright
*Navegador Chrome invisible probando el ecosistema en `nexus.spec.ts`.*
1. **E2E-01:** Redirección automática de dashboard a `/login` si no hay sesión (`page.goto('/dashboard')` termina en `/login`).
2. **E2E-02:** Localizar y tipar en `locator('input[type="email"]')` y `input[type="password"]`.
3. **E2E-03:** Hacer click en Submit y comprobar transicion visible al `dashboard` con barra superior.

## 1.9 Pruebas de Carga / Load
*Enjambre de usuarios en `load-auth.yml`.*
1. **LOAD-01:** *Ramp-up* inyectando 5 a 10 registros por segundo concurrentes (estresando locks de transacción y validaciones UNIQUE).
2. **LOAD-02:** Picos de 20 RPS a `/login`, obligando a `bcrypt.compare` a saturar un poco los worker threads, evaluando P95 ms.
3. **LOAD-03:** Avalancha de usuarios ya logueados llamando concurrentemente a `/me` solicitando JOINs pesados en la base de datos de 3 tablas.

## 1.10 Pruebas de Estrés / Stress
*Buscando colapso del sistema en `stress-auth.yml`.*
1. **STRESS-01 (Avalancha CPU Bound):** Genera fuerza bruta sobre login con contraseñas muy largas, buscando que el hashing de Bcrypt colapse los hilos del Event Loop y evaluando si el rate limit (`express-rate-limit`) logra botar peticiones previniendo un DoS.
2. **STRESS-02 (Punto de quiebre BD):** 200 registros por segundo para ver si PostgreSQL excede el límite configurado de 20 conexiones activas (`max: 20` en el pool) y empujar en cola.
3. **STRESS-03 (Recuperación):** Después del pico 200RPS, bajar súbitamente a 10RPS para demostrar que Express limpia la RAM (Garbage Collector) y recupera la latencia normal en vez de quedarse congelado.
