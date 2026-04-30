# Vercel Daily

A fictional news publication built for the Vercel Partner Certification take-home assignment. The goal is to demonstrate fluent use of the Next.js 16 + React 19 App Router feature set against a real external API.

> Este README está disponible en [Español](#vercel-daily-es) más abajo.

---

## What this project demonstrates

- **`"use cache"` directive** with `cacheLife()` / `cacheTag()` / `revalidateTag()`
- **Suspense-based streaming** for the breaking news banner, trending sidebar, and header subscription status
- **Server Actions** with `useActionState` for the subscription flow
- **`proxy.ts`** (the Next.js 16 rename of `middleware.ts`, Node.js runtime)
- **Async `searchParams` / `cookies()` / `headers()`**
- **Cache Components** enabled (`cacheComponents: true`)
- **Dynamic Open Graph image** via `app/opengraph-image.tsx` (`next/og` `ImageResponse`)
- **Partial Prerendering** — the static shell ships as HTML, dynamic regions (header sub state, breaking banner, trending sidebar, footer year) stream in

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.2 (App Router, Turbopack) |
| React | 19.2 |
| Styling | Tailwind CSS v4 + shadcn/ui (Radix) |
| Runtime | Node.js 20+ |
| Package manager | pnpm |
| Deploy target | Vercel |

## Project structure

```
src/
├── proxy.ts                         # Node.js proxy; hypothetical private-route gate
├── app/
│   ├── layout.tsx                   # Root metadata + OG defaults + footer + header shell
│   ├── page.tsx                     # Home: breaking banner + editorial hero + masonry block + 6-article grid
│   ├── loading.tsx                  # Home skeleton
│   ├── error.tsx                    # Root error boundary
│   ├── opengraph-image.tsx          # Dynamic 1200x630 OG via ImageResponse
│   ├── actions/
│   │   └── subscription.ts          # "use server" — subscribe / unsubscribe
│   ├── articles/[slug]/
│   │   ├── page.tsx                 # ArticleGate (Suspense) → Paywall or full article
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   └── not-found.tsx
│   └── search/
│       ├── page.tsx                 # async searchParams + Suspense keyed results
│       └── loading.tsx
├── components/
│   ├── header.tsx                   # Server; streams subscription status via Suspense
│   ├── subscribe-button.tsx         # "use client"; useActionState
│   ├── hero.tsx                     # Full-width editorial heading + lead article below
│   ├── breaking-banner.tsx          # Single item from /breaking-news; accent bar signals urgency
│   ├── article-card.tsx             # Category + publish date + read time + author
│   ├── trending-sidebar.tsx         # 3-4 cached trending mini cards
│   ├── article-content.tsx          # Renders 6 ContentBlock types
│   ├── paywall.tsx                  # Headline + image + first paragraph + CTA
│   ├── search-form.tsx              # "use client"; debounced auto-search + select
│   ├── footer-year.tsx              # Server; "use cache" cacheLife('days')
│   └── ui/                          # shadcn primitives
└── lib/
    ├── api/
    │   └── client.ts                # Fetch adapter — bypass header, envelope, 404→null
    ├── data/
    │   ├── articles.ts              # getFeatured / getArticle / getTrending / getBreaking / searchArticles
    │   ├── categories.ts            # getCategories (cached days)
    │   ├── subscription.ts          # getSubscription / getSubscriptionStatus (cached 30s)
    │   └── types.ts
    ├── session-cookie.ts            # Shared cookie name for session helpers + proxy demo
    ├── session.ts                   # Cookie helpers — stores anon token, isSubscribed()
    └── utils/
        └── read-minutes.ts          # readMinutes(blocks) + firstParagraph(blocks)
```

## Key design decisions

### Caching with `"use cache"`

Every read from the external API lives in `src/lib/data/*` and starts with `"use cache"`. The `cacheLife` preset matches how volatile the data is:

| Fetcher | Preset | Tag |
|---|---|---|
| `getFeaturedArticles` | `hours` | `articles` |
| `getArticle(slug)` | `days` | `articles`, `article:${slug}` |
| `getArticleSlugById(id)` | `days` | `articles`, `article-id:${id}` |
| `getTrending` | `{stale:300, revalidate:300, expire:86400}` | `trending` |
| `getBreaking` | `{stale:300, revalidate:300, expire:86400}` | `breaking` |
| `getCategories` | `days` | `categories` |
| `getSubscription(token)` | `{stale:30, revalidate:30, expire:60}` | `subscription:${token}` |
| `listArticlesPage` | (uncached — paginated default listing) | n/a |
| `searchArticles` | (uncached — per-query dynamic) | n/a |

Trending, breaking news, and subscription use short custom lifetimes: trending because the API returns fresh random picks per request, so the app caches one shared trending set for five minutes to keep article-to-article navigation stable; breaking news to avoid a live API call on every home view while staying near-fresh; subscription because it has to reflect the user's real server-side state without round-tripping every page view.

#### Two-layer caching strategy

`"use cache"` alone is in-memory LRU — it does not survive a cold start or a new serverless instance on Vercel. To get durable caching across instances, fetch calls also set `next: { revalidate, tags }` which writes to Next.js's filesystem-backed Data Cache:

| Fetch | `next.revalidate` |
|---|---|
| `/articles/trending` | 300 s |
| `/breaking-news` | 300 s |
| `/articles/:param` | 86400 s |

Warm instance → `"use cache"` hit, fetch never runs. Cold start → `"use cache"` miss → fetch runs → Data Cache hit, API not called. Both layers share the same tag names so `updateTag()` purges both at once.

### `proxy.ts`

Next.js 16 renamed `middleware.ts` → `proxy.ts`. The file still runs at the network boundary, now exclusively on the Node.js runtime. In this project it is intentionally scoped to hypothetical private routes: the article paywall does **not** need a hard gate, because non-subscribers should still reach article pages and see the headline, image, teaser, and inline subscribe CTA.

A real use case for Proxy would be a route that must not render at all without a session, such as `/account`, `/billing`, or a private downloads area. The matcher is scoped to `/account/:path*` and `/billing/:path*`; if the `vd_session` cookie is missing, Proxy redirects to `/` where the subscribe CTA exists. This is only an optimistic boundary check: a real private page should still validate the active subscription server-side. Vercel Daily does not currently define those private routes, and article routes are deliberately excluded because adding Proxy headers to the subscription flow only adds complexity without improving the demo.

### Subscription flow

The API owns subscription state; the client only stores the anonymous token.

1. **Subscribe click** → Server Action reads cookie → if missing, `POST /subscription/create` (the API returns the UUID in the `x-subscription-token` response header) → cookie set → `POST /subscription` activates → `revalidateTag('subscription:${token}', 'max')` + `revalidatePath('/', 'layout')`.
2. **Unsubscribe click** → `DELETE /subscription` → same revalidation → cookie deleted. This keeps the browser in a clean anonymous state and lets the Proxy demo treat missing `vd_session` as "not signed in" for hypothetical private routes.
3. **Expiry fallback** — tokens expire after 24h of inactivity. If `POST /subscription` returns 404, the action transparently creates a new subscription and retries.

`isSubscribed()` reads the cookie outside the cached scope, then calls `getSubscriptionStatus(token)` which is `"use cache"` keyed by token. A short 30s window keeps the UI snappy without letting state drift.

> The cookie holds the opaque API token directly (no JWT). The API already validates the token server-side, so signing locally adds no real security — just overhead.

### Server/client boundaries

Only three client components:

- `subscribe-button.tsx` — needs `useActionState` + pending state.
- `search-form.tsx` — debounced input + select + `useTransition`.
- shadcn primitives that ship with `"use client"`.

Everything else is a server component. Subscription status in the header reads `cookies()` server-side and streams via Suspense — no hydration flicker.

### Paywall + streaming on article pages

The article route (`/articles/[slug]`) is dynamic because it reads `cookies()` via `isSubscribed()`. To avoid blocking the entire render on the subscription check, the page uses a dedicated `ArticleGate` Server Component wrapped in `<Suspense>`:

1. `ArticlePage` resolves `getArticle(slug)` — cached, fast — then immediately flushes the page grid with a skeleton fallback.
2. `ArticleGate` resolves `isSubscribed()` (cookie read + short-cached API call) asynchronously. When it resolves it replaces the skeleton with either `<Paywall>` or the full article body.
3. `TrendingSidebar` streams in its own independent `<Suspense>` — it does not wait for the subscription check.

Non-subscribers get `<Paywall article={...} />` which renders headline + image + first paragraph only — the full `ContentBlock[]` body **never reaches the client HTML**. Subscribers get `<ArticleContent>` plus the trending sidebar.

### Search

- `<form method="get" action="/search">` so JS-off and share-URL paths work natively.
- When JS is live, the form uses `router.replace()` wrapped in `useTransition` — the URL updates without a full reload, the pending state drives an inline spinner.
- Auto-search fires 400 ms after the last keystroke when the trimmed query length is `0` or `≥ 3` — exactly what the spec asks for.
- Category select submits on every change.
- Both `q` and `category` live in the URL — refresh, share, back-button all work.
- With no filters, `/search` lists all articles in paginated pages of 9 using the API pagination metadata.
- Filtered results are capped at `limit=5`.
- `<Suspense key={\`${q}|${category}|${page}\`}>` forces the results to remount on filter or page changes so the skeleton shows.

### Open Graph

- Root `layout.tsx` defines site-wide OG defaults (title, description, siteName, Twitter card).
- `src/app/opengraph-image.tsx` generates a dynamic 1200×630 PNG via `next/og` — no static asset to maintain.
- Article pages override via `generateMetadata` with `og:type=article`, the article image as `og:image`, `publishedTime`, `authors`, `tags`.

### Cache Components caveats we hit

- `cacheComponents: true` makes pages dynamic by default; any uncached read at request-time must live under a `<Suspense>` boundary. That's why the footer year is `<Suspense>`-wrapped and the header subscription status has its own Suspense inside the header.
- Inside a `"use cache"` scope you can't call `cookies()` / `headers()` / read `searchParams` directly — read them outside and pass values as arguments. The session token for `getSubscription(token)` follows this pattern.

## Getting started

Requirements: Node 20+, pnpm 10+.

```bash
pnpm install
cp .env.example .env.local
# fill in NEWS_API_BYPASS_TOKEN with the token provided for the assignment
pnpm dev
```

Open <http://localhost:3000>.

### Environment variables

| Name | Purpose |
|---|---|
| `NEWS_API_BASE_URL` | Base URL of the Vercel Daily News API |
| `NEWS_API_BYPASS_TOKEN` | Vercel Deployment Protection bypass token for the API |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL — used by `metadataBase` and OG tags. Point this at the deployed domain in production. |

## Scripts

- `pnpm dev` — Turbopack dev server on `:3000`
- `pnpm build` — production build
- `pnpm start` — serve the production build
- `pnpm lint` — ESLint

## Deploying to Vercel

1. Create a GitHub repository and push this project.
2. `vercel link` to associate the local directory with a new Vercel project.
3. In the Vercel dashboard, add the three environment variables listed above. Set `NEXT_PUBLIC_SITE_URL` to the production domain (e.g. `https://vercel-daily.vercel.app`).
4. `vercel --prod` (or let the GitHub integration deploy on push).

## Known trade-offs

- **Trending changes between navigations** in the first cold-start request per serverless instance; after that, the Data Cache (`next: { revalidate: 300 }`) keeps the same set for 5 minutes across all instances.
- **No token reuse on unsubscribe**: the cookie is deleted so the next Subscribe creates a fresh anonymous token.
- **Proxy is scoped to hypothetical private routes**. It checks for `vd_session` on `/account` and `/billing`, but article pages remain reachable so they can show an inline paywall.
- **No dynamic OG per article**. Article OG uses the article's own hero image — cheaper than generating per-article PNGs and still produces a distinct preview per URL.

---

<a id="vercel-daily-es"></a>

# Vercel Daily (ES)

Publicación de noticias ficticia hecha para la prueba técnica de la Vercel Partner Certification. El objetivo es demostrar dominio del conjunto de características de Next.js 16 + React 19 (App Router) consumiendo una API externa real.

## Qué demuestra este proyecto

- **Directiva `"use cache"`** con `cacheLife()` / `cacheTag()` / `revalidateTag()`
- **Streaming con Suspense** en banner de breaking news, sidebar de trending y estado de suscripción en el header
- **Server Actions** con `useActionState` para subscribe/unsubscribe
- **`proxy.ts`** (el rename de `middleware.ts` en Next.js 16, runtime Node.js)
- **`searchParams` / `cookies()` / `headers()` asíncronos**
- **Cache Components** activado (`cacheComponents: true`)
- **Open Graph dinámico** vía `app/opengraph-image.tsx` (`next/og` `ImageResponse`)
- **Partial Prerendering** — la cáscara estática va como HTML y las regiones dinámicas llegan por streaming

## Stack

| Capa | Elección |
|---|---|
| Framework | Next.js 16.2 (App Router, Turbopack) |
| React | 19.2 |
| Estilos | Tailwind CSS v4 + shadcn/ui (Radix) |
| Runtime | Node.js 20+ |
| Gestor paquetes | pnpm |
| Despliegue | Vercel |

## Decisiones clave

### Caché con `"use cache"`

Toda lectura a la API vive en `src/lib/data/*` y empieza con `"use cache"`. El preset de `cacheLife` se ajusta a cuán volátil es el dato:

| Función | Preset | Tag |
|---|---|---|
| `getFeaturedArticles` | `hours` | `articles` |
| `getArticle(slug)` | `days` | `articles`, `article:${slug}` |
| `getArticleSlugById(id)` | `days` | `articles`, `article-id:${id}` |
| `getTrending` | `{stale:300, revalidate:300, expire:86400}` | `trending` |
| `getBreaking` | `{stale:300, revalidate:300, expire:86400}` | `breaking` |
| `getCategories` | `days` | `categories` |
| `getSubscription(token)` | `{stale:30, revalidate:30, expire:60}` | `subscription:${token}` |
| `listArticlesPage` | (sin caché — listado paginado por defecto) | n/a |
| `searchArticles` | (sin caché — dinámico por query) | n/a |

Trending, breaking news y subscription usan TTL corto a propósito: trending porque la API devuelve aleatorios por request, así que la app cachea una única lista compartida durante cinco minutos para mantener estable la navegación entre artículos; breaking news para evitar una llamada viva a la API en cada visita a home manteniéndose casi fresco; subscription porque debe reflejar el estado real del servidor sin pegar en cada navegación.

#### Estrategia de caché en dos capas

`"use cache"` solo es LRU in-memory — no sobrevive cold starts ni instancias serverless distintas en Vercel. Para durabilidad entre instancias, los fetch calls también usan `next: { revalidate, tags }`, que escribe en el Data Cache de Next.js (filesystem-backed):

| Fetch | `next.revalidate` |
|---|---|
| `/articles/trending` | 300 s |
| `/breaking-news` | 300 s |
| `/articles/:param` | 86400 s |

Instancia caliente → hit de `"use cache"`, el fetch no llega a ejecutarse. Cold start → miss de `"use cache"` → fetch ejecuta → hit del Data Cache, la API no se llama. Ambas capas comparten los mismos nombres de tag para que `updateTag()` invalide las dos a la vez.

### `proxy.ts`

Next.js 16 renombró `middleware.ts` → `proxy.ts`. Sigue ejecutándose en el límite de red, ahora exclusivamente en runtime Node.js. En este proyecto está limitado a rutas privadas hipotéticas: el requisito de paywall de artículos **no** necesita un corte duro, porque los no suscritos deben poder llegar a la página del artículo y ver headline, imagen, teaser y CTA inline.

Un caso real para Proxy sería una ruta que no debe renderizar nada sin sesión, como `/account`, `/billing` o una zona privada de descargas. El matcher está limitado a `/account/:path*` y `/billing/:path*`; si falta la cookie `vd_session`, Proxy redirige a `/`, donde existe el CTA para suscribirse. Esto es solo un boundary optimista: una página privada real debería seguir validando la suscripción activa en servidor. Vercel Daily no define esas rutas privadas actualmente, y las rutas de artículos quedan excluidas a propósito porque meter headers de Proxy en el flujo de suscripción añade complejidad sin mejorar la demo.

### Flujo de suscripción

La API es dueña del estado; el cliente solo guarda el token anónimo.

1. **Subscribe** → Server Action lee cookie → si falta, `POST /subscription/create` (la API devuelve el UUID en el header `x-subscription-token`) → cookie seteada → `POST /subscription` activa → `revalidateTag('subscription:${token}', 'max')` + `revalidatePath('/', 'layout')`.
2. **Unsubscribe** → `DELETE /subscription` → misma revalidación → cookie eliminada. Esto deja el navegador en estado anónimo limpio y permite que la demo de Proxy trate la ausencia de `vd_session` como "no logueado" para rutas privadas hipotéticas.
3. **Fallback por expiración** — los tokens expiran tras 24 h de inactividad. Si `POST /subscription` devuelve 404, la acción crea uno nuevo y reintenta de forma transparente.

`isSubscribed()` lee la cookie fuera del scope cacheado y llama a `getSubscriptionStatus(token)`, que sí es `"use cache"` keyed por token. Una ventana de 30 s mantiene la UI fluida sin que el estado derive.

> La cookie guarda el token de API directamente (sin JWT). La API ya valida el token en servidor; firmar localmente no aporta seguridad real, solo latencia.

### Fronteras server/client

Solo tres componentes cliente:

- `subscribe-button.tsx` — necesita `useActionState` + pending state.
- `search-form.tsx` — input con debounce, select y `useTransition`.
- primitivas de shadcn que ya vienen con `"use client"`.

Todo lo demás es server component. El estado de suscripción en el header lee `cookies()` en el servidor y fluye por Suspense — sin parpadeo de hidratación.

### Paywall + streaming en páginas de artículo

La ruta `/articles/[slug]` es dinámica porque lee `cookies()` vía `isSubscribed()`. Para no bloquear el render completo en el chequeo de suscripción, la página usa un Server Component dedicado `ArticleGate` envuelto en `<Suspense>`:

1. `ArticlePage` resuelve `getArticle(slug)` — cacheado, rápido — y flushea el grid con un skeleton inmediatamente.
2. `ArticleGate` resuelve `isSubscribed()` (lectura de cookie + llamada API con caché corta) de forma asíncrona. Al resolverse, reemplaza el skeleton con `<Paywall>` o el artículo completo.
3. `TrendingSidebar` hace streaming en su propio `<Suspense>` independiente — no espera al chequeo de suscripción.

Los no-suscritos reciben `<Paywall article={...} />` con headline + imagen + primer párrafo. **El body completo (`ContentBlock[]`) nunca llega al HTML del cliente**. Los suscritos ven `<ArticleContent>` completo más el trending sidebar.

### Search

- `<form method="get" action="/search">` para que funcione con JS apagado y al compartir la URL.
- Con JS, el form usa `router.replace()` dentro de `useTransition` — la URL cambia sin recarga completa y el pending anima un spinner inline.
- La búsqueda automática se dispara 400 ms tras la última tecla cuando el texto recortado tiene longitud `0` o `≥ 3` — exactamente lo que pide el spec.
- El `<select>` envía al cambiar.
- `q` y `category` viven en la URL — refresh, compartir y botón atrás respetan el estado.
- Sin filtros, `/search` lista todos los artículos en páginas de 9 usando la metadata de paginación de la API.
- Resultados filtrados limitados a `limit=5`.
- `<Suspense key={\`${q}|${category}|${page}\`}>` fuerza re-mount del bloque de resultados en cambios de filtro o página para mostrar el skeleton.

### Open Graph

- `layout.tsx` define defaults (title, description, siteName, Twitter card).
- `src/app/opengraph-image.tsx` genera el PNG 1200×630 en runtime vía `next/og` — sin assets estáticos que mantener.
- Las páginas de artículo sobreescriben con `generateMetadata`: `og:type=article`, imagen del artículo como `og:image`, `publishedTime`, `authors`, `tags`.

### Caveats de Cache Components

- `cacheComponents: true` hace que las páginas sean dinámicas por defecto; cualquier lectura no cacheada en request-time debe vivir bajo un `<Suspense>`. De ahí que el año del footer y el estado de suscripción del header estén envueltos.
- Dentro de un scope `"use cache"` no se puede llamar a `cookies()` / `headers()` ni leer `searchParams` — hay que leerlos fuera y pasar los valores como argumentos. El token de sesión para `getSubscription(token)` sigue ese patrón.

## Puesta en marcha

Requisitos: Node 20+, pnpm 10+.

```bash
pnpm install
cp .env.example .env.local
# rellena NEWS_API_BYPASS_TOKEN con el token proporcionado
pnpm dev
```

Abrir <http://localhost:3000>.

### Variables de entorno

| Nombre | Propósito |
|---|---|
| `NEWS_API_BASE_URL` | URL base de la Vercel Daily News API |
| `NEWS_API_BYPASS_TOKEN` | Token de bypass de Vercel Deployment Protection |
| `NEXT_PUBLIC_SITE_URL` | URL canónica — usada por `metadataBase` y OG. En producción, apunta al dominio desplegado. |

## Scripts

- `pnpm dev` — dev server Turbopack en `:3000`
- `pnpm build` — build de producción
- `pnpm start` — sirve el build
- `pnpm lint` — ESLint

## Despliegue en Vercel

1. Crear repositorio en GitHub y hacer push.
2. `vercel link` para asociar el directorio con un proyecto nuevo en Vercel.
3. En el dashboard de Vercel, añadir las tres variables de entorno. `NEXT_PUBLIC_SITE_URL` al dominio de producción.
4. `vercel --prod` (o dejar que la integración de GitHub despliegue en cada push).

## Trade-offs conocidos

- **Trending cambia solo en el primer cold-start** de cada instancia serverless; después, el Data Cache (`next: { revalidate: 300 }`) mantiene el mismo set 5 minutos en todas las instancias.
- **Sin reutilización de token al desuscribirse**: la cookie se elimina para que el próximo Subscribe cree un token anónimo nuevo.
- **Proxy limitado a rutas privadas hipotéticas**. Comprueba `vd_session` en `/account` y `/billing`, pero los artículos siguen siendo accesibles para mostrar el paywall inline.
- **No hay OG dinámico por artículo**. El OG de artículo usa la imagen hero del propio artículo — más barato que generar PNG por URL y sigue siendo único por URL.
