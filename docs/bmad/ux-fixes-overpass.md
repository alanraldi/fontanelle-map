# Plano: Correções de UX — fluidez, erros e BottomSheet

## Context

Após implementação do carregamento dinâmico por viewport, o usuário reportou três problemas:
1. Filtros ocultos — BottomSheet começa colapsado (64px), os FilterChips ficam invisíveis
2. Erros e travamentos — overlay de erro bloqueia o mapa; request Overpass pode falhar (406/timeout)
3. Não fluido — FountainList mostra skeleton toda vez que o usuário arrasta (mesmo com dados anteriores)

## Correções

### 1. `src/components/BottomSheet/index.tsx`
Mudar estado inicial de `false` para `true`:
```ts
const [isExpanded, setIsExpanded] = useState(true)
```

### 2. `src/components/MapView/index.tsx`
Remover completamente o overlay de erro do MapView. Deixar apenas o MapContainer:
```tsx
return (
  <div className="absolute inset-0 z-0">
    <div aria-hidden="true" className="absolute inset-0">
      <MapContainer ...>...</MapContainer>
    </div>
  </div>
)
```

### 3. `src/components/FountainList/index.tsx`
Só mostrar skeleton quando carregando E sem dados anteriores:
```tsx
if (loadingState === 'loading' && fountains.length === 0) {
  return <LoadingSkeleton />
}
```

### 4. `src/hooks/useFountainsByBounds.ts`
- Body do fetch: raw query sem `data=` prefix
- Remover `Content-Type: application/x-www-form-urlencoded`
- Aumentar timeout de `10_000` para `25_000` ms

### 5. `src/App.tsx`
Aumentar debounce de 500ms para 1000ms.

## Arquivos modificados

| Arquivo | Mudança |
|---------|---------|
| `src/components/BottomSheet/index.tsx` | `isExpanded = true` inicial |
| `src/components/MapView/index.tsx` | Remover overlay de erro |
| `src/components/FountainList/index.tsx` | Skeleton só quando loading + sem dados |
| `src/hooks/useFountainsByBounds.ts` | Raw body POST, timeout 25s |
| `src/App.tsx` | Debounce 1000ms |

## Verificação

1. `npm run typecheck` — sem erros
2. `npm test -- --run` — 57+ testes passando
3. Browser: BottomSheet começa expandido mostrando filtros
4. Arrastar mapa: lista anterior visível (sem flash de skeleton)
5. Erro Overpass: mapa continua interativo (sem overlay bloqueante)
