# Pruebas de Componente (UI) -- NEXUS

---

## Resumen General

| Metrica | Valor |
|---|---|
| **Total de pruebas** | 15 |
| **Tipo** | Componente (UI testing con DOM simulado) |
| **Framework** | Vitest + React Testing Library + jsdom |
| **Navegador real** | No (DOM simulado via jsdom) |
| **Archivo de test** | 1 |
| **Componente cubierto** | LoginPage |

### Por que son pruebas de componente

Las pruebas de componente verifican que un componente React se **renderiza correctamente** y **responde a interacciones del usuario** sin abrir un navegador real. Se ejecutan en un DOM simulado (jsdom) y usan mocks para aislar dependencias externas (API, navegacion).

**Diferencias clave con otros tipos:**

| Aspecto | Componente (UI) | Unitaria | E2E |
|---|---|---|---|
| DOM | jsdom (simulado) | No hay DOM | Navegador real |
| Dependencias | Mockeadas | Mockeadas | Reales |
| Velocidad | Rapida (~ms) | Muy rapida (~ms) | Lenta (~s) |
| Que verifica | Renderizado, interacciones | Logica pura | Flujo completo |

### Como ejecutarlas

```bash
# Ejecutar desde el directorio frontend
cd frontend
npm test

# Ejecutar con verbose
npx vitest run --reporter=verbose
```

### Configuracion

**Config:** [`vite.config.ts`](file:///c:/Users/USUARIO/Desktop/Nexus/frontend/vite.config.ts)

```typescript
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: './src/test/setup.ts',
  css: true,
}
```

**Setup:** [`setup.ts`](file:///c:/Users/USUARIO/Desktop/Nexus/frontend/src/test/setup.ts) -- Importa `@testing-library/jest-dom` para matchers como `toBeInTheDocument()`.

**Dependencias de testing:**
- `vitest` -- Test runner
- `@testing-library/react` -- Renderizado y queries
- `@testing-library/user-event` -- Simulacion de interacciones de usuario
- `@testing-library/jest-dom` -- Matchers extendidos para DOM
- `jsdom` -- DOM simulado

---

## Tecnica de Aislamiento

El componente `LoginPage` depende de:
1. **`useAuth()`** -- Hook de autenticacion (llama a la API)
2. **`useNavigate()`** -- Navegacion de React Router

Ambas dependencias se **mockean** para aislar el componente:

```typescript
// Mock de useAuth: retorna un login() controlable
vi.mock('../hooks/useAuth', async () => ({
  ...actual,
  useAuth: () => ({
    login: mockLogin,      // jest.fn() controlable
    user: null,
    token: null,
    isAuthenticated: false,
    // ...
  }),
}));

// Mock de useNavigate: captura las llamadas a navigate()
vi.mock('react-router-dom', async () => ({
  ...actual,
  useNavigate: () => mockNavigate,  // jest.fn() controlable
}));
```

---

## Pruebas Detalladas (15 tests)

**Archivo:** [`LoginPage.test.tsx`](file:///c:/Users/USUARIO/Desktop/Nexus/frontend/src/test/LoginPage.test.tsx)

---

### Categoria 1: Renderizado de estructura (5 tests)

#### COMP-LOGIN-01: Renderiza los campos de email y contrasena

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica que el formulario contiene los dos inputs principales con sus placeholders |
| **Tipo de verificacion** | Presencia de elementos en el DOM |
| **Queries usadas** | `getByPlaceholderText('tu@email.com')`, `getByPlaceholderText('••••••••')` |
| **Resultado esperado** | Ambos inputs estan en el documento |

#### COMP-LOGIN-02: Renderiza el branding NEXUS y el titulo

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica que el logo/marca "NEXUS" y el heading "Iniciar Sesion" se renderizan |
| **Tipo de verificacion** | Presencia de texto |
| **Queries usadas** | `getByText('NEXUS')`, `getByText('Iniciar Sesión')` |
| **Resultado esperado** | Ambos textos visibles |

#### COMP-LOGIN-03: Muestra el link de registro con href correcto

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica que el enlace "Registrate aqui" existe y apunta a `/register` |
| **Tipo de verificacion** | Presencia de elemento + atributo href |
| **Queries usadas** | `getByText('Regístrate aquí')`, `.closest('a').href` |
| **Resultado esperado** | Link presente con `href="/register"` |

#### COMP-LOGIN-04: Renderiza el subtitulo y el footer institucional

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica elementos secundarios: tagline "Transformacion del Talento" y footer con ODS |
| **Tipo de verificacion** | Presencia de texto |
| **Queries usadas** | `getByText('Transformación del Talento')`, `getByText(/ODS 4, ODS 8, ODS 17/)` |
| **Resultado esperado** | Ambos textos visibles |

#### COMP-LOGIN-05: Los inputs tienen IDs correctos para testing

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica que los elementos interactivos tienen IDs unicos para browser testing y automatizacion |
| **Tipo de verificacion** | Existencia de IDs en el DOM |
| **Queries usadas** | `getElementById('login-email')`, `getElementById('login-password')`, `getElementById('login-submit')` |
| **Resultado esperado** | Los 3 IDs existen en el documento |

---

### Categoria 2: Atributos y tipos de input (3 tests)

#### COMP-LOGIN-06: El campo email tiene type="email" y autocomplete

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica los atributos HTML del input de email para accesibilidad y UX del navegador |
| **Tipo de verificacion** | Atributos de elemento |
| **Validaciones** | `type="email"`, `autocomplete="email"` |
| **Importancia** | `type=email` activa validacion nativa del navegador y teclado especial en movil |

#### COMP-LOGIN-07: El campo contrasena tiene type="password" y autocomplete

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica que el input de contrasena oculta el texto y permite autocompletado del navegador |
| **Tipo de verificacion** | Atributos de elemento |
| **Validaciones** | `type="password"`, `autocomplete="current-password"` |
| **Importancia** | `type=password` enmascara caracteres; `autocomplete` permite gestores de contrasenas |

#### COMP-LOGIN-08: Renderiza las labels Email y Contrasena

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica que los labels descriptivos estan presentes para accesibilidad |
| **Tipo de verificacion** | Presencia de texto |
| **Queries usadas** | `getByText('Email')`, `getByText('Contraseña')` |
| **Resultado esperado** | Ambos labels visibles |

---

### Categoria 3: Boton submit (2 tests)

#### COMP-LOGIN-09: El boton de submit muestra "Ingresar" por defecto

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica el texto del boton en estado inicial (no cargando) |
| **Tipo de verificacion** | Contenido de texto |
| **Query** | `getElementById('login-submit')` |
| **Resultado esperado** | `textContent === "Ingresar"` |

#### COMP-LOGIN-10: El boton es de type="submit"

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica que el boton es de tipo submit para que el formulario se envie con Enter |
| **Tipo de verificacion** | Atributo de elemento |
| **Validacion** | `type="submit"` |
| **Importancia** | Sin `type=submit`, presionar Enter no envia el formulario |

---

### Categoria 4: Validacion del formulario (2 tests)

#### COMP-LOGIN-11: Muestra error de validacion con email invalido

| Campo | Detalle |
|---|---|
| **Descripcion** | Simula que el usuario escribe un email invalido ("not-an-email") y envia el formulario. Verifica que Zod muestra el mensaje de error inline |
| **Tipo de verificacion** | Validacion client-side (Zod + react-hook-form) |
| **Interaccion** | `userEvent.type()` en email y password, luego `fireEvent.submit()` |
| **Resultado esperado** | Texto "Email invalido" aparece en el DOM |
| **Asincrono** | Si -- usa `waitFor()` porque la validacion es asincrona |

#### COMP-LOGIN-12: Muestra error cuando la contrasena esta vacia

| Campo | Detalle |
|---|---|
| **Descripcion** | Simula envio del formulario con email valido pero sin contrasena. Verifica el mensaje de validacion |
| **Tipo de verificacion** | Validacion client-side (campo requerido) |
| **Interaccion** | `userEvent.type()` solo en email, luego submit |
| **Resultado esperado** | Texto "Contrasena requerida" aparece en el DOM |

---

### Categoria 5: Interaccion con login (3 tests)

#### COMP-LOGIN-13: Llama login() con las credenciales al enviar el formulario

| Campo | Detalle |
|---|---|
| **Descripcion** | Simula un login completo: llena email y password, envia el formulario, y verifica que `useAuth().login()` fue llamado con los valores correctos |
| **Tipo de verificacion** | Llamada a funcion mockeada con argumentos esperados |
| **Interaccion** | Tipo email `test@nexus.com`, password `SecurePass123!`, submit |
| **Mock** | `mockLogin.mockResolvedValueOnce(undefined)` |
| **Resultado esperado** | `mockLogin` llamado con `('test@nexus.com', 'SecurePass123!')` |

#### COMP-LOGIN-14: Navega a /dashboard tras login exitoso

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica que despues de un login exitoso, el componente navega a la pagina del dashboard |
| **Tipo de verificacion** | Llamada a `navigate()` mockeado |
| **Mock** | `mockLogin` resuelve sin error |
| **Resultado esperado** | `mockNavigate` llamado con `'/dashboard'` |
| **Importancia** | Verifica el flujo post-login sin necesidad de un router real |

#### COMP-LOGIN-15: Muestra mensaje de error cuando login falla

| Campo | Detalle |
|---|---|
| **Descripcion** | Simula un error de la API (credenciales invalidas) y verifica que el componente muestra el mensaje de error en la UI |
| **Tipo de verificacion** | Renderizado condicional de error |
| **Mock** | `mockLogin.mockRejectedValueOnce({ response: { data: { error: 'Credenciales invalidas' } } })` |
| **Resultado esperado** | Texto "Credenciales invalidas" aparece en el DOM |
| **Importancia** | Verifica el manejo de errores del componente sin depender de la API real |

---

## Matriz de Cobertura

### Por tipo de verificacion

| Tipo | Tests | IDs |
|---|---|---|
| Presencia de elementos | 5 | COMP-LOGIN-01, 02, 03, 04, 08 |
| Atributos HTML | 4 | COMP-LOGIN-05, 06, 07, 10 |
| Texto de elementos | 1 | COMP-LOGIN-09 |
| Validacion client-side | 2 | COMP-LOGIN-11, 12 |
| Llamadas a funciones mock | 2 | COMP-LOGIN-13, 14 |
| Renderizado condicional | 1 | COMP-LOGIN-15 |

### Cobertura del componente LoginPage

| Aspecto del componente | Cubierto | Tests |
|---|---|---|
| Input email (renderizado) | Si | 01, 05, 06 |
| Input password (renderizado) | Si | 01, 05, 07 |
| Labels | Si | 08 |
| Boton submit | Si | 09, 10 |
| Branding (NEXUS, titulo) | Si | 02 |
| Tagline y footer | Si | 04 |
| Link a registro | Si | 03 |
| Validacion de email | Si | 11 |
| Validacion de password | Si | 12 |
| Llamada a login() | Si | 13 |
| Navegacion post-login | Si | 14 |
| Manejo de errores API | Si | 15 |
| Spinner de loading | No | -- |

---

## Resultado de Ejecucion

```
 ✓ src/test/LoginPage.test.tsx (15 tests) 2532ms

 Test Files  1 passed (1)
      Tests  15 passed (15)
   Duration  4.90s
```

Todas las 15 pruebas de componente pasan correctamente.
