# Example Server

A minimal HTTP example demonstrating how to use **proactive-deps** to monitor an external REST API (PokeAPI).

## Features
- Periodic dependency check of the public https://pokeapi.co API (registered as `PokeAPI`).
- Simple Pokémon data endpoint: `GET /pokemon/:name`.
- Dependency status endpoint: `GET /dependencies`.
- Prometheus metrics endpoint: `GET /metrics` (includes latency and health gauges + default Node metrics).

## Run Locally
```bash
npm install
npm run build   # builds proactive-deps so example can import the dist output
node example/server.js
```

Then in another shell:
```bash
curl http://localhost:3000/pokemon/ditto
curl http://localhost:3000/dependencies
curl http://localhost:3000/metrics
```

## Notes
- The example avoids Express to keep it lightweight.
- If you modify library source while the server runs, rebuild to reflect changes.
- The dependency monitor caches results for 30s and refreshes every 10s in this demo.
