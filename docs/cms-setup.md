# Configurar Decap + GitHub en Cloudflare Pages (una vez)

## 1. Aplicación OAuth en GitHub

1. **GitHub** → **Settings** (tu cuenta) → **Developer settings** → **OAuth Apps** → **New OAuth App**.
2. Rellená:
   - **Application name**: p. ej. `CSS Store Decap`.
   - **Homepage URL**: `https://css-store.uy`
   - **Authorization callback URL**: `https://css-store.uy/api/callback` (debe ser exactamente el callback que usa [functions/api/callback.ts](../functions/api/callback.ts)).
3. Tras crearla: copiá el **Client ID** y generá un **Client secret**.

## 2. Variables en Cloudflare Pages

En el proyecto de Pages: **Settings** → **Environment variables** (y para **Preview** y **Production** según toques):

| Variable | Tipo | Valor |
|----------|------|--------|
| `GITHUB_CLIENT_ID` | Secret o plain | Client ID de la OAuth app |
| `GITHUB_CLIENT_SECRET` | Secret | Client secret |

Los nombres **deben** coincidir; el código de `functions/api/` lee esos nombres.

> Si esas variables no existen, `/api/auth` o `/api/callback` responden error. El sitio estático sigue funcionando; solo falla el login del CMS.

## 3. Comprobar

1. Despliegue publicado: abrí `https://css-store.uy/admin/`
2. **Login with GitHub** → autorizar → debería volver al admin sin error.

## 4. Dónde poner el feed (Google / Meta)

- **Google Merchant Center**: añadí o editá un feed de “Primary feed” o similar y URL de **descarga** `https://css-store.uy/feed/google-merchant.xml`. Programá la frecuencia que quieras (cada despliegue o cambio en el repo vuelve a generar el XML al hacer build).
- **Meta (Commerce / Catalog)**: añadí un feed con URL `https://css-store.uy/feed/meta-catalog.xml` (Misma idea: RSS/Atom con atributos `g:`; Meta documenta aceptar este estilo con namespace de Google).

> Los feeds son **artefactos del build** (Astro). Si cambiás un producto en el CMS, hace falta un commit + build (flujo automático con Pages al pushear).

## 5. Ajuste de imágenes en el CMS (Decap)

- En [public/admin/config.yml](../public/admin/config.yml) las imágenes de producto van a `src/assets/images/products/`.
- Después de subir imágenes nuevas, asegurá de que el **repositorio** tenga el commit; Cloudflare hace el build y Astro optimiza las imágenes.

## 6. (Opcional) `npm run cms:local` en el ordenador

No es obligatorio. Sirve para que Decap, en `localhost`, use un backend de archivos y no GitHub. No se sube a producción. Ver [README](README.md).
