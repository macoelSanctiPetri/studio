## Despliegue y estado (29/12/2025)

- App: Next.js con `output: 'standalone'`.
- Ruta en servidor: `/httpdocs/app`, inicio: `.next/standalone/server.js`.
- Node en Plesk: 21.7.3 (build manual funciona).
- SMTP vars ya configuradas en Plesk.
- Eliminado Firebase/Genkit y `apphosting.yaml`.
- Añadido `postbuild` que copia estáticos al bundle: `scripts/postbuild-copy.js`.

### Flujo estable de despliegue (manual mientras el hook falla)
1) En Plesk, repositorio Git → **Desplegar ahora** (pull).
2) En “Ejecutar comandos Node.js” (npm, Node 21.7.3):
   - `npm install --prefix /var/www/vhosts/novamvsica.com/httpdocs/app`
   - `npm run build --prefix /var/www/vhosts/novamvsica.com/httpdocs/app`
   (el postbuild copia `public/` y `.next/static/` a `.next/standalone/...`)
3) Panel Node.js: Reiniciar app (inicio `.next/standalone/server.js`).
4) Comprobar web (CSS/imagenes/audios, `/api/photos`, formulario).

### Problema hook automático
- Plesk ejecuta el hook con shims de `~/.nodenv/shims` y no encuentra `node/npm` → “npm: command not found” / “nodenv: node: command not found”.
- Se pidió al hosting (Manuel Ruiz) desactivar nodenv o exponer PATH a `/usr/local/psa/var/modules/nodejs/21/bin` (o 20) para permitir:
  ```
  npm ci --prefix /var/www/vhosts/novamvsica.com/httpdocs/app
  npm run build --prefix /var/www/vhosts/novamvsica.com/httpdocs/app
  ```

### Archivos relevantes
- `package.json` (tiene `postbuild`).
- `scripts/postbuild-copy.js` (copia `public` y `.next/static` al standalone).
- `next.config.ts` (`output: 'standalone'`).

### CI a rama deploy
- Workflow `.github/workflows/deploy.yml`: al hacer push a `main`, construye con Node 21, elimina `node_modules` y `.next/cache`, empaqueta `.next/standalone`, `.next/static`, `public`, `package.json`, `package-lock.json`, `next.config.ts` y publica en la rama `deploy` (force orphan).
- Plesk puede apuntar la rama `deploy` y, tras el pull, solo reiniciar la app (sin `npm install`/`npm run build` en el servidor).

### Limpieza realizada
- Borrado `apphosting.yaml`.
- Quitado Firebase/Genkit del `package.json` y lock.
- Copias manuales de `public/` y `.next/static` ya no necesarias tras el build.

### Pendiente
- Respuesta del hosting para habilitar hook automático sin nodenv.
- Mantener `httpdocs_old` mientras se confirma producción; luego borrar/mover fuera de `httpdocs`.
