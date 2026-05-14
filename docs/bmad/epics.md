---
stepsCompleted: [1, 2, 3, 4]
status: complete
completedAt: "2026-05-14"
inputDocuments: ["docs/bmad/prd.md", "docs/bmad/architecture.md", "docs/bmad/ux-design-specification.md"]
---

# Fontanelle Map - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Fontanelle Map, decomposing the requirements from the PRD, UX Design Specification, and Architecture document into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Usuário pode visualizar todas as fontanelle do dataset em mapa interativo
FR2: Usuário pode navegar pelo mapa (zoom in/out, pan)
FR3: Usuário identifica visualmente o status de cada fonte (ativa/inativa) pelos marcadores
FR4: O sistema agrupa marcadores próximos automaticamente (cluster) para evitar sobreposição
FR5: O mapa ajusta zoom e centraliza automaticamente ao aplicar filtro de região
FR6: O sistema detecta a posição geográfica do usuário via API nativa do browser
FR7: O sistema exibe fontes ordenadas por distância crescente quando a localização está disponível
FR8: Usuário pode conceder ou negar geolocalização sem perder acesso ao app
FR9: O sistema oferece navegação manual por filtro quando geolocalização é indisponível ou negada
FR10: O sistema calcula e exibe distância em metros (< 1km) ou quilômetros
FR11: Usuário pode filtrar fontes por cidade ou região via seletor
FR12: Usuário pode buscar cidade/região por texto livre no seletor
FR13: O sistema exibe mensagem clara quando nenhuma fonte corresponde ao filtro
FR14: Usuário pode limpar o filtro e retornar à visão global do mapa
FR15: Usuário pode selecionar uma fonte no mapa para ver seus detalhes
FR16: Usuário visualiza o endereço completo da fonte selecionada
FR17: Usuário visualiza a cidade/região da fonte selecionada
FR18: Usuário visualiza o status atual da fonte (ativa/inativa)
FR19: Usuário visualiza a distância da fonte em relação à sua posição
FR20: Usuário pode fechar o card e retornar à navegação do mapa
FR21: O sistema carrega dados de um endpoint GeoJSON público configurável
FR22: O sistema processa e normaliza o GeoJSON para exibição no mapa e nos cards
FR23: O sistema exibe erro compreensível quando os dados não podem ser carregados
FR24: O sistema exibe o timestamp do último carregamento dos dados
FR25: Elementos interativos possuem nomes acessíveis para leitores de tela (aria-label)
FR26: Imagens e ícones possuem texto alternativo (alt)
FR27: Estrutura de headings da página é semântica e hierárquica
FR28: Foco de teclado visível nos controles principais (filtro, botões, cards)
FR29: Layout se adapta automaticamente ao tamanho da tela (mobile, tablet, desktop)
FR30: App funcional em iOS Safari e Android Chrome (últimas 2 versões)
FR31: Sistema expõe metadados de SEO básico: título, meta description, Open Graph tags
FR32: App distribuível como site estático sem servidor back-end

### NonFunctional Requirements

NFR1: Mapa e marcadores exibidos em < 3s em conexão 3G/4G, medido via Lighthouse throttling
NFR2: Interações com o mapa (zoom, pan, seleção) respondem em < 100ms
NFR3: Cálculo de distância e reordenação das fontes concluídos em < 500ms após obter localização
NFR4: Bundle de produção ≤ 500KB gzip
NFR5: Lighthouse Performance Score ≥ 80 em perfil mobile (throttling 3G)
NFR6: First Contentful Paint < 2s em conexão 4G
NFR7: Conformidade WCAG 2.1 Nível A em todos os controles principais, verificada por auditoria Lighthouse
NFR8: Todos os controles interativos operáveis via teclado (Tab, Enter, Escape)
NFR9: Fluxos críticos compatíveis com VoiceOver (iOS) e TalkBack (Android)
NFR10: Falha no fetch do GeoJSON exibe erro descritivo — sem tela em branco ou exceção não tratada
NFR11: Bloqueio da Geolocation API não impede o uso do app — fallback por filtro ativado automaticamente
NFR12: Disponibilidade ≥ 99,9% garantida pelo SLA do CDN (Netlify/GitHub Pages)
NFR13: Fetch do GeoJSON via HTTPS com timeout de 10 segundos; erro exibido após timeout
NFR14: URL do endpoint GeoJSON configurável via variável de ambiente no build — sem hardcode
NFR15: App funcional com qualquer dataset GeoJSON no formato Feature Collection com geometria Point
NFR16: Código TypeScript compila sem erros em modo strict (tsc --noEmit)
NFR17: Documentação em docs/ cobre: setup local, estrutura do projeto e processo de deploy

### Additional Requirements

- **Starter template (Epic 1, Story 1):** `npm create vite@latest fontanelle-map -- --template react-ts` seguido de instalação das dependências: Tailwind CSS v4 + @tailwindcss/vite, shadcn/ui, leaflet + react-leaflet v5, @types/leaflet, leaflet.markercluster + @types/leaflet.markercluster
- **TypeScript strict:** tsconfig.app.json com strict mode + paths `@/*: ["src/*"]`
- **Path alias obrigatório:** `@/` para todos os imports — nunca imports relativos profundos
- **Exports nomeados:** sem `export default` em componentes e hooks
- **Leaflet em useEffect:** instanciação Leaflet sempre dentro de useEffect, nunca no corpo do componente
- **AbortController:** obrigatório em todo fetch externo com `GEOJSON_FETCH_TIMEOUT_MS = 10_000`
- **`VITE_GEOJSON_URL`:** URL configurável via env var (`import.meta.env.VITE_GEOJSON_URL`) — nunca hardcoded
- **netlify.toml:** `[build] command = "npm run build" / publish = "dist"`
- **GitHub Actions CI:** lint + typecheck em PRs (`.github/workflows/ci.yml`)
- **Testes co-located:** `.test.tsx` na mesma pasta do componente — nunca em `__tests__/` separado
- **Sem enums:** usar union types (ex: `'active' | 'inactive' | 'unknown'`)
- **GeolocationContext:** distribuir `userLocation` globalmente; componentes consomem via `useGeolocation()`, nunca `useContext()` diretamente
- **React.lazy para MapView:** separar chunk do Leaflet (~142KB) do bundle principal via `React.lazy(() => import('@/components/MapView'))`
- **leaflet.markercluster:** `maxClusterRadius: 40`, `disableClusteringAtZoom: 16`

### UX Design Requirements

UX-DR1: FountainMarker — `L.divIcon` factory com ícone gota + cor por status (verde `#16a34a` / vermelho `#dc2626`), tamanho 32×32px padrão e 40×40px selecionado, ring de 4px `brand-primary` no estado selected, `title` no SVG com "Fonte ativa: [endereço]" ou "Fonte inativa: [endereço]"
UX-DR2: BottomSheet — snap points em 64px (collapsed) e 50vh (expanded), transição `transform: translateY` 300ms ease-out, `role="dialog"`, `aria-label="Detalhes da fonte"`, Escape fecha/colapsa, `padding-bottom: env(safe-area-inset-bottom)` para iOS
UX-DR3: FountainCard — hierarquia visual: distância (28px bold, brand-primary) → endereço (18px semibold) → status badge (cor + ícone + texto) → cidade (14px, text-secondary); estados: compact / expanded / no-distance (GPS indisponível) / loading (skeleton); `role="article"`, `aria-label="Fonte: [endereço], [distância], [status]"`
UX-DR4: FilterChips — scroll horizontal, `overflow-x: auto; scrollbar-width: none`, gradiente fade nas bordas laterais, `role="listbox"`, chips como `role="option"` com `aria-selected`, zoom automático ao selecionar cidade (bounds da cidade com animação 300ms)
UX-DR5: UserLocationMarker — `L.divIcon` com CSS `@keyframes pulse`, `aria-label="Sua localização atual"`
UX-DR6: Tokens de cor Tailwind: `brand-primary: #0ea5e9` (sky-500), `status-active: #16a34a` (green-600), `status-inactive: #dc2626` (red-600), `surface: #ffffff`, `surface-muted: #f8fafc` (slate-50), `text-primary: #0f172a` (slate-900), `text-secondary: #475569` (slate-600), `border: #e2e8f0` (slate-200)
UX-DR7: Tipografia: stack `system-ui, -apple-system, sans-serif`; escala: 28px/700 (distância), 18px/600 (título card), 16px/400 (corpo), 14px/500 (label), 12px/400 (caption); line-height 1.5 body / 1.2 headings; mínimo 16px para evitar zoom automático iOS
UX-DR8: Layout mobile: mapa `position: fixed; inset: 0` via Leaflet; header flutuante 56px; chips de filtro no topo em scroll horizontal; bottom sheet com snaps; `height: 100dvh` (não 100vh) para iOS Safari; touch targets mínimo 44×44px
UX-DR9: Layout desktop (≥ 1280px): sidebar fixa de 360px à esquerda com lista de fontes + filtro; mapa ocupa o restante; bottom sheet desabilitado e substituído por painel lateral
UX-DR10: Estados de loading: 3 skeletons shimmer animados durante fetch GeoJSON; spinner `Loader2` no botão de localização; `aria-live="polite"` com "Localizando sua posição..."
UX-DR11: Estado de erro fetch: componente `Alert` (destructive) com `AlertCircle` + mensagem descritiva + botão primário "Tentar novamente"; nunca mensagem genérica
UX-DR12: Fallback GPS negado: mensagem positiva "Explore por cidade", chips de filtro com destaque visual (brand-primary), nunca exibido como estado de erro
UX-DR13: Skip link acessível: `<a href="#map">Ir para o mapa</a>` visível no focus, oculto por padrão
UX-DR14: Lista espelho acessível: `FountainList` com `role="list"` + `aria-live="polite"` para reordenação; canvas Leaflet com `aria-hidden="true"` — suporte a navegação por teclado
UX-DR15: HTML semântico: `<header>`, `<main>`, `<nav>`, `<article>` nos cards; hierarquia h1 → h2 → h3 sem saltos; ícones decorativos com `aria-hidden="true"`, ícones funcionais com `aria-label`
UX-DR16: iOS Safari específico: `height: 100dvh`, `env(safe-area-inset-bottom)` no BottomSheet, `-webkit-overflow-scrolling: touch` nos chips de filtro; `touch-action: pan-y` na handle do BottomSheet

### FR Coverage Map

FR1: Epic 2 — Visualizar todas as fontanelas no mapa interativo
FR2: Epic 2 — Navegar pelo mapa (zoom, pan)
FR3: Epic 2 — Identificar status visual dos marcadores (ativa/inativa)
FR4: Epic 2 — Agrupamento automático de marcadores próximos (cluster)
FR5: Epic 4 — Zoom automático ao aplicar filtro de região
FR6: Epic 3 — Detectar posição geográfica via Geolocation API
FR7: Epic 3 — Exibir fontes ordenadas por distância crescente
FR8: Epic 3 — Conceder ou negar geolocalização sem perder acesso
FR9: Epic 3 — Navegação manual por filtro quando GPS indisponível
FR10: Epic 3 — Calcular e exibir distância em metros/quilômetros
FR11: Epic 4 — Filtrar fontes por cidade/região via seletor
FR12: Epic 4 — Buscar cidade/região por texto livre no seletor
FR13: Epic 4 — Mensagem clara quando nenhuma fonte corresponde ao filtro
FR14: Epic 4 — Limpar filtro e retornar à visão global
FR15: Epic 4 — Selecionar fonte no mapa para ver detalhes
FR16: Epic 4 — Visualizar endereço completo da fonte
FR17: Epic 4 — Visualizar cidade/região da fonte
FR18: Epic 4 — Visualizar status atual da fonte (ativa/inativa)
FR19: Epic 4 — Visualizar distância em relação à posição do usuário
FR20: Epic 4 — Fechar card e retornar à navegação do mapa
FR21: Epic 2 — Carregar dados de endpoint GeoJSON público configurável
FR22: Epic 2 — Processar e normalizar GeoJSON para exibição
FR23: Epic 2 — Exibir erro compreensível quando dados não podem ser carregados
FR24: Epic 2 — Exibir timestamp do último carregamento dos dados
FR25: Epic 4 — Nomes acessíveis em elementos interativos (aria-label)
FR26: Epic 4 — Texto alternativo em imagens e ícones (alt)
FR27: Epic 4 — Estrutura de headings semântica e hierárquica
FR28: Epic 4 — Foco de teclado visível nos controles principais
FR29: Epic 4 — Layout responsivo (mobile, tablet, desktop)
FR30: Epic 4 — App funcional em iOS Safari e Android Chrome
FR31: Epic 5 — SEO básico: título, meta description, Open Graph
FR32: Epic 1 — App distribuível como site estático sem servidor back-end

## Epic List

### Epic 1: Fundação do Projeto
Stack completa configurada e app deployável no Netlify com zero funcionalidade — base para todas as histórias seguintes. Inclui inicialização do projeto, configuração TypeScript strict com path alias `@/`, Tailwind v4, shadcn/ui, netlify.toml e GitHub Actions CI.
**FRs cobertos:** FR32
**NFRs cobertos:** NFR12, NFR16

### Epic 2: Mapa e Dados das Fontanelas
Usuário vê todas as fontanelas plotadas num mapa interativo com identificação visual de status (ativa/inativa) e agrupamento automático de marcadores. Inclui tipos TypeScript, normalização do GeoJSON, hook useFountains, MapView com Leaflet, FountainMarker e markercluster.
**FRs cobertos:** FR1, FR2, FR3, FR4, FR21, FR22, FR23, FR24
**NFRs cobertos:** NFR1, NFR10, NFR13, NFR14, NFR15

### Epic 3: Geolocalização e Distância
Usuário vê as fontanelas ordenadas por distância da sua posição após conceder geolocalização; fallback elegante para filtro por cidade quando GPS é negado. Inclui useGeolocation hook, GeolocationContext, haversine, useDistance e UserLocationMarker.
**FRs cobertos:** FR6, FR7, FR8, FR9, FR10
**NFRs cobertos:** NFR2, NFR3, NFR11

### Epic 4: Detalhes, Filtro e Experiência Completa
Usuário acessa detalhes de qualquer fonte, filtra por cidade com zoom automático e tem experiência completa em mobile (bottom sheet) e desktop (sidebar). Inclui FountainCard, BottomSheet, FilterChips, FountainList acessível, layout responsivo e todos os requisitos de acessibilidade.
**FRs cobertos:** FR5, FR11, FR12, FR13, FR14, FR15, FR16, FR17, FR18, FR19, FR20, FR25, FR26, FR27, FR28, FR29, FR30
**NFRs cobertos:** NFR7, NFR8, NFR9

### Epic 5: SEO, Performance e Documentação
App pronto para produção com SEO básico (Open Graph, meta tags), bundle ≤ 500KB auditado, Lighthouse Performance ≥ 80 e documentação técnica em `docs/`.
**FRs cobertos:** FR31
**NFRs cobertos:** NFR4, NFR5, NFR6, NFR17

---

## Epic 1: Fundação do Projeto

Stack completa configurada e app deployável no Netlify — base para todas as histórias seguintes.

### Story 1.1: Inicializar Projeto com Stack Completa

Como desenvolvedor,
Quero o projeto scaffolded com o starter Vite e todas as dependências instaladas,
Para ter um ambiente de desenvolvimento pronto para implementar funcionalidades.

**Acceptance Criteria:**

**Given** Node.js instalado
**When** executo `npm create vite@latest fontanelle-map -- --template react-ts && npm install`
**Then** a estrutura de pastas corresponde à árvore definida na arquitetura com `src/main.tsx`, `src/App.tsx`, `vite.config.ts`, `tsconfig.json`

**Given** projeto inicializado
**When** instalo Tailwind v4 + @tailwindcss/vite + shadcn/ui + leaflet + react-leaflet + leaflet.markercluster + @types/leaflet + @types/leaflet.markercluster
**Then** `npm install` completa sem erros

**Given** dependências instaladas
**When** executo `npm run dev`
**Then** o servidor Vite inicia em `http://localhost:5173` com HMR funcionando

---

### Story 1.2: Configurar TypeScript Strict, Path Alias e Design System

Como desenvolvedor,
Quero TypeScript strict mode, path alias `@/`, Tailwind v4 e shadcn/ui configurados,
Para que todos os módulos futuros usem as convenções corretas desde o início.

**Acceptance Criteria:**

**Given** `tsconfig.app.json`
**When** configurado com `"strict": true` e `paths: { "@/*": ["./src/*"] }`
**Then** `tsc --noEmit` passa sem erros

**Given** `vite.config.ts`
**When** contém `resolve.alias: { '@': path.resolve(__dirname, './src') }` e o plugin `@tailwindcss/vite`
**Then** imports com `@/` resolvem corretamente em qualquer arquivo de `src/`

**Given** `npx shadcn@latest init` executado
**When** a inicialização completa com configuração Tailwind v4
**Then** `src/components/ui/` existe com o setup base do shadcn

**Given** `src/index.css`
**When** contém `@import "tailwindcss"`
**Then** classes utilitárias Tailwind estão disponíveis em todo o projeto

**Given** `src/index.css` ou `tailwind.config`
**When** configurado
**Then** define tokens de cor: `--brand-primary: #0ea5e9`, `--status-active: #16a34a`, `--status-inactive: #dc2626`, e tipografia base: `font-family: system-ui, -apple-system, sans-serif`, `font-size` mínimo 16px, `line-height: 1.5` (UX-DR6, UX-DR7)

---

### Story 1.3: Configurar Deploy Netlify e GitHub Actions CI

Como desenvolvedor,
Quero `netlify.toml` e GitHub Actions CI configurados,
Para que o app seja deployável automaticamente e TypeScript + lint sejam verificados em PRs.

**Acceptance Criteria:**

**Given** `netlify.toml` na raiz
**When** contém `[build] command = "npm run build"` e `publish = "dist"`
**Then** Netlify consegue fazer deploy do projeto via `npm run build`

**Given** `.github/workflows/ci.yml`
**When** um PR é criado no repositório
**Then** o CI executa `npm run lint` e `npm run typecheck` (`tsc --noEmit`) e falha se houver erros

**Given** `.env.example` na raiz
**When** contém `VITE_GEOJSON_URL=`
**Then** a variável de ambiente necessária está documentada para quem configura o deploy

**Given** `npm run build`
**When** a build completa sem erros
**Then** `dist/` é criado e `npm run preview` serve o app buildado corretamente

---

## Epic 2: Mapa e Dados das Fontanelas

Usuário vê todas as fontanelas num mapa interativo com identificação visual de status e agrupamento automático.

### Story 2.1: Tipos TypeScript e Normalização do GeoJSON

Como desenvolvedor,
Quero a interface `Fountain` e a função `normalizeFountain()` implementadas,
Para que todos os dados que fluem pelo app usem o contrato de tipo correto.

**Acceptance Criteria:**

**Given** `src/types/fountain.ts`
**When** exporta `interface Fountain { id: string; lat: number; lng: number; address: string; city: string; status: 'active' | 'inactive' | 'unknown'; distance?: number }`
**Then** `tsc --noEmit` passa sem erros em modo strict

**Given** `src/types/geojson.ts`
**When** exporta `GeoJSONFeatureCollection` e `GeoJSONFeature` compatíveis com o dataset público
**Then** TypeScript strict aceita os tipos sem `any` ou `@ts-ignore`

**Given** `src/utils/normalize.ts` — função `normalizeFountain(feature: GeoJSONFeature)`
**When** recebe uma Feature GeoJSON válida
**Then** retorna um objeto `Fountain` com todos os campos obrigatórios preenchidos

**Given** `normalizeFountain(feature)`
**When** a Feature tem campos ausentes ou inválidos
**Then** retorna `null` (skip silencioso — o app não quebra por dados inesperados do dataset)

---

### Story 2.2: Hook useFountains — Fetch e Estado de Carregamento

Como usuário,
Quero que o app carregue os dados das fontanelas automaticamente ao abrir,
Para ver as fontes no mapa sem precisar fazer nenhuma ação.

**Acceptance Criteria:**

**Given** `src/hooks/useFountains.ts`
**When** o hook monta
**Then** faz fetch de `import.meta.env.VITE_GEOJSON_URL` com `AbortController` e timeout de 10s (`GEOJSON_FETCH_TIMEOUT_MS = 10_000`)

**Given** o fetch tem sucesso
**When** o GeoJSON é recebido
**Then** `fountains: Fountain[]` contém todas as features normalizadas válidas e `loadingState` é `'success'`

**Given** o fetch falha ou atinge timeout
**When** o erro ocorre
**Then** `loadingState` é `'error'` e `errorMessage` é uma string legível para o usuário (sem stack trace)

**Given** o componente desmonta durante o fetch
**When** o fetch ainda está em andamento
**Then** o AbortController cancela a requisição sem gerar erro não tratado

**Given** mudança de estado dentro do hook
**When** `setFountains` é chamado
**Then** usa updater function `setFountains(prev => ...)` para evitar closures stale

**Given** fetch com sucesso
**When** `loadingState` passa para `'success'`
**Then** o hook expõe `lastFetchedAt: Date` com o timestamp do carregamento bem-sucedido (FR24)

---

### Story 2.3: Configuração Global do Leaflet e Componente MapView

Como usuário,
Quero ver um mapa interativo ao abrir o app,
Para ter contexto geográfico das fontanelas.

**Acceptance Criteria:**

**Given** `src/lib/leaflet.ts`
**When** importado
**Then** corrige o bug do ícone padrão do Leaflet e importa `leaflet/dist/leaflet.css`

**Given** `src/components/MapView/index.tsx`
**When** renderizado
**Then** exibe um `MapContainer` com tiles CartoDB Positron centralizado na Itália (lat: 41.9, lng: 12.5, zoom: 6)

**Given** o canvas do Leaflet
**When** renderizado
**Then** tem `aria-hidden="true"` (a lista espelho FountainList é a alternativa acessível)

**Given** `React.lazy(() => import('@/components/MapView'))` em `App.tsx`
**When** o build de produção completa
**Then** o chunk do Leaflet (~142KB) é separado do bundle principal no `dist/`

---

### Story 2.4: Marcadores de Fontanela com Status Visual

Como usuário,
Quero ver marcadores coloridos no mapa que indicam imediatamente se a fontanela está ativa ou inativa,
Para identificar fontes funcionando sem precisar tocar em cada marcador.

**Acceptance Criteria:**

**Given** `src/components/FountainMarker/index.ts`
**When** chamado com `status: 'active'`
**Then** retorna `L.divIcon` com ícone gota verde (#16a34a), 32×32px, com `title` "Fonte ativa: [endereço]"

**Given** `FountainMarker` com `status: 'inactive'`
**When** chamado
**Then** retorna `L.divIcon` com ícone gota vermelho (#dc2626), 32×32px, com `title` "Fonte inativa: [endereço]"

**Given** `FountainMarker` com `status: 'unknown'`
**When** chamado
**Then** retorna `L.divIcon` com estilo cinza neutro, 32×32px

**Given** marcador no estado `selected: true`
**When** renderizado
**Then** tamanho aumenta para 40×40px e exibe ring de 4px em brand-primary (#0ea5e9)

**Given** `loadingState: 'success'` e array `Fountain[]`
**When** MapView renderiza
**Then** cada fontanela tem um marcador na lat/lng correta no mapa

---

### Story 2.5: Agrupamento de Marcadores e Estados de Loading/Erro

Como usuário,
Quero que marcadores próximos se agrupem ao dar zoom out e ver feedback durante o carregamento,
Para que o mapa seja legível em áreas densas e eu saiba o que está acontecendo enquanto aguardo.

**Acceptance Criteria:**

**Given** `leaflet.markercluster` integrado ao MapView
**When** `loadingState: 'success'`
**Then** todos os marcadores são adicionados a `L.markerClusterGroup` com `maxClusterRadius: 40` e `disableClusteringAtZoom: 16`

**Given** um cluster de marcadores
**When** clicado
**Then** o mapa faz zoom nos bounds do cluster

**Given** zoom ≥ nível 16
**When** visualizando uma área com múltiplas fontanelas
**Then** marcadores individuais são exibidos sem agrupamento

**Given** `loadingState: 'loading'`
**When** o fetch do GeoJSON está em andamento
**Then** 3 skeletons `Skeleton` do shadcn animam na área de lista/bottom sheet

**Given** `loadingState: 'error'`
**When** o fetch falhou ou atingiu timeout
**Then** componente `Alert` (destructive) exibe `AlertCircle` + mensagem descritiva + botão "Tentar novamente" — sem tela em branco

---

## Epic 3: Geolocalização e Distância

Usuário vê fontanelas ordenadas por distância da sua posição; fallback elegante quando GPS é negado.

### Story 3.1: Hook useGeolocation e GeolocationContext

Como usuário,
Quero que o app solicite minha localização após o mapa carregar,
Para ver fontanelas ordenadas por distância sem precisar fazer nada.

**Acceptance Criteria:**

**Given** `src/hooks/useGeolocation.ts`
**When** o hook inicializa
**Then** verifica `navigator.geolocation` antes de chamar `getCurrentPosition` — fallback imediato se indisponível

**Given** o usuário concede permissão
**When** `getCurrentPosition` retorna com sucesso
**Then** `userLocation: { lat: number; lng: number }` é definido no GeolocationContext

**Given** o usuário nega permissão
**When** o callback de erro dispara
**Then** `userLocation` permanece `null` e nenhum erro é lançado para a UI

**Given** `src/contexts/GeolocationContext.tsx`
**When** wraps o App como Provider
**Then** componentes acessam `userLocation` via `useGeolocation()` — nunca `useContext()` diretamente

**Given** `navigator.geolocation` indisponível
**When** o hook inicializa
**Then** define `userLocation: null` imediatamente sem exceção

---

### Story 3.2: Cálculo de Distância e Utilitários

Como usuário,
Quero ver a distância até cada fontanela exibida corretamente,
Para saber imediatamente o quão longe ela está de mim.

**Acceptance Criteria:**

**Given** `src/utils/haversine.ts`
**When** chamado com dois `{lat, lng}`
**Then** retorna a distância em metros em < 1ms para qualquer entrada realista

**Given** `src/utils/distance.ts` — `formatDistance(180)`
**When** chamado
**Then** retorna `"180m"`

**Given** `formatDistance(1200)`
**When** chamado
**Then** retorna `"1.2km"`

**Given** `src/hooks/useDistance.ts`
**When** `userLocation` não é null e `fountains` está carregado
**Then** retorna novo `Fountain[]` com campo `distance` preenchido e ordenado por distância crescente

**Given** `useDistance` com `userLocation: null`
**When** executado
**Then** retorna o array `fountains` original sem modificação (sem campo `distance`)

---

### Story 3.3: Localização no Mapa e Reordenação Automática

Como usuário,
Quero ver minha posição no mapa e as fontanelas reordenarem automaticamente por distância,
Para experimentar o efeito "nearest first" sem nenhuma ação da minha parte.

**Acceptance Criteria:**

**Given** `src/components/UserLocationMarker/index.ts`
**When** `userLocation` não é null
**Then** um `L.divIcon` com animação CSS `@keyframes pulse` aparece na lat/lng do usuário com `aria-label="Sua localização atual"`

**Given** `userLocation` torna-se disponível
**When** `useDistance` recalcula
**Then** a ordem das fontanelas na UI reflete a ordenação por distância crescente (FountainList e BottomSheet)

**Given** GPS negado (`userLocation: null`)
**When** o app está carregado
**Then** FilterChips ganham destaque visual com mensagem positiva "Explore por cidade" (não exibir como mensagem de erro)

---

## Epic 4: Detalhes, Filtro e Experiência Completa

Usuário acessa detalhes de qualquer fonte, filtra por cidade e tem experiência completa em mobile e desktop com acessibilidade.

### Story 4.1: Componente FountainCard

Como usuário,
Quero ver todas as informações relevantes de uma fontanela num card claro com hierarquia correta,
Para decidir qual fonte visitar.

**Acceptance Criteria:**

**Given** `src/components/FountainCard/index.tsx` com `Fountain` com `distance` definido
**When** renderizado
**Then** exibe na ordem: distância (28px bold, #0ea5e9) → endereço (18px semibold) → badge de status (cor + ícone + texto) → cidade (14px, text-secondary)

**Given** FountainCard com `distance: undefined` (GPS indisponível)
**When** renderizado
**Then** o campo de distância é omitido — sem placeholder vazio

**Given** `status: 'active'`
**When** o badge renderiza
**Then** exibe `Badge` verde com "✓ Ativa"

**Given** `status: 'inactive'`
**When** o badge renderiza
**Then** exibe `Badge` vermelho com "✗ Inativa" e texto secundário "Ver próxima ↓"

**Given** FountainCard
**When** renderizado
**Then** tem `role="article"` e `aria-label="Fonte: [endereço], [distância se disponível], [status]"`

---

### Story 4.2: Componente BottomSheet (Mobile)

Como usuário mobile,
Quero um painel deslizante da base ao selecionar uma fontanela,
Para ver os detalhes sem perder o contexto do mapa.

**Acceptance Criteria:**

**Given** `src/components/BottomSheet/index.tsx` sem fontanela selecionada
**When** renderizado
**Then** BottomSheet está oculto (fora da tela)

**Given** `selectedFountain` definido em App
**When** atualizado
**Then** BottomSheet anima para estado `collapsed` (64px) mostrando distância + endereço

**Given** BottomSheet em `collapsed`
**When** usuário faz swipe up ou toca no handle
**Then** expande para 50vh exibindo o FountainCard completo

**Given** BottomSheet expandido
**When** usuário faz swipe down, pressiona Escape ou toca no botão fechar
**Then** volta para `collapsed` ou oculto

**Given** BottomSheet
**When** renderizado
**Then** tem `role="dialog"`, `aria-label="Detalhes da fonte"` e `padding-bottom: env(safe-area-inset-bottom)`

**Given** transição do BottomSheet
**When** animando
**Then** usa `transform: translateY` com `300ms ease-out` (sem layout shifts)

---

### Story 4.3: FilterChips e Lógica de Filtro com Zoom

Como usuário,
Quero filtrar fontanelas por cidade usando chips sempre visíveis,
Para explorar uma área específica sem precisar digitar nada.

**Acceptance Criteria:**

**Given** `src/components/FilterChips/index.tsx` com `fountains` carregadas
**When** renderizado
**Then** exibe chips derivados automaticamente dos valores únicos de `city` no dataset — sem lista hardcoded

**Given** FilterChips
**When** renderizado
**Then** scroll horizontal com `overflow-x: auto; scrollbar-width: none` e gradiente fade nas bordas laterais

**Given** seleção de um chip de cidade
**When** clicado
**Then** (a) `activeFilter` é definido em App, (b) apenas fontanelas daquela cidade são exibidas, (c) mapa faz zoom nos bounds da cidade com animação 300ms

**Given** chip "Todas" ou reclick do chip ativo
**When** clicado
**Then** filtro é limpo e mapa retorna à visão global

**Given** nenhuma fonte corresponde ao filtro
**When** o filtro é aplicado
**Then** mensagem "Nenhuma fonte encontrada em [cidade]" + botão ghost "Ver todas as fontes"

**Given** FilterChips
**When** renderizado
**Then** tem `role="listbox"` e cada chip tem `role="option"` com `aria-selected`

---

### Story 4.4: Seleção de Fonte e FountainList Acessível

Como usuário (incluindo usuários de teclado),
Quero selecionar qualquer fontanela e ver seus detalhes,
Para acessar informações sobre fontes específicas independentemente do modo de interação.

**Acceptance Criteria:**

**Given** marcador de fontanela no mapa
**When** clicado/tocado
**Then** `selectedFountain` é definido em App e BottomSheet abre

**Given** `src/components/FountainList/index.tsx`
**When** fontanelas estão carregadas
**Then** renderiza lista espelho com `role="list"` e cada item com `role="listitem"` + detalhes da fontanela

**Given** FountainList
**When** a ordem das fontanelas muda (reordenação por distância ou aplicação de filtro)
**Then** `aria-live="polite"` anuncia a mudança para leitores de tela

**Given** usuário de teclado navegando FountainList
**When** pressiona Enter num item da lista
**Then** `selectedFountain` é definido (equivalente a clicar no marcador)

**Given** BottomSheet aberto
**When** usuário fecha (Escape, swipe down, botão fechar)
**Then** `selectedFountain` é null e foco retorna ao elemento que disparou a abertura

---

### Story 4.5: Layout Responsivo (Mobile, Tablet, Desktop)

Como usuário em qualquer dispositivo,
Quero que o layout se adapte ao meu tamanho de tela,
Para ter a melhor experiência em mobile, tablet e desktop.

**Acceptance Criteria:**

**Given** viewport < 768px (mobile)
**When** o app carrega
**Then** mapa preenche `100dvh`, header flutua sobre o mapa (56px), FilterChips estão no topo em scroll horizontal, BottomSheet está ativo

**Given** viewport 768px–1279px (tablet)
**When** o app carrega
**Then** mesma estrutura do mobile com BottomSheet expandido em 60vh

**Given** viewport ≥ 1280px (desktop)
**When** o app carrega
**Then** sidebar fixa de 360px à esquerda com FountainList + FilterChips + card selecionado; mapa preenche o restante; BottomSheet desabilitado

**Given** qualquer viewport
**When** elementos interativos são renderizados
**Then** todos os alvos de toque/clique têm mínimo 44×44px

**Given** iOS Safari
**When** o app carrega
**Then** o mapa usa `height: 100dvh` (não `100vh`) para evitar o bug da barra do browser

---

### Story 4.6: Acessibilidade WCAG 2.1 Nível A e HTML Semântico

Como usuário com necessidades de acessibilidade,
Quero que todos os elementos interativos estejam corretamente rotulados e navegáveis por teclado,
Para usar o app sem mouse ou com leitor de tela.

**Acceptance Criteria:**

**Given** estrutura HTML do app
**When** renderizada
**Then** usa elementos semânticos: `<header>`, `<main>`, `<nav>` para FilterChips, `<article>` para FountainCards; hierarquia h1→h2→h3 sem saltos

**Given** skip link `<a href="#map" class="sr-only focus:not-sr-only">Ir para o mapa</a>`
**When** usuário de teclado pressiona Tab a partir do topo da página
**Then** o skip link torna-se visível e move o foco para a região do mapa

**Given** todos os elementos interativos (botões, chips, cards)
**When** navegados por Tab
**Then** ring de foco (2px solid #0ea5e9) é visível em todos

**Given** ícones Lucide decorativos
**When** renderizados
**Then** têm `aria-hidden="true"`

**Given** botões icon-only (ex: botão de localização)
**When** renderizados
**Then** têm `aria-label` descrevendo a ação

**Given** headings da página
**When** auditados
**Then** h1 → h2 → h3 sem nenhum nível pulado

---

## Epic 5: SEO, Performance e Documentação

App pronto para produção com SEO básico, bundle auditado e documentação técnica.

### Story 5.1: SEO Básico e Meta Tags

Como usuário que compartilha o link,
Quero que o app tenha meta tags corretas,
Para que apareça bem quando compartilhado em redes sociais e seja encontrável.

**Acceptance Criteria:**

**Given** `index.html`
**When** renderizado
**Then** contém `<title>Fontanelle Map — Trova le fontanelle più vicine</title>`, `<meta name="description" content="...">` e Open Graph tags (`og:title`, `og:description`, `og:type`)

**Given** `public/robots.txt`
**When** criado
**Then** permite todos os crawlers com `User-agent: * / Allow: /`

---

### Story 5.2: Auditoria de Performance e Bundle

Como desenvolvedor,
Quero que o bundle de produção passe nas metas de performance,
Para que usuários em conexões móveis tenham uma experiência rápida.

**Acceptance Criteria:**

**Given** `npm run build`
**When** a build completa
**Then** o tamanho total gzip do bundle é ≤ 500KB (NFR4)

**Given** app buildado
**When** auditado no Lighthouse mobile (throttled 3G)
**Then** Performance Score ≥ 80 (NFR5) e FCP < 2s (NFR6)

**Given** `React.lazy` wrappando MapView
**When** bundle analisado
**Then** o chunk do Leaflet é separado do chunk JS principal

**Given** imports dos componentes shadcn/ui
**When** buildados
**Then** apenas os componentes efetivamente usados são incluídos (tree-shaken)

---

### Story 5.3: Documentação Técnica

Como desenvolvedor entrando no projeto,
Quero documentação cobrindo setup, estrutura e deploy,
Para começar a trabalhar sem precisar perguntar ao desenvolvedor original.

**Acceptance Criteria:**

**Given** `docs/` directory
**When** populada
**Then** cobre: (a) setup local com `npm install`, configuração do `.env` e `npm run dev`; (b) estrutura do projeto com explicação de cada pasta; (c) processo de deploy no Netlify com `VITE_GEOJSON_URL`

**Given** `README.md` na raiz
**When** lido
**Then** tem seção quickstart com o comando do servidor de desenvolvimento e link para `docs/`
