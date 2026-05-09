# 🏪 Mercado Digital — Cali & Candelaria

Plataforma web de digitalización de comercio local mediante IA, orientada a microempresarios con baja alfabetización digital.

---

## 🗂 Estructura de Carpetas

```
mercado-digital/
├── public/
├── src/
│   ├── App.jsx                    # Punto de entrada, routing condicional
│   ├── main.jsx                   # Bootstrap React
│   ├── index.css                  # Estilos globales (Tailwind)
│   │
│   ├── store/                     # 📦 Estado global (Zustand)
│   │   ├── authStore.js           # Sesión del usuario
│   │   └── inventoryStore.js      # Inventario, filtros, digitalizador
│   │
│   ├── services/                  # 🔌 Capa de datos y APIs externas
│   │   ├── authService.js         # Auth via backend Node.js (+ mock)
│   │   ├── inventoryService.js    # Cloud Firestore CRUD (+ mock)
│   │   └── geminiService.js       # Google Gemini Vision API (+ mock)
│   │
│   ├── views/                     # 📄 Páginas principales
│   │   ├── LoginView.jsx          # Autenticación: login + registro
│   │   ├── DashboardView.jsx      # Panel del comerciante
│   │   ├── DigitizerView.jsx      # Digitalización con IA (flujo 3 pasos)
│   │   └── CatalogView.jsx        # Catálogo con filtros
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   └── Navbar.jsx         # Barra de navegación
│   │   ├── inventory/
│   │   │   └── ItemCard.jsx       # Tarjeta de producto/servicio/arriendo
│   │   └── ui/
│   │       └── LoadingScreen.jsx  # Pantalla de carga inicial
│   │
│   └── hooks/                     # (para hooks personalizados futuros)
│
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## 🚀 Instalación y Ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Ejecutar en modo desarrollo (mock activo, no necesitas backend Node.js)
npm run dev

# 3. Construir para producción
npm run build
```

---

## 🔧 Configuración por Entorno

Crea un archivo `.env.local` para las credenciales:

```env
# Backend Node.js
VITE_API_URL=http://localhost:4000
VITE_USE_DUMMY_AUTH=true

# Gemini
VITE_GEMINI_API_KEY=tu_gemini_api_key
```

### Cambiar de Mock a Producción

En cada servicio, cambia el flag:
```js
// services/authService.js
const USE_MOCK = false; // → Activa Firebase Auth real

// services/geminiService.js
const USE_MOCK = false; // → Activa Gemini API real

// services/inventoryService.js
const USE_MOCK = false; // → Activa Cloud Firestore real
```

---

## 🤖 Flujo del Digitalizador con IA

```
1. Usuario sube foto (drag & drop o cámara)
        ↓
2. geminiService.analyzeProductImage(file)
        ↓ base64 + prompt → Gemini Vision API
3. Gemini retorna JSON: { nombre, precio, categoria, descripcion, tags }
        ↓ guardado en inventoryStore.aiSuggestedData
4. Formulario pre-cargado con datos sugeridos
        ↓ usuario revisa y corrige
5. inventoryService.createItem() → Firestore
        ↓
6. Pantalla de éxito ✅
```

---

## 📐 Principios de Diseño UX

- **Bajo impacto cognitivo**: Máximo 1 acción por pantalla
- **Íconos + texto**: Siempre juntos para mayor legibilidad
- **Flujo lineal**: Sin menús ni submenús profundos
- **Errores en lenguaje natural**: Sin tecnicismos
- **Mobile-first**: Navegación inferior tipo app nativa

---

## 🛣 Roadmap Sugerido

- [ ] PWA: Service Worker + Manifest para instalación en home screen
- [ ] Galería de fotos por ítem (múltiples imágenes)
- [ ] WhatsApp share button por producto
- [ ] Panel de analytics básico (vistas, clics)
- [ ] OCR de precios en imagen (mejora del prompt de Gemini)
- [ ] PostgreSQL para catálogo público indexado por ubicación
