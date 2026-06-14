# InnovaTech — Blog de Tecnología, Aviación y Maquinaria

Blog moderno construido con **Next.js 14 (App Router)** que cubre tecnología, aviación y maquinaria, con secciones de afiliados, newsletter y tema claro/oscuro.

## Stack

- Next.js 14 (App Router, React Server Components)
- React 18
- CSS Modules + variables CSS para theming
- `lucide-react` para iconografía
- `next/image` para optimización automática de imágenes

## Estructura

```
app/
├── api/newsletter/      → Endpoint de suscripción
├── article/[slug]/      → Página dinámica por artículo
├── category/[slug]/     → Listado por categoría
├── search/              → Buscador
├── components/          → Navbar, Footer, ArticleCard, ...
├── lib/articles.js      → Fuente de datos central
├── layout.jsx           → Layout raíz + metadata
├── page.jsx             → Home
├── sitemap.js           → Sitemap dinámico
├── robots.js            → robots.txt
├── loading.jsx          → UI de carga
├── error.jsx            → UI de error
└── not-found.jsx        → 404 personalizado
```

## Scripts

```bash
npm run dev      # Desarrollo en http://localhost:3000
npm run build    # Build de producción
npm run start    # Servir build
npm run lint     # ESLint
```

## Configuración

Si quieres conectar el formulario de newsletter a un proveedor real (Mailchimp, Resend, ConvertKit, etc.), edita `app/api/newsletter/route.js` y añade la variable de entorno correspondiente en `.env.local`.

## Disclosure

Algunos enlaces de productos en este sitio son enlaces de afiliado. Si compras a través de ellos, podemos recibir una pequeña comisión sin coste adicional para ti.
