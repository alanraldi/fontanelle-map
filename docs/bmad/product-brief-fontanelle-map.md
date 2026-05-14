---
title: "Product Brief: Fontanelle Map"
status: "aprovado"
created: "2026-05-13"
updated: "2026-05-13"
fase: "Analyst (Fase 1)"
inputs: ["requisitos fornecidos pelo usuário", "https://raw.githubusercontent.com/deinic/fontanelle/main/fontanelle.json"]
---

# Product Brief: Fontanelle Map

## Resumo Executivo

O **Fontanelle Map** é uma aplicação web responsiva que permite a qualquer pessoa localizar rapidamente fontes de água pública (fontanelle) próximas à sua localização, explorá-las por região e verificar seu estado de funcionamento. O projeto transforma um conjunto de dados geográficos públicos — disponível em formato GeoJSON no GitHub — em uma experiência visual, moderna e acessível via navegador, sem necessidade de instalação.

Em cidades europeias como Roma, Milão e outras regiões italianas, as fontanelle fazem parte do patrimônio urbano e são amplamente utilizadas por moradores e turistas. Apesar da existência do dado, não há hoje uma interface amigável e orientada ao usuário que permita encontrar a fonte mais próxima com um clique. O Fontanelle Map resolve esse problema diretamente.

O projeto será construído com uma stack moderna e leve (Vite + React + TypeScript + Leaflet), rodará inteiramente no browser sem back-end proprietário, e poderá ser hospedado de forma gratuita em plataformas como GitHub Pages ou Netlify.

---

## O Problema

**Quem sente a dor:** turistas explorando a cidade, ciclistas e corredores em trajeto, moradores que querem uma alternativa à água engarrafada, e cidadãos com consciência ambiental.

**A situação hoje:** o dado das fontanelle existe em repositórios públicos no GitHub (formato GeoJSON), mas está inacessível para o usuário comum — exige conhecimento técnico para consumir, não tem interface visual, não considera a localização do usuário e não permite filtros por cidade ou status.

**As consequências do status quo:**
- Usuários não sabem onde estão as fontanelle próximas
- Mesmo quem conhece o dado não consegue usá-lo em movimento
- Fontes funcionando e fora de serviço são indistinguíveis sem consulta técnica
- Não há uma forma de descobrir fontes em uma cidade desconhecida antes de uma visita

---

## A Solução

O Fontanelle Map consome o JSON público, plota todas as fontes em um mapa interativo com Leaflet.js, e usa a Geolocation API do navegador para:

1. **Localizar o usuário** automaticamente (com fallback manual)
2. **Ordenar as fontes por distância** e exibir as mais próximas em destaque
3. **Filtrar por cidade ou região** com um seletor simples
4. **Exibir um card informativo** para cada fonte: endereço, cidade, status (ativa/inativa), imagem quando disponível, e distância calculada em tempo real

A experiência é inteiramente browser-first: sem login, sem cadastro, sem instalação. O mapa carrega instantaneamente e funciona tanto em desktop quanto em celular.

---

## O Que Torna Este Produto Diferente

| Fator | Situação Atual | Fontanelle Map |
|---|---|---|
| Acesso ao dado | Somente via JSON bruto no GitHub | Interface visual imediata |
| Localização do usuário | Não existe | Geolocalização nativa do browser |
| Fontes próximas | Impossível sem cálculo manual | Ordenação automática por distância |
| Filtro por região | Não existe | Seletor por cidade/região |
| Status da fonte | Oculto no JSON | Exibido no card com cor/ícone |
| Responsividade | Não aplicável | Mobile-first, funciona no bolso |

O diferencial principal é a **zero fricção**: o usuário abre a URL e em segundos sabe onde está a fonte mais próxima.

---

## Para Quem Serve

**Usuário primário — O Caminhante:**
Turista ou morador que está em movimento (a pé, de bicicleta) e precisa de água. Abre o site no celular, vê as fontes próximas, vai direto à mais conveniente. Não quer cadastro nem complexidade.

**Usuário secundário — O Explorador Regional:**
Viajante planejando uma visita a uma cidade italiana. Quer conhecer as fontanelle da região antes de chegar. Usa o filtro por cidade para visualizar a distribuição e planejar rotas.

**Usuário terciário — O Cidadão Consciente:**
Morador que prefere não comprar água engarrafada. Usa o app com frequência para encontrar fontes no caminho do trabalho ou corrida.

---

## Critérios de Sucesso

**Para o usuário:**
- Encontrar a fonte mais próxima em menos de 10 segundos após abrir o site
- O mapa carrega em menos de 3 segundos em conexão móvel (3G/4G)
- A interface funciona corretamente em iOS Safari e Android Chrome
- O filtro por cidade retorna resultados corretos e sem erros

**Para o produto:**
- 100% das fontes do dataset são exibidas no mapa
- Geolocalização funciona sem erros em browsers modernos (com fallback elegante quando negada)
- Zero dependências de back-end proprietário (deploy estático)
- Código documentado e passível de extensão por contribuidores

---

## Escopo da Versão 1

**Inclui:**
- Mapa interativo com todas as fontanelle do dataset
- Geolocalização do usuário (browser API)
- Cálculo e exibição de distância das fontes ao usuário
- Filtro por cidade/região
- Card da fonte: endereço, cidade, status, imagem (se disponível), distância
- Layout responsivo (mobile + desktop)
- Hospedagem estática (sem servidor)
- Documentação técnica na pasta `docs/`

**Fora do escopo (v1):**
- Edição ou contribuição de dados pelos usuários
- Notificações push ou alertas
- Autenticação / perfis de usuário
- Histórico de visitas ou favoritos
- Suporte a múltiplos países ou datasets
- Modo offline completo (PWA)

---

## Visão

Se o projeto for bem-sucedido, o Fontanelle Map pode se tornar a referência de consulta pública para fontanelle na Itália — e eventualmente ser expandido para outras cidades europeias com datasets similares. A arquitetura stateless e baseada em JSON público facilita a contribuição da comunidade para enriquecer os dados (status em tempo real, fotos, avaliações).

Em 2-3 anos: uma plataforma colaborativa de fontes de água pública na Europa, com contribuições da comunidade e parceria com prefeituras para manutenção dos dados.

---

*Artefato gerado na Fase 1 (Analyst) do fluxo BMAD — pronto para entrada na Fase 2 (PM / PRD).*
