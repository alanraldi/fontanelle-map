# Fontanelle Map

Mappa interattiva delle fontanelle pubbliche in Italia, costruita con React 19, Leaflet e Tailwind CSS v4.

## Stack

- **React 19** + **TypeScript** (strict mode)
- **Vite 6** — bundler
- **Leaflet** + **react-leaflet v5** — mappa interattiva
- **leaflet.markercluster** — clustering marker
- **Tailwind CSS v4** — stile utility-first
- **Lucide React** — icone

## Requisiti

- Node.js 20+
- npm 10+

## Setup

```bash
# Clone e installa dipendenze
npm install

# Copia il file di configurazione
cp .env.example .env

# Modifica .env con l'URL del dataset GeoJSON
# VITE_GEOJSON_URL=https://...

# Avvia in sviluppo
npm run dev
```

## Variabili d'ambiente

| Variabile | Descrizione | Obbligatoria |
|---|---|---|
| `VITE_GEOJSON_URL` | URL del dataset GeoJSON pubblico delle fontanelle | Sì |

## Script

```bash
npm run dev        # Server di sviluppo
npm run build      # Build produzione
npm run preview    # Anteprima build locale
npm run typecheck  # Verifica TypeScript
npm run lint       # Linting
npm test           # Test (watch mode)
```

## Struttura

```
src/
├── components/
│   ├── ui/           # Badge, Button, Card, Skeleton, Alert
│   ├── MapView/      # Mappa Leaflet con clustering
│   ├── FountainMarker/  # Marker L.divIcon per fontanelle
│   ├── UserLocationMarker/  # Marker posizione utente
│   ├── FountainCard/ # Dettaglio fontanella selezionata
│   ├── BottomSheet/  # Pannello inferiore con snap points
│   ├── FilterChips/  # Filtro per stato fontanella
│   ├── FountainList/ # Lista accessibile delle fontanelle
│   └── Header/       # Intestazione flottante
├── hooks/
│   ├── useFountains.ts  # Fetch dati GeoJSON
│   ├── useGeolocation.ts  # Geolocalizzazione
│   └── useDistance.ts   # Calcolo distanze
├── contexts/
│   └── GeolocationContext.tsx
├── types/
│   ├── fountain.ts
│   └── geojson.ts
├── utils/
│   ├── haversine.ts  # Calcolo distanza geografica
│   ├── distance.ts   # Ordinamento e formattazione
│   └── normalize.ts  # Normalizzazione GeoJSON
└── lib/
    └── leaflet.ts    # Configurazione Leaflet
```

## Dataset GeoJSON

Il dataset deve essere un GeoJSON `FeatureCollection` con feature di tipo `Point`. Le proprietà supportate per la normalizzazione:

- **ID**: `id`, `fid`, `objectid`
- **Indirizzo**: `address`, `indirizzo`, `via`, `name`
- **Città**: `city`, `comune`
- **Stato**: `stato_funzionamento`, `stato`, `status`, `attivo`

## Deploy

Il progetto è configurato per Netlify:

```bash
npm run build
# dist/ → deploy su Netlify
```

Il file `netlify.toml` è già configurato con redirect SPA.

## Accessibilità

- WCAG 2.1 Level A
- Mappa con `aria-hidden="true"` — contenuto accessibile via lista fontanelle
- Skip link "Vai alla lista delle fontanelle"
- `aria-live="polite"` sulla lista per aggiornamenti dinamici
- Focus ring consistente su tutti gli elementi interattivi
