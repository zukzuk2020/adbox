# AdBox

**Time spent:** 4 hours._

Corporate sets how each variable in a marketing asset is filled (from the location's database record, typed in by the location, or locked by corporate). Each location then previews the asset with its own data and types in its local values.

## Run

Requires Docker with Compose.

```bash
docker compose up --build
```

- Location side: http://localhost:5173/local
- Corporate side: http://localhost:5173/corporate
- API: http://localhost:4000/api/v1

Server and client code are mounted into the containers: the server restarts and the client hot-reloads on code changes.

**Data resets on every server container start.** `server/scripts/seed.js` rebuilds `db/data/json` from `db/data/input/locations.json`, `db/assets/images` and `db/assets/templates`, so restarting the server container discards saved field states and values. Code-change reloads do not reseed.

## Layout

- `server/`: Express API. Routes validate with yup and hand off to one middleware per JSON file, each built on `BaseMiddleware` (serialized writes, atomic file replacement).
- `client/`: React (Vite), Redux Toolkit, Flowbite React and Tailwind. Both sides use the same `renderTemplate` to fill the HTML template in the browser and show it in a sandboxed iframe.
- `db/data/input`: provided location data. `db/data/json`: generated storage. `db/assets`: logos and HTML templates, served at `/files/images` and `/files/templates`.
