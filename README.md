# Fontanelle Map

Mappa interattiva delle fontanelle pubbliche in Italia, costruita con React 19, Leaflet e Tailwind CSS v4.

I dati provengono in tempo reale da **OpenStreetMap** tramite le API Overpass e Nominatim — nessun dataset statico.

## Stack

- **React 19** + **TypeScript** (strict mode)
- **Vite 6** — bundler
- **Leaflet** + **react-leaflet v5** — mappa interattiva
- **leaflet.markercluster** — clustering marker
- **Tailwind CSS v4** — stile utility-first
- **Lucide React** — icone

## Funzionalità

- **Caricamento dinamico** — le fontanelle vengono scaricate da Overpass API in base al viewport della mappa (zoom ≥ 10)
- **Ricerca città** — cerca una città e la mappa si sposta automaticamente (Nominatim)
- **Geolocalizzazione** — GPS con volo animato alla posizione e reverse geocoding dell'indirizzo
- **Indicazioni** — link diretto a Google Maps (a piedi) dalla posizione corrente alla fontanella
- **Clustering marker** — raggruppamento automatico a zoom basso
- **Filtri per stato** — attiva / inattiva / sconosciuta
- **BottomSheet** — pannello inferiore drag & drop con stato collapse/expand
- **Dati OSM ricchi** — nome, operatore, descrizione estratti dai tag OSM

## Requisiti

- Node.js 20+
- npm 10+

## Setup

```bash
npm install
npm run dev
```

Nessuna variabile d'ambiente richiesta — i dati vengono scaricati direttamente da OpenStreetMap.

## Script

```bash
npm run dev        # Server di sviluppo (http://localhost:5173)
npm run build      # Build produzione
npm run preview    # Anteprima build locale
npm run typecheck  # Verifica TypeScript
npm run lint       # Linting ESLint
npm test           # Test unitari (Vitest)
```

## Struttura

```
src/
├── components/
│   ├── ui/                   # Badge, Button, Skeleton, Alert, ScrollArea
│   ├── MapView/              # Mappa Leaflet + BoundsTracker + MapInstanceSetter
│   ├── FountainMarker/       # Marker L.divIcon per fontanelle
│   ├── UserLocationMarker/   # Marker posizione utente (punto blu)
│   ├── FountainCard/         # Dettaglio fontanella + reverse geocoding + link Maps
│   ├── BottomSheet/          # Pannello inferiore drag & drop (pointer events)
│   ├── FilterChips/          # Filtro per stato fontanella
│   ├── FountainList/         # Lista accessibile delle fontanelle
│   ├── CitySearch/           # Ricerca città con autocomplete Nominatim
│   └── Header/               # Intestazione flottante + GPS + indirizzo utente
├── hooks/
│   ├── useFountains.ts           # Tipi condivisi (UseFountainsResult)
│   ├── useFountainsByBounds.ts   # Fetch Overpass API per viewport
│   ├── useNominatim.ts           # Ricerca città (autocomplete)
│   ├── useReverseGeocode.ts      # Indirizzo da coordinate (Nominatim)
│   ├── useDistance.ts            # Ordinamento per distanza
│   └── useGeolocation.ts         # (legacy, sostituito da GeolocationContext)
├── contexts/
│   └── GeolocationContext.tsx    # GPS state globale
├── types/
│   ├── fountain.ts               # Fountain, FilterOption
│   └── overpass.ts               # OverpassElement, OverpassResponse
├── utils/
│   ├── haversine.ts              # Calcolo distanza geografica
│   ├── distance.ts               # Formattazione distanza
│   ├── normalize.ts              # (legacy GeoJSON)
│   └── normalizeOverpass.ts      # OverpassElement → Fountain
└── lib/
    └── leaflet.ts                # Configurazione Leaflet
```

## Sorgenti dati

| Servizio | Utilizzo |
|---|---|
| [Overpass API](https://overpass-api.de) | Fontanelle (`amenity=drinking_water`, `man_made=water_tap`) per viewport |
| [Nominatim](https://nominatim.openstreetmap.org) | Ricerca città + reverse geocoding indirizzi |

Entrambi i servizi sono gratuiti e non richiedono API key. Rispettare la [usage policy di Nominatim](https://operations.osmfoundation.org/policies/nominatim/).

## Deploy

Il progetto è configurato per Netlify con deploy automatico dal branch `main`:

```bash
npm run build   # build → dist/
# push su main → Netlify deploya automaticamente
```

Il file `netlify.toml` gestisce i redirect SPA.

## Accessibilità

- WCAG 2.1 Level A
- Mappa con `aria-hidden="true"` — contenuto accessibile via lista fontanelle
- Skip link "Vai alla lista delle fontanelle"
- `aria-live="polite"` sulla lista per aggiornamenti dinamici
- Focus ring consistente su tutti gli elementi interattivi
