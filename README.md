# 🚀 EasySlides

> **Presentador de Diapositivas Minimalista, Ultra Rápido y Optimizado para el Navegador.**

EasySlides es una aplicación web del lado del cliente diseñada para proyectar diapositivas PDF y PPTX con la máxima fluidez. Ha sido optimizada meticulosamente para responder a apuntadores inalámbricos y controles remotos de presentación convencionales.

El proyecto está diseñado bajo una arquitectura modular y moderna en Astro, ofreciendo una experiencia sin dependencias de servidor (100% client-side), diseño ultra optimizado (con carga perezosa de librerías pesadas) y soporte completo para SEO multilingüe.

Desplegado en producción en: [easyslides.irammcfly.dev](https://easyslides.irammcfly.dev)

---

## ✨ Características Principales

- ⚡ **Rendimiento Instantáneo:** División de código (code-splitting) para que la página de bienvenida cargue en milisegundos.
- 📂 **Soporte PDF y PPTX:** Renderizado directo en el navegador de archivos locales sin subir información a servidores externos (privacidad total).
- 🖱️ **Optimizado para Clickers:** Soporte nativo para apuntadores inalámbricos (remotos de diapositivas) mediante mapeo de teclas (`Enter`, `Espacio`, `Flechas`, `PageUp`, `PageDown`, etc.).
- 🎭 **Transiciones Fluidas:** Sistema de triple lienzo (3-canvas layout) en PDF para pre-renderizar las páginas adyacentes y ofrecer deslizamientos fluidos.
- 🌓 **Temas Dinámicos:** Modos Oscuro y Claro minimalistas con estilo monocromático premium.
- 🌐 **Internacionalización (i18n):** Traducción instantánea entre Español e Inglés con detección automática basada en el navegador.
- 🔍 **SEO de Elite:** Tags OpenGraph, Twitter Cards, enlaces canónicos y esquema JSON-LD para indexación impecable de la marca y sus variaciones (*EasySlides*, *Easy Slides*, *easyslides*).

---

## 🛠️ Tecnologías Utilizadas

- **Core Framework:** [Astro v6](https://astro.build/) (Modo Estático/SSG)
- **Lector PDF:** [pdfjs-dist](https://github.com/mozilla/pdf.js) (cargado bajo demanda en cliente)
- **Lector PPTX:** [pptx-preview](https://github.com/meshesha/pptx-preview) (cargado bajo demanda en cliente)
- **Estilos:** CSS Vanilla con variables globales y CSS Scoped de Astro.
- **Tipografía:** *Outfit* (títulos) y *Inter* (cuerpo) vía Google Fonts.

---

## 📁 Estructura del Proyecto

El código fuente está dividido de manera lógica para maximizar el mantenimiento y la escalabilidad del proyecto:

```text
easy-slides/
├── public/                  # Archivos estáticos
│   ├── favicon.svg          # Logotipo vectorial
│   ├── robots.txt           # Configuración para bots de buscadores
│   └── sitemap.xml          # Mapa del sitio para SEO
├── src/
│   ├── components/          # Componentes de UI modulares
│   │   ├── Landing.astro    # Estructura y diseño de la página de carga
│   │   ├── Viewer.astro     # Estructura y diseño del visualizador de diapositivas
│   │   └── SEO.astro        # Inyección de metadatos SEO y JSON-LD estructurado
│   ├── layouts/
│   │   └── Layout.astro     # Plantilla HTML global, fuentes y estilos CSS de base
│   ├── lib/                 # Lógica de la aplicación desacoplada (TypeScript)
│   │   ├── app.ts           # Orquestador del ciclo de vida y eventos del DOM
│   │   ├── i18n.ts          # Gestión de traducción del DOM
│   │   ├── pdfPresenter.ts  # Renderizado y transiciones PDF (Lazy load de pdf.js)
│   │   ├── pptxPresenter.ts # Visualizador de PowerPoint (Lazy load de pptx-preview)
│   │   ├── theme.ts         # Control de modo oscuro y modo claro
│   │   ├── translations.ts  # Diccionario de textos bilingües
│   │   └── types.ts         # Definiciones de tipos para robustez
│   └── pages/
│       └── index.astro      # Punto de entrada de la aplicación
├── package.json             # Scripts y dependencias del proyecto
├── astro.config.mjs         # Configuración del compilador y optimización de Vite
├── vercel.json              # Configuración de cabeceras de caché y seguridad para Vercel
└── LICENSE                  # Licencia de código abierto MIT
```

---

## 🚀 Inicio Rápido

Sigue estos pasos para ejecutar el proyecto en tu entorno local:

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/easy-slides.git
cd easy-slides
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Levantar el servidor de desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:4321`.

### 4. Compilar para producción
```bash
npm run build
```
Esto generará los archivos estáticos listos para producción en la carpeta `./dist/`.

---

## ☁️ Despliegue en Vercel

Este proyecto está configurado para desplegarse de manera óptima en **Vercel** como un sitio estático.

### Despliegue Directo
1. Ve al panel de control de Vercel e importa el repositorio.
2. Vercel detectará automáticamente que es un proyecto **Astro** y configurará los comandos de construcción (`npm run build`) y directorio de salida (`dist`).
3. Haz clic en **Deploy**.

### Configuración del Dominio Personalizado `easyslides.irammcfly.dev`
Para asociar tu dominio (`irammcfly.dev`) con el subdominio de EasySlides, realiza las siguientes acciones:

1. **Añadir el Dominio en Vercel:**
   - En tu proyecto de Vercel, ve a **Settings > Domains**.
   - Escribe `easyslides.irammcfly.dev` y haz clic en **Add**.

2. **Configurar DNS (CNAME):**
   - Inicia sesión en tu proveedor de DNS (registrador de tu dominio).
   - Añade un registro con la siguiente configuración:
     - **Tipo:** `CNAME`
     - **Nombre / Host:** `easyslides`
     - **Valor / Destino:** `cname.vercel-dns.com`
     - **TTL:** Automático o 1 hora (3600)
   - Una vez propagado, Vercel aprovisionará automáticamente un certificado SSL gratuito y seguro para tu aplicación.

---

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si deseas mejorar el rendimiento, añadir nuevas funcionalidades o corregir errores, siéntete libre de:

1. Hacer un Fork del proyecto.
2. Crear una rama para tu característica (`git checkout -b feature/nueva-mejora`).
3. Realizar los commits necesarios (`git commit -m 'Añade una nueva mejora'`).
4. Hacer Push a la rama (`git push origin feature/nueva-mejora`).
5. Abrir un Pull Request detallando tus cambios.

---

## 📄 Licencia

Este proyecto está bajo la Licencia **MIT**. Consulta el archivo [LICENSE](file:///Users/iramb/Documents/easy-slides/LICENSE) para obtener más detalles.

---

Desarrollado con ❤️ por [Iram McFly](https://irammcfly.dev).
