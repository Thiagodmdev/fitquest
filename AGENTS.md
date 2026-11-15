# Escopo: SOMENTE a camada de dados (Firebase / Firestore)

Leia e siga também o CLAUDE.md. Em caso de conflito, vale o mais restrito.

## Pode mexer
- src/services/api.ts, firebaseApi.ts, demoApi.ts
- firestore.rules e firestore.indexes.json
- Tipos dos dados (modelos de treino e rotina)
- .env.example (só para variável nova, sempre vazia)

## NÃO pode mexer
- src/components, src/pages, src/App.tsx, index.css (interface e design)
- src/lib/gamification.ts e src/lib/dates.ts
- AuthContext, ProtectedRoute, hooks e contextos: apenas LISTE o que precisaria mudar e espere minha decisão
- package.json: não adicionar nem remover bibliotecas

## Regras do projeto que continuam valendo
- Toda operação nova vai para firebaseApi.ts E demoApi.ts. O modo demo precisa continuar funcionando.
- XP, nível e conquistas NÃO são salvos no Firestore; continuam calculados por computeProgress.
- Caminhos: users/{uid}/workouts e users/{uid}/routines. Se mudar, atualizar firestore.rules junto.
- Datas só com src/lib/dates.ts (formato AAAA-MM-DD), nunca new Date('AAAA-MM-DD') nem toISOString().
- Somente TypeScript, sem .js/.jsx em src.
- Textos, comentários e mensagens de erro em português do Brasil; nomes de código em inglês.

## Segurança
- Nunca ler nem commitar .env.local; nunca colar chaves no código, README ou issues.
- As firestore.rules devem garantir que cada usuário acesse apenas os próprios dados.

## Como trabalhar
- Antes de editar, liste os arquivos que pretende tocar e espere minha aprovação.
- Se algo fora do escopo precisar mudar, NÃO faça: descreva o que seria necessário.
- Tudo que exigir ação manual minha (console do Firebase, publicar regras, índices, preencher .env.local) deve ser listado por você, em ordem, com o passo a passo.
- Nunca rode comandos que apaguem dados ou coleções sem me perguntar.
- Ao terminar: npm run build e npm run lint sem erros novos.
- Commits pequenos, em português e no imperativo, só na branch atual (nunca na main).