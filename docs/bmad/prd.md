---
stepsCompleted: ["step-01-init", "step-02-discovery", "step-02b-vision", "step-02c-executive-summary", "step-03-success", "step-04-journeys", "step-05-domain-skipped", "step-06-innovation-skipped", "step-07-project-type", "step-08-scoping", "step-09-functional", "step-10-nonfunctional", "step-11-polish", "step-12-complete"]
status: approved
completedAt: "2026-05-13"
releaseMode: phased
classification:
  projectType: web_app
  domain: general
  complexity: low
  projectContext: greenfield
inputDocuments: ["docs/bmad/product-brief-fontanelle-map.md"]
workflowType: prd
projectName: Fontanelle Map
---

# Product Requirements Document — Fontanelle Map

**Autor:** Alan Raldi
**Data:** 2026-05-13
**Versão:** 1.0

---

## Resumo Executivo

O **Fontanelle Map** é uma SPA (Single Page Application) estática que transforma dados geográficos públicos de fontes de água (fontanelle) — disponíveis como GeoJSON no GitHub — numa interface visual, responsiva e de zero fricção. O usuário abre a URL, o mapa carrega com todas as fontes plotadas, a geolocalização do navegador identifica sua posição, e em menos de 10 segundos vê as fontes mais próximas ordenadas por distância. Sem login, sem instalação, sem back-end proprietário.

**Público-alvo primário:** turistas e moradores em movimento (a pé ou de bicicleta) que precisam de água sem custo. **Público secundário:** exploradores planejando visitas a cidades italianas e cidadãos com consciência ambiental.

**Problema central:** o dado das fontanelle existe publicamente, mas é inacessível para 99% dos usuários — requer conhecimento técnico para consumir, não considera localização e não expõe status de funcionamento. A barreira entre o dataset público e o usuário é puramente de interface.

**Diferencial:** nenhuma alternativa combina geolocalização automática + ordenação por distância + filtro regional + card de status numa URL acessível sem instalação. A arquitetura stateless garante disponibilidade sem custo operacional.

**Por que agora:** o dataset público está disponível e documentado; a Geolocation API é suportada universalmente; a stack (Vite + React + TypeScript + Leaflet) permite entrega em semanas.

| Campo | Valor |
|---|---|
| **Tipo** | Web App — SPA, browser-only, deploy estático |
| **Domínio** | Geral / Cívico — dados públicos, sem compliance regulatório |
| **Complexidade** | Baixa |
| **Contexto** | Greenfield |

---

## Critérios de Sucesso

### Sucesso do Usuário

- Usuário encontra a fonte mais próxima em **menos de 10 segundos** após abrir o site
- Mapa carrega em **menos de 3 segundos** em conexão 3G/4G
- Filtro por cidade/região utilizável sem instrução prévia (zero onboarding)
- Interface funciona sem erros em **iOS Safari** e **Android Chrome** (últimas 2 versões)
- Geolocalização negada resulta em fallback claro — sem tela em branco ou erro genérico

### Sucesso do Produto

- **100%** das fontanelle do dataset GeoJSON exibidas no mapa
- Deploy 100% estático — zero dependência de back-end proprietário
- Filtro de cidades derivado automaticamente do GeoJSON — sem manutenção manual
- TypeScript compila sem erros em modo strict
- Bundle de produção < 500KB gzip

### Resultados Mensuráveis

| Métrica | Meta v1 |
|---|---|
| Tempo até ver fontes próximas | < 10s |
| Carregamento do mapa (3G) | < 3s |
| Cobertura do dataset | 100% |
| Compatibilidade mobile | iOS Safari + Android Chrome |
| Custo de infraestrutura | €0/mês |
| Lighthouse Performance Score | ≥ 80 |

---

## Escopo do Produto

### Fase 1 — MVP (Lançamento)

**Abordagem:** MVP orientado à experiência — entrega a jornada completa do Caminhante sem fricção desde o primeiro dia. 1 desenvolvedor front-end, sem infra de back-end.

**Jornadas suportadas:** Caminhante (feliz + sem GPS), Explorador Regional, Cidadão Recorrente.

**Capacidades:**
- Mapa interativo com 100% das fontanelle do GeoJSON
- Geolocalização automática com fallback manual por filtro
- Ordenação das fontes por distância crescente
- Filtro por cidade/região com zoom automático no mapa
- Card da fonte: endereço, cidade, status (ativo/inativo), distância
- Layout responsivo mobile-first (iOS Safari + Android Chrome + desktop moderno)
- SEO básico: title, meta description, Open Graph
- Acessibilidade WCAG 2.1 Nível A
- Deploy estático (Netlify ou GitHub Pages)
- Documentação técnica em `docs/`

### Fase 2 — Crescimento (Pós-MVP)

- Imagens das fontes quando disponíveis no dataset
- Link direto compartilhável para uma fonte específica
- Indicador de qualidade da água / data de última manutenção
- PWA básico (instalável no celular)

### Fase 3 — Visão (Futuro)

- Contribuição colaborativa de dados pela comunidade
- Suporte a múltiplos países e datasets europeus
- Parceria com prefeituras para atualização em tempo real
- Modo offline completo

### Mitigação de Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Dataset desatualizado no GitHub | Médio | Exibir timestamp do último fetch; link para fonte original |
| Geolocalização bloqueada | Alto | Fallback por filtro de cidade já no MVP |
| Performance ruim com muitos marcadores | Médio | Cluster automático (Leaflet.markercluster) |
| URL do JSON mudar no GitHub | Baixo | Configurável via variável de ambiente no build |

---

## Jornadas do Usuário

### Jornada 1 — O Caminhante: Caminho Feliz

**Marco** é turista alemão em Roma. Está no Trastevere com a garganta seca — comprou água engarrafada há 3 horas por €2,50. Não quer repetir.

**Cena:** Marco abre o Fontanelle Map no celular. Em 2 segundos o mapa carrega com pontos azuis. O browser pede localização — ele aceita. Um card aparece: *"Via della Scala, 12 — 180m — Ativa"*.

**Clímax:** Em 2 minutos está bebendo água fresca da fonte. Zero euros, zero cadastro.

**Resolução:** Marco envia a URL para a namorada. *"Isso deveria ser o app oficial de Roma."*

**Requisitos revelados:** FR6, FR7, FR10, FR15–FR19, NFR1, NFR2.

---

### Jornada 2 — O Caminhante: Geolocalização Negada

**Sara** é corredora em Milão. Nunca concede localização para sites desconhecidos.

**Cena:** Sara abre o app no meio do treino, nega a localização. O mapa carrega normalmente. Uma mensagem discreta orienta: *"Use o filtro para explorar por bairro."* Sara escolhe "Porta Venezia" — vê as fontes da área.

**Clímax:** Encontra uma fonte a 400m do percurso e ajusta a rota.

**Resolução:** Sara usa o app toda semana sem conceder localização. O app nunca insiste.

**Requisitos revelados:** FR8, FR9, FR11, FR12, NFR11.

---

### Jornada 3 — O Explorador Regional: Planejamento Antecipado

**Léa** é professora francesa planejando viagem pela Toscana. Está em casa no laptop.

**Cena:** Léa abre o Fontanelle Map no desktop, filtra "Firenze". O mapa faz zoom automático e exibe as fontes do município com marcadores por status. Léa navega 10 minutos, lê endereços, anota no bloco de viagem.

**Resolução:** O Fontanelle Map entra no kit de planejamento de Léa — ao lado do Google Maps e Tripadvisor.

**Requisitos revelados:** FR5, FR11, FR12, FR15–FR17, FR29, NFR1.

---

### Jornada 4 — O Cidadão Consciente: Uso Recorrente

**Giulia** mora em Bolonha. Faz caminhadas diárias, odeia plástico descartável, tem o app nos favoritos do celular.

**Cena:** Giulia abre o app — localização carrega instantaneamente (permissão já salva). Vê 3 fontes próximas; uma está inativa. Vai direto para a segunda.

**Resolução:** Giulia usa o app 3–4 vezes por semana. Só precisa que funcione sempre e que o status esteja correto.

**Requisitos revelados:** FR3, FR7, FR18, NFR2, NFR10, NFR12.

---

### Cobertura de Requisitos por Jornada

| Capacidade | J1 | J2 | J3 | J4 |
|---|---|---|---|---|
| Geolocalização automática | ✓ | fallback | — | ✓ |
| Card com distância + status | ✓ | ✓ | ✓ | ✓ |
| Filtro por cidade/região | — | ✓ | ✓ | — |
| Zoom automático no filtro | — | — | ✓ | — |
| Fallback sem GPS | — | ✓ | — | — |
| Carregamento rápido mobile | ✓ | — | — | ✓ |
| Layout desktop funcional | — | — | ✓ | — |
| Indicador de status | ✓ | — | ✓ | ✓ |

---

## Requisitos de Plataforma Web

### Arquitetura

- **Renderização:** SPA React — toda a lógica roda no cliente
- **Dados:** fetch único do GeoJSON no carregamento; sem polling ou WebSocket
- **Estado:** local ao browser — sem autenticação, sem sessão de servidor
- **Deploy:** estático — qualquer CDN (Netlify, GitHub Pages) serve o projeto

### Matriz de Browsers

| Browser | Plataforma | Suporte |
|---|---|---|
| Safari (últimas 2 versões) | iOS | Obrigatório |
| Chrome (últimas 2 versões) | Android | Obrigatório |
| Chrome (últimas 2 versões) | Desktop | Obrigatório |
| Firefox (última versão) | Desktop | Recomendado |
| Edge (última versão) | Desktop | Recomendado |
| Browsers legados (IE, Safari < 14) | — | Fora de escopo |

### Design Responsivo

- Mobile-first: breakpoints em 375px, 768px, 1280px
- Mapa ocupa 100% da viewport em mobile; painel lateral em desktop
- Área mínima de toque: 44×44px
- Testado em portrait e landscape

### SEO

- `<title>`, `<meta description>`, Open Graph tags
- URL amigável, `sitemap.xml`, `robots.txt` permissivo
- **Fora do escopo:** SSR, pré-renderização por cidade

---

## Requisitos Funcionais

### Mapa e Visualização

- **FR1:** Usuário pode visualizar todas as fontanelle do dataset em mapa interativo
- **FR2:** Usuário pode navegar pelo mapa (zoom in/out, pan)
- **FR3:** Usuário identifica visualmente o status de cada fonte (ativa/inativa) pelos marcadores
- **FR4:** O sistema agrupa marcadores próximos automaticamente (cluster) para evitar sobreposição
- **FR5:** O mapa ajusta zoom e centraliza automaticamente ao aplicar filtro de região

### Geolocalização e Proximidade

- **FR6:** O sistema detecta a posição geográfica do usuário via API nativa do browser
- **FR7:** O sistema exibe fontes ordenadas por distância crescente quando a localização está disponível
- **FR8:** Usuário pode conceder ou negar geolocalização sem perder acesso ao app
- **FR9:** O sistema oferece navegação manual por filtro quando geolocalização é indisponível ou negada
- **FR10:** O sistema calcula e exibe distância em metros (< 1km) ou quilômetros

### Descoberta e Filtro

- **FR11:** Usuário pode filtrar fontes por cidade ou região via seletor
- **FR12:** Usuário pode buscar cidade/região por texto livre no seletor
- **FR13:** O sistema exibe mensagem clara quando nenhuma fonte corresponde ao filtro
- **FR14:** Usuário pode limpar o filtro e retornar à visão global do mapa

### Informação da Fonte

- **FR15:** Usuário pode selecionar uma fonte no mapa para ver seus detalhes
- **FR16:** Usuário visualiza o endereço completo da fonte selecionada
- **FR17:** Usuário visualiza a cidade/região da fonte selecionada
- **FR18:** Usuário visualiza o status atual da fonte (ativa/inativa)
- **FR19:** Usuário visualiza a distância da fonte em relação à sua posição
- **FR20:** Usuário pode fechar o card e retornar à navegação do mapa

### Dados e Integração

- **FR21:** O sistema carrega dados de um endpoint GeoJSON público configurável
- **FR22:** O sistema processa e normaliza o GeoJSON para exibição no mapa e nos cards
- **FR23:** O sistema exibe erro compreensível quando os dados não podem ser carregados
- **FR24:** O sistema exibe o timestamp do último carregamento dos dados

### Acessibilidade e Compatibilidade

- **FR25:** Elementos interativos possuem nomes acessíveis para leitores de tela (`aria-label`)
- **FR26:** Imagens e ícones possuem texto alternativo (`alt`)
- **FR27:** Estrutura de headings da página é semântica e hierárquica
- **FR28:** Foco de teclado visível nos controles principais (filtro, botões, cards)
- **FR29:** Layout se adapta automaticamente ao tamanho da tela (mobile, tablet, desktop)
- **FR30:** App funcional em iOS Safari e Android Chrome (últimas 2 versões)

### SEO e Distribuição

- **FR31:** Sistema expõe metadados de SEO básico: título, meta description, Open Graph tags
- **FR32:** App distribuível como site estático sem servidor back-end

---

## Requisitos Não-Funcionais

### Performance

- **NFR1:** Mapa e marcadores exibidos em < 3s em conexão 3G/4G, medido via Lighthouse throttling
- **NFR2:** Interações com o mapa (zoom, pan, seleção) respondem em < 100ms
- **NFR3:** Cálculo de distância e reordenação das fontes concluídos em < 500ms após obter localização
- **NFR4:** Bundle de produção ≤ 500KB gzip
- **NFR5:** Lighthouse Performance Score ≥ 80 em perfil mobile (throttling 3G)
- **NFR6:** First Contentful Paint < 2s em conexão 4G

### Acessibilidade

- **NFR7:** Conformidade WCAG 2.1 Nível A em todos os controles principais, verificada por auditoria Lighthouse
- **NFR8:** Todos os controles interativos operáveis via teclado (Tab, Enter, Escape)
- **NFR9:** Fluxos críticos compatíveis com VoiceOver (iOS) e TalkBack (Android)

### Confiabilidade e Disponibilidade

- **NFR10:** Falha no fetch do GeoJSON exibe erro descritivo — sem tela em branco ou exceção não tratada
- **NFR11:** Bloqueio da Geolocation API não impede o uso do app — fallback por filtro ativado automaticamente
- **NFR12:** Disponibilidade ≥ 99,9% garantida pelo SLA do CDN (Netlify/GitHub Pages)

### Integração de Dados

- **NFR13:** Fetch do GeoJSON via HTTPS com timeout de 10 segundos; erro exibido após timeout
- **NFR14:** URL do endpoint GeoJSON configurável via variável de ambiente no build — sem hardcode
- **NFR15:** App funcional com qualquer dataset GeoJSON no formato Feature Collection com geometria Point

### Manutenibilidade

- **NFR16:** Código TypeScript compila sem erros em modo strict (`tsc --noEmit`)
- **NFR17:** Documentação em `docs/` cobre: setup local, estrutura do projeto e processo de deploy
