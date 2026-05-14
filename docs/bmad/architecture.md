---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments: ["docs/bmad/product-brief-fontanelle-map.md", "docs/bmad/prd.md", "docs/bmad/ux-design-specification.md"]
workflowType: architecture
lastStep: 8
status: complete
completedAt: "2026-05-14"
project_name: Fontanelle Map
user_name: Alan
date: "2026-05-14"
---

# Architecture Decision Document — Fontanelle Map

_Este documento é construído colaborativamente passo a passo. As seções são adicionadas conforme avançamos nas decisões arquiteturais._

---

## Análise de Contexto do Projeto

### Visão Geral dos Requisitos

**Requisitos Funcionais:**
32 FRs em 7 áreas: mapa e visualização (FR1–5), geolocalização e proximidade (FR6–10), descoberta e filtro (FR11–14), informação da fonte (FR15–20), dados e integração (FR21–24), acessibilidade (FR25–30), SEO e distribuição (FR31–32).

**Requisitos Não-Funcionais com impacto arquitetural:**

| NFR | Requisito | Decisão arquitetural |
|---|---|---|
| NFR1 | Mapa < 3s em 3G | Lazy load do Leaflet; bundle ≤ 500KB |
| NFR2 | Interações < 100ms | Estado local — sem round-trip de rede |
| NFR3 | Distância < 500ms após GPS | Haversine client-side O(n) |
| NFR4 | Bundle ≤ 500KB gzip | Tree-shaking agressivo; import direto |
| NFR5 | Lighthouse ≥ 80 | Code splitting; critical CSS inline |
| NFR13 | Fetch HTTPS + timeout 10s | AbortController em todo fetch |
| NFR14 | URL GeoJSON via env var | `VITE_GEOJSON_URL` no build |
| NFR15 | GeoJSON Feature Collection Point | Interface TypeScript `Fountain` |
| NFR16 | TypeScript strict | `tsc --noEmit` sem erros |

**Escala e Complexidade:**
- Complexidade: **Baixa** — 1 fonte de dados, 1 API de browser, estado local simples
- Domínio primário: **Web SPA frontend-only**
- Componentes arquiteturais estimados: ~8

### Constraints e Dependências Técnicas

| Constraint | Origem | Impacto |
|---|---|---|
| Bundle ≤ 500KB gzip | NFR4 | Leaflet lazy load; shadcn tree-shaken |
| TypeScript strict | NFR16 | Tipos explícitos em todos os módulos |
| URL GeoJSON via env var | NFR14 | `VITE_GEOJSON_URL` no build Vite |
| Fetch timeout 10s | NFR13 | AbortController em todo fetch |
| iOS Safari + Android Chrome | FR30 | `100dvh`, safe-area, touch-action |
| Deploy 100% estático | FR32 | Sem SSR, sem funções serverless |
| WCAG 2.1 Nível A | NFR7 | aria-live, lista espelho para Leaflet |

### Cross-Cutting Concerns Identificados

1. **Error handling** — fetch do GeoJSON + GPS negado + dados inválidos — nunca falha silenciosamente
2. **TypeScript types** — `Fountain`, `GeoJSONFeatureCollection`, `UserLocation` como contratos entre módulos
3. **Environment variables** — `VITE_GEOJSON_URL` (prefixo `VITE_` obrigatório para exposição no cliente)
4. **Responsividade** — breakpoints `md` (768px) e `lg` (1280px) como constantes compartilhadas
5. **Acessibilidade dinâmica** — `aria-live` em estados de loading/erro/reordenação; lista espelho para o mapa Leaflet (não navegável por teclado nativamente)

---

## Avaliação do Starter Template

### Domínio Primário

Web SPA — frontend-only, sem backend. Stack decidida nas fases anteriores: Vite + React + TypeScript.

### Starter Selecionado: `npm create vite@latest -- --template react-ts`

**Rationale:** Starter oficial mínimo com React 19, TypeScript strict, ESLint e Vite 6. Tailwind v4 e shadcn/ui instalados manualmente para controle total da configuração. Community starters descartados por incluírem dependências desnecessárias; create-t3-app descartado por ser full-stack.

**Comando de inicialização:**

```bash
npm create vite@latest fontanelle-map -- --template react-ts
cd fontanelle-map
npm install
```

**Setup pós-init:**

```bash
# Tailwind CSS v4
npm install tailwindcss @tailwindcss/vite

# shadcn/ui
npx shadcn@latest init

# Leaflet + react-leaflet v5 (requer React 19)
npm install leaflet react-leaflet
npm install -D @types/leaflet

# Leaflet MarkerCluster
npm install leaflet.markercluster
npm install -D @types/leaflet.markercluster
```

**Decisões arquiteturais fornecidas pelo starter:**

| Área | Decisão |
|---|---|
| Linguagem | TypeScript com `tsconfig.app.json` + `tsconfig.node.json` |
| Runtime | React 19 com hooks; sem class components |
| Build | Vite 6 com HMR e code splitting automático |
| Linting | ESLint com regras React + TypeScript |
| Estrutura | `src/`, `public/`, `index.html` na raiz |
| Entry point | `src/main.tsx` → `src/App.tsx` |

**Nota:** A inicialização do projeto com este comando é a primeira história de implementação.

---

## Decisões Arquiteturais Centrais

### Análise de Prioridade

**Decisões críticas (bloqueantes para implementação):**
- Gerenciamento de estado — determina como todos os componentes se comunicam
- Estrutura de pastas — base para todas as histórias de desenvolvimento
- Tipo `Fountain` e normalização do GeoJSON — contrato de dados entre camadas

**Decisões importantes (moldam a arquitetura):**
- Tiles do mapa — afeta visual e dependências externas
- Deploy — afeta configuração de env vars e CI/CD
- Path alias — afeta todos os imports do projeto

**Decisões diferidas (pós-MVP):**
- PWA / service worker (Fase 2)
- Dark mode (Fase 2)
- Contribuição colaborativa de dados (Fase 3)

### Arquitetura de Dados

**Tipo central `Fountain`:**

```typescript
interface Fountain {
  id: string
  lat: number
  lng: number
  address: string
  city: string
  status: 'active' | 'inactive' | 'unknown'
  distance?: number  // calculado client-side após geolocalização
}
```

**Normalização do GeoJSON:** função `normalizeFountain(feature: GeoJSONFeature): Fountain` em `src/utils/normalize.ts`. Falhas de normalização ignoram a feature silenciosamente — o app não quebra por dados inesperados do dataset externo.

**Fetch do GeoJSON:** `AbortController` + timeout de 10s; URL via `import.meta.env.VITE_GEOJSON_URL` (nunca hardcoded).

### Autenticação e Segurança

Não aplicável — app público sem autenticação, sem dados sensíveis do usuário.

**Considerações de segurança aplicáveis:**
- `VITE_GEOJSON_URL` configurada via env var no dashboard do Netlify (não commitada no repositório)
- Fetch apenas via HTTPS (NFR13)
- Sem armazenamento de localização do usuário — apenas em memória durante a sessão

### Frontend — Gerenciamento de Estado

**Decisão:** `useState` por componente + `useContext` para estado global de geolocalização.

| Estado | Localização | Tipo |
|---|---|---|
| `fountains` | `useFountains` hook | `Fountain[]` |
| `userLocation` | `GeolocationContext` | `{lat, lng} \| null` |
| `selectedFountain` | `useState` no `App` | `Fountain \| null` |
| `activeFilter` | `useState` no `App` | `string \| null` |
| `loadingState` | `useFountains` hook | `'idle' \| 'loading' \| 'success' \| 'error'` |

**Rationale:** Complexidade do app não justifica Zustand. useContext é suficiente para os 2 estados verdadeiramente globais (localização e fountains).

### Frontend — Estrutura de Pastas

```
src/
  components/         # Componentes React reutilizáveis
    ui/               # Re-exports do shadcn/ui
    FountainCard/
    BottomSheet/
    FilterChips/
    FountainMarker/   # L.divIcon factory (não é componente React)
    UserLocationMarker/
  hooks/
    useFountains.ts   # fetch + normalize + estado
    useGeolocation.ts # Geolocation API wrapper
    useDistance.ts    # haversine calculation
  types/
    fountain.ts       # interface Fountain
    geojson.ts        # tipos do dataset público
  utils/
    normalize.ts      # normalizeFountain()
    haversine.ts      # cálculo de distância
    distance.ts       # formatação (180m vs 1.2km)
  lib/
    leaflet.ts        # configuração global do Leaflet (ícone padrão fix)
  App.tsx
  main.tsx
```

### Frontend — Tiles do Mapa

**Decisão:** CartoDB Positron (gratuito, sem API key).

```
URL: https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png
Attribution: © OpenStreetMap contributors © CARTO
```

**Rationale:** Visual neutro que não compete com os marcadores coloridos de status; zero configuração de chave de API; gratuito sem limites de volume para uso público.

### Infraestrutura e Deploy

**Deploy:** Netlify

- Auto-deploy em push para `main`
- `VITE_GEOJSON_URL` configurada no dashboard (Build & Deploy → Environment)
- CDN global via Netlify Edge
- `netlify.toml` na raiz com configuração de build:

```toml
[build]
  command = "npm run build"
  publish = "dist"
```

**CI/CD:** GitHub Actions para lint + typecheck em PRs:

```yaml
# .github/workflows/ci.yml
- run: npm run lint
- run: npm run typecheck  # tsc --noEmit
```

**Deploy em produção:** automático pelo Netlify após merge em `main` (sem GitHub Actions para deploy).

### Análise de Impacto das Decisões

**Sequência de implementação derivada:**
1. Inicializar projeto com Vite + instalar dependências
2. Configurar TypeScript (strict + path alias `@/`)
3. Configurar Tailwind v4 + shadcn/ui + `netlify.toml`
4. Implementar tipos (`Fountain`, `GeoJSONFeature`)
5. Implementar `normalizeFountain()` + `useFountains`
6. Implementar `useGeolocation` + `GeolocationContext`
7. Implementar mapa com marcadores
8. Implementar `BottomSheet` + `FountainCard`
9. Implementar `FilterChips` + zoom automático

**Dependências entre decisões:**
- Tipo `Fountain` é prerequisito para `useFountains`, `FountainCard` e `BottomSheet`
- `GeolocationContext` é prerequisito para `useDistance` e ordenação por distância
- Configuração do Leaflet (`lib/leaflet.ts`) é prerequisito para qualquer componente de mapa

---

## Padrões de Implementação e Regras de Consistência

### Padrões de Nomenclatura

**Arquivos e pastas:**

| Tipo | Convenção | Exemplo |
|---|---|---|
| Componente React | `PascalCase.tsx` | `FountainCard.tsx` |
| Hook customizado | `camelCase.ts` com prefixo `use` | `useFountains.ts` |
| Tipo/Interface | `camelCase.ts` | `fountain.ts` |
| Utilitário | `camelCase.ts` | `haversine.ts` |
| Pasta de componente | `PascalCase/index.tsx` | `FountainCard/index.tsx` |
| Teste | co-located, mesmo nome + `.test.tsx` | `FountainCard.test.tsx` |

**Código TypeScript:**

| Elemento | Convenção | Exemplo |
|---|---|---|
| Interface | `PascalCase` sem prefixo `I` | `Fountain`, `UserLocation` |
| Type alias | `PascalCase` | `LoadingState`, `FilterValue` |
| Enum | **evitar** — usar union types | `'active' \| 'inactive' \| 'unknown'` |
| Constante de módulo | `SCREAMING_SNAKE_CASE` | `GEOJSON_FETCH_TIMEOUT_MS` |
| Variável/função | `camelCase` | `selectedFountain`, `normalizeFountain` |
| Props interface | `PascalCase` + sufixo `Props` | `FountainCardProps` |

### Padrões de Estrutura

**Exports:** sempre nomeados — nunca `export default` em componentes ou hooks.

**Hooks:** sempre retornam objeto nomeado — nunca array (exceto ao imitar `useState`).

**Testes:** co-located na mesma pasta do componente — nunca em `__tests__/` separado.

### Padrões de Formato

**Estado de loading:** union type `'idle' | 'loading' | 'success' | 'error'` em todos os hooks.

**Erros:** sempre capturados e expostos via estado — mensagem legível para o usuário, não stack trace.

**`null` vs `undefined`:** `null` = ausência intencional; `undefined` = propriedade opcional em interface.

### Padrões de Comunicação

**Context:** sempre exportar hook de acesso (`useGeolocation()`) — nunca `useContext()` diretamente nos componentes.

**Context scope:** apenas `userLocation` e `fountains` em Context; demais estados passados via props.

**State updates:** sempre updater functions — `setFountains(prev => ...)` — nunca usar estado stale em closures.

### Padrões de Processo

**AbortController:** obrigatório em todo fetch externo com timeout de 10s (`GEOJSON_FETCH_TIMEOUT_MS = 10_000`).

**Geolocation API:** sempre verificar `navigator.geolocation` antes de chamar — fallback imediato se indisponível.

**Leaflet:** sempre instanciar objetos Leaflet dentro de `useEffect` — nunca no corpo do componente.

### Regras Obrigatórias para Todos os Agentes

1. TypeScript strict — sem `any`, sem `@ts-ignore`, sem `as unknown as Tipo`
2. Path alias `@/` — nunca imports relativos profundos (`../../...`)
3. Exports nomeados — sem `export default` em componentes e hooks
4. Testes co-located — `.test.tsx` na mesma pasta do componente
5. Sem enums — usar union types
6. Leaflet em `useEffect` — nunca fora do ciclo de vida React
7. `VITE_GEOJSON_URL` via `import.meta.env` — nunca URL hardcoded

### Anti-Padrões

```typescript
// ❌ URL hardcoded
const url = 'https://raw.githubusercontent.com/.../fontanelle.json'
// ✅ Via env var
const url = import.meta.env.VITE_GEOJSON_URL

// ❌ Enum
enum Status { Active, Inactive }
// ✅ Union type
type Status = 'active' | 'inactive' | 'unknown'

// ❌ Import relativo profundo
import { FountainCard } from '../../../components/FountainCard'
// ✅ Path alias
import { FountainCard } from '@/components/FountainCard'

// ❌ Export default em componente
export default FountainCard
// ✅ Export nomeado
export function FountainCard(...) { ... }
```

---

## Project Structure & Boundaries

### Árvore Completa do Projeto

```
fontanelle-map/
├── README.md
├── package.json
├── package-lock.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── .env.example                  # VITE_GEOJSON_URL=https://...
├── .gitignore
├── netlify.toml
├── index.html
├── .github/
│   └── workflows/
│       └── ci.yml                # lint + typecheck em PRs
├── public/
│   └── favicon.svg
└── src/
    ├── main.tsx                  # entry point: render <App />
    ├── App.tsx                   # layout raiz + GeolocationContext.Provider
    ├── index.css                 # @import "tailwindcss"; critical CSS
    ├── components/
    │   ├── ui/                   # re-exports shadcn/ui tree-shaken
    │   │   ├── badge.tsx
    │   │   ├── button.tsx
    │   │   ├── card.tsx
    │   │   ├── scroll-area.tsx
    │   │   ├── select.tsx
    │   │   └── skeleton.tsx
    │   ├── BottomSheet/
    │   │   ├── index.tsx         # snap points 64px / 50vh, safe-area
    │   │   └── BottomSheet.test.tsx
    │   ├── FilterChips/
    │   │   ├── index.tsx         # chips horizontais por cidade/região
    │   │   └── FilterChips.test.tsx
    │   ├── FountainCard/
    │   │   ├── index.tsx         # endereço, cidade, status badge, distância
    │   │   └── FountainCard.test.tsx
    │   ├── FountainList/
    │   │   ├── index.tsx         # lista acessível espelho do mapa (aria-live)
    │   │   └── FountainList.test.tsx
    │   ├── FountainMarker/
    │   │   └── index.ts          # L.divIcon factory — não é componente React
    │   ├── MapView/
    │   │   ├── index.tsx         # MapContainer + TileLayer + MarkerCluster
    │   │   └── MapView.test.tsx
    │   └── UserLocationMarker/
    │       └── index.ts          # L.divIcon azul pulsante
    ├── hooks/
    │   ├── useFountains.ts       # fetch + normalize + LoadingState
    │   ├── useGeolocation.ts     # Geolocation API wrapper + fallback
    │   └── useDistance.ts        # haversine + reordenação por distância
    ├── types/
    │   ├── fountain.ts           # interface Fountain (contrato central)
    │   └── geojson.ts            # GeoJSONFeatureCollection, GeoJSONFeature
    ├── utils/
    │   ├── normalize.ts          # normalizeFountain(feature) → Fountain | null
    │   ├── haversine.ts          # haversine(a, b): distância em metros
    │   └── distance.ts           # formatDistance(m): "180m" | "1.2km"
    └── lib/
        └── leaflet.ts            # fix ícone padrão Leaflet + import CSS
```

### Boundaries Arquiteturais

**Boundary de Dados Externos:**

- Único ponto de entrada: `src/hooks/useFountains.ts`
- `AbortController` + timeout 10s em todo fetch
- URL exclusivamente via `import.meta.env.VITE_GEOJSON_URL`
- Nenhum outro módulo faz fetch — dados chegam ao restante do app via `GeolocationContext` ou props

**Boundary de Componentes:**

| Camada | Responsabilidade | Não pode fazer |
|---|---|---|
| `App.tsx` | Layout raiz, state `selectedFountain` e `activeFilter`, provê contextos | Lógica de negócio |
| `components/` | Renderização e interação UI | Fetch direto, calcular distância |
| `hooks/` | Lógica com efeitos colaterais e estado | Renderizar JSX |
| `utils/` | Funções puras | Estado, efeitos |
| `types/` | Contratos TypeScript | Lógica alguma |
| `lib/` | Configuração de terceiros | Estado da aplicação |

**Boundary de Geolocalização:**

- `useGeolocation.ts` é o único ponto que acessa `navigator.geolocation`
- `GeolocationContext` distribui `userLocation: {lat, lng} | null` para a árvore
- Componentes consomem via hook `useGeolocation()` — nunca `useContext()` diretamente

**Boundary de Acessibilidade:**

- `MapView` renderiza com `aria-hidden="true"` (Leaflet não é navegável por teclado)
- `FountainList` é a lista espelho acessível com `role="list"` + `aria-live="polite"`
- Toda reordenação por distância dispara anúncio via `aria-live`

### Mapeamento de Requisitos → Estrutura

**FR1–5 (Mapa e Visualização):**
```
src/components/MapView/            → mapa interativo, markers, cluster
src/components/FountainMarker/     → marcadores coloridos por status
src/components/UserLocationMarker/ → posição do usuário
src/lib/leaflet.ts                 → configuração global Leaflet
```

**FR6–10 (Geolocalização e Proximidade):**
```
src/hooks/useGeolocation.ts   → Geolocation API, permissão, fallback
src/hooks/useDistance.ts      → haversine, reordenação
src/utils/haversine.ts        → cálculo puro de distância
src/utils/distance.ts         → formatação "180m" | "1.2km"
```

**FR11–14 (Descoberta e Filtro):**
```
src/components/FilterChips/   → chips por cidade/região
src/App.tsx                   → estado activeFilter, lógica de filtragem
```

**FR15–20 (Informação da Fonte):**
```
src/components/FountainCard/  → card com todos os atributos
src/components/BottomSheet/   → container bottom sheet mobile
src/types/fountain.ts         → interface Fountain (contrato)
```

**FR21–24 (Dados e Integração):**
```
src/hooks/useFountains.ts     → fetch, AbortController, LoadingState
src/utils/normalize.ts        → normalizeFountain()
src/types/geojson.ts          → tipos do dataset externo
```

**FR25–30 (Acessibilidade):**
```
src/components/FountainList/  → lista espelho acessível
src/components/BottomSheet/   → safe-area iOS, touch-action
src/index.css                 → 100dvh, focus-visible
```

**FR31–32 (SEO e Deploy):**
```
index.html                    → meta tags, Open Graph
netlify.toml                  → build config, publish dir
.github/workflows/ci.yml      → lint + typecheck em PRs
.env.example                  → documentação da env var
```

### Pontos de Integração

**Integração Externa (GeoJSON):**
```
VITE_GEOJSON_URL (Netlify env)
    → useFountains.ts (fetch + AbortController)
    → normalizeFountain() (parse + validação)
    → Fountain[] (estado normalizado)
    → GeolocationContext / props (distribuição)
```

**Integração com Browser APIs:**
```
navigator.geolocation
    → useGeolocation.ts (wrapper + error handling)
    → GeolocationContext (distribuição global)
    → useDistance.ts (haversine com userLocation)
    → FountainCard / FountainList (ordenação)
```

**Integração com Leaflet:**
```
lib/leaflet.ts (fix ícone padrão + import CSS)
    → MapView (MapContainer + TileLayer)
    → FountainMarker (L.divIcon factory)
    → UserLocationMarker (L.divIcon factory)
    ← CartoDB Positron (tiles externos, sem API key)
```

### Fluxo de Dados

```
GeoJSON URL
  → useFountains: fetch → normalize → Fountain[]
       → GeolocationContext: fountains[]
            → MapView: renderiza markers
            → FountainList: renderiza lista acessível
            → FilterChips: extrai cidades disponíveis
            → BottomSheet: exibe FountainCard selecionado

navigator.geolocation
  → useGeolocation: {lat, lng} | null
       → GeolocationContext: userLocation
            → useDistance: ordena Fountain[] por distância
            → UserLocationMarker: ponto azul no mapa
            → FountainCard: exibe "180m" | "1.2km"
```

### Organização de Configuração e Build

| Arquivo | Propósito |
|---|---|
| `vite.config.ts` | Build Vite, path alias `@/ → src/`, plugin @tailwindcss/vite |
| `tsconfig.app.json` | TypeScript strict, paths `@/*: ["src/*"]` |
| `tsconfig.node.json` | TypeScript para vite.config.ts |
| `netlify.toml` | `command: npm run build`, `publish: dist` |
| `.env.example` | Documenta `VITE_GEOJSON_URL` sem valor real |
| `.gitignore` | Exclui `dist/`, `.env`, `node_modules/` |

**Testes co-located:**
- `FountainCard.test.tsx` — ao lado de `FountainCard/index.tsx`
- Testes de utils — ao lado do utilitário (`normalize.test.ts`, `haversine.test.ts`)
- Nenhuma pasta `__tests__/` separada

---

## Architecture Validation Results

### Coherence Validation ✅

**Compatibilidade de Decisões:**

| Par de decisões | Status |
|---|---|
| Vite 6 + React 19 | ✅ Compatíveis — Vite 6 suporta React 19 natively |
| react-leaflet v5 + React 19 | ✅ Compatíveis — v5 exige React 19 como peer dep |
| Tailwind v4 + @tailwindcss/vite | ✅ Plugin nativo Vite, zero config extra |
| shadcn/ui + Tailwind v4 | ✅ shadcn usa tokens Tailwind nativamente |
| TypeScript strict + todos os tipos definidos | ✅ Interface `Fountain` e union types cobrem tudo |
| AbortController + fetch browser API | ✅ Nativo, sem dependência extra |
| Netlify static + SPA frontend-only | ✅ Deploy sem SSR alinhado com arquitetura |
| CartoDB Positron + sem API key | ✅ Gratuito, zero configuração de chave |

Nenhuma contradição encontrada entre as decisões.

**Consistência de Padrões:**

Os padrões de implementação reforçam diretamente as decisões: exports nomeados garantem tree-shaking do shadcn/ui; path alias `@/` evita imports quebrados após refactor; Leaflet em `useEffect` previne erros de SSR e side-effects no render; union types eliminam necessidade de enum transpilado.

**Alinhamento Estrutural:**

A estrutura type-based (`components/`, `hooks/`, `types/`, `utils/`, `lib/`) mapeia diretamente para os boundaries definidos — cada camada tem responsabilidade única e não pode cruzar para outra.

### Requirements Coverage Validation ✅

**Cobertura Funcional (32 FRs):**

| Categoria | FRs | Cobertura arquitetural |
|---|---|---|
| Mapa e Visualização | FR1–5 | `MapView`, `FountainMarker`, `UserLocationMarker`, `lib/leaflet.ts` |
| Geolocalização e Proximidade | FR6–10 | `useGeolocation`, `useDistance`, `haversine.ts`, `distance.ts` |
| Descoberta e Filtro | FR11–14 | `FilterChips`, `activeFilter` em `App.tsx` |
| Informação da Fonte | FR15–20 | `FountainCard`, `BottomSheet`, interface `Fountain` |
| Dados e Integração | FR21–24 | `useFountains`, `normalize.ts`, `geojson.ts` |
| Acessibilidade | FR25–30 | `FountainList` (lista espelho), `100dvh`, `safe-area`, `aria-live` |
| SEO e Deploy | FR31–32 | `index.html`, `netlify.toml`, `ci.yml`, `.env.example` |

**Cobertura Não-Funcional (NFRs com impacto arquitetural):**

| NFR | Decisão | Status |
|---|---|---|
| NFR1 — mapa < 3s em 3G | Vite code splitting automático (Leaflet chunk separado) | ✅ |
| NFR2 — interações < 100ms | Estado local sem round-trip de rede | ✅ |
| NFR3 — distância < 500ms | Haversine client-side O(n) | ✅ |
| NFR4 — bundle ≤ 500KB gzip | Tree-shaking agressivo, import direto de shadcn | ✅ |
| NFR5 — Lighthouse ≥ 80 | Critical CSS inline, code splitting | ✅ |
| NFR13 — fetch HTTPS + timeout | AbortController + 10s timeout em `useFountains` | ✅ |
| NFR14 — URL via env var | `VITE_GEOJSON_URL` via `import.meta.env` | ✅ |
| NFR15 — GeoJSON Feature Collection | Interface `Fountain` + `normalizeFountain()` | ✅ |
| NFR16 — TypeScript strict | `tsc --noEmit` no CI + regras obrigatórias | ✅ |

### Implementation Readiness Validation ✅

**Completude das Decisões:** Todas as decisões críticas documentadas com versões específicas (Vite 6, React 19, react-leaflet v5, Tailwind v4). Nenhuma decisão com "a definir".

**Completude da Estrutura:** Árvore completa com todos os arquivos e diretórios. Boundaries de camada definidos com regra do que cada camada não pode fazer.

**Completude dos Padrões:** 7 categorias de padrões, 7 regras obrigatórias, anti-patterns documentados com exemplos ✅/❌.

### Gap Analysis

**Gaps Críticos:** Nenhum.

**Gaps Importantes:**

1. **Leaflet lazy load — código não especificado:** NFR1 menciona "lazy load do Leaflet" mas o padrão não foi explicitado. Decisão para agentes: usar `React.lazy(() => import('@/components/MapView'))` em `App.tsx` para separar o chunk do Leaflet (~142KB) do bundle principal.

2. **leaflet.markercluster — opções não especificadas:** Valores default recomendados: `maxClusterRadius: 40`, `disableClusteringAtZoom: 16`.

**Gaps Nice-to-Have:**
- Configuração do Vitest não especificada
- Meta tags Open Graph do `index.html` não detalhadas

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High

**Key Strengths:**
- Stack completamente sem conflitos de versão
- Único ponto de entrada para dados externos (`useFountains`)
- Boundaries claros entre camadas — cada arquivo sabe exatamente o que não pode fazer
- Todos os 32 FRs e todos os NFRs com impacto arquitetural mapeados para arquivos específicos
- Regras obrigatórias previnem inconsistências comuns em projetos multi-agente

**Areas for Future Enhancement:**
- PWA / service worker (offline support) — Fase 2
- Dark mode (Tailwind dark: prefix já disponível) — Fase 2
- Contribuição colaborativa de dados (auth + backend) — Fase 3

### Implementation Handoff

**Primeiro passo obrigatório:**
```bash
npm create vite@latest fontanelle-map -- --template react-ts
cd fontanelle-map
npm install
```
