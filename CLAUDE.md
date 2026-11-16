# FitQuest

Trabalho final da disciplina Front-end Frameworks (AV2), feito em grupo de 5 alunos. É um app de gestão de treinos com gamificação, em React 19, TypeScript, Vite, React Router, Firebase e Recharts.

**Prazo de entrega: 18/11/2026.** Até lá, prefira corrigir e polir o que existe em vez de adicionar funcionalidades grandes.

## Comandos

```bash
npm install      # uma vez, depois de clonar
npm run dev      # servidor local em http://localhost:5173
npm run build    # checagem de tipos e build de produção
npm run lint     # oxlint
```

Antes de dizer que uma tarefa terminou, `npm run build` e `npm run lint` precisam passar sem erros novos. O projeto não tem testes automatizados, então confira as mudanças de interface no navegador.

## Requisitos do trabalho que não podem quebrar

A nota depende destes mínimos. Nenhuma mudança pode deixar o projeto abaixo deles:

- Pelo menos 8 componentes funcionais. Hoje são 10, 2 por integrante, em `src/components`.
- Pelo menos 5 páginas com rotas. Hoje são 7, em `src/pages`, com as rotas em `src/App.tsx`.
- Pelo menos 4 hooks diferentes. Hoje são `useState`, `useEffect`, `useContext`, `useRef`, `useMemo`, `useCallback` e os hooks próprios de `src/hooks`.
- Todo o código em TypeScript. Não crie arquivos `.js` ou `.jsx` em `src`.

## Quem cuida de cada componente

Cada integrante desenvolve e explica 2 componentes e 2 hooks na apresentação. Não renomeie, apague, junte ou reescreva por inteiro o componente de outra pessoa sem que ela concorde, porque é ela quem vai explicar o código. Correções pequenas podem ser feitas, mas avise o responsável.

| Integrante | Componentes | Hooks |
|---|---|---|
| Thiago Victor | `Navbar`, `ProtectedRoute` | `useNavigate`, `useLocation` |
| Eduardo Martins | `WorkoutForm`, `ExerciseRow` | `useEffect`, `useRef` |
| Esdras Elohim | `WorkoutCard`, `RoutineCard` | `useContext`, `useTraining` |
| Ruan Bandeira | `ProgressChart`, `StatCard` | `useState`, `useMemo` |
| Sara | `XPBar`, `AchievementBadge` | `useGamification`, `useLocalStorage` |

Os arquivos onde cada hook aparece estão na seção "Onde mostrar cada hook na apresentação" do `README.md`. Não remova nem mova o uso de um desses hooks sem avisar quem vai apresentá-lo, e mantenha essa seção atualizada se o arquivo mudar.

Se a divisão mudar, atualize esta tabela, as tabelas de integrantes do `README.md` e a da proposta em `docs/proposta/proposta.html`.

## Arquitetura

- `src/components`: os 10 componentes do grupo.
- `src/pages`: uma página por rota.
- `src/contexts`: `AuthContext` (usuário logado) e `TrainingContext` (treinos e rotinas do usuário).
- `src/hooks`: `useAuth`, `useTraining`, `useGamification` e `useLocalStorage`. As telas leem dados por esses hooks, não direto dos contextos ou dos serviços.
- `src/services/api.ts`: define a interface `Api` e escolhe a implementação. Se `VITE_FIREBASE_API_KEY` existir, usa `firebaseApi.ts`; se não, usa `demoApi.ts`, que guarda tudo no localStorage.
- `src/lib/gamification.ts`: regras de XP, níveis, sequência, recordes e conquistas, como funções puras.
- `src/lib/dates.ts`: datas no formato `AAAA-MM-DD`, sempre no fuso local.

### Regras que evitam bugs

- **Toda operação de dados nova vai para os dois serviços.** Se adicionar algo à interface `Api`, implemente em `firebaseApi.ts` e em `demoApi.ts`. O modo demonstração precisa continuar funcionando, porque é o plano B da apresentação.
- **XP, nível e conquistas não são salvos no banco.** Eles são recalculados a partir da lista de treinos por `computeProgress`. Não crie campos de XP no Firestore.
- **As regras de XP ficam nas constantes exportadas de `gamification.ts`.** Se mudar algum valor, atualize também as tabelas de XP do `README.md` e de `docs/proposta/proposta.html`. A página de conquistas já lê as constantes.
- **Os dados ficam em `users/{uid}/workouts` e `users/{uid}/routines`.** Se mudar esses caminhos, atualize `firestore.rules` junto.
- **Datas:** use as funções de `src/lib/dates.ts`. Não use `new Date('AAAA-MM-DD')` nem `toISOString()` para datas de treino, porque eles convertem para UTC e mudam o dia.

## Convenções

- Textos da interface, comentários e mensagens de erro em português do Brasil. Nomes de variáveis, funções e componentes em inglês.
- Somente componentes funcionais, com as props tipadas por `interface`.
- Os estilos ficam em `src/index.css` e usam as variáveis de `:root`, como `--accent` e `--surface`. Não crie cores soltas nem arquivos CSS por componente.
- Não adicione bibliotecas novas sem o grupo concordar. Cada dependência é mais uma coisa para explicar na apresentação.
- Mantenha o layout funcionando em celular, a partir de 375px de largura, sem rolagem lateral.

## Segredos e Firebase

- A configuração do Firebase fica em `.env.local`, que o `.gitignore` já ignora. **Nunca faça commit de `.env.local`** nem cole as chaves no código, no README ou em issues.
- As variáveis esperadas estão em `.env.example`. Se criar uma variável nova, adicione-a lá, vazia.
- No deploy, as variáveis são cadastradas no painel da Vercel, não no repositório.

## Git e GitHub

- Não faça commit direto na `main`. Crie uma branch por tarefa, como `feat/grafico-volume` ou `fix/login-erro`, e abra um pull request para outra pessoa revisar.
- Nunca use `git push --force` na `main` nem reescreva o histórico de uma branch que outra pessoa esteja usando.
- Faça `git pull` antes de começar e mantenha cada commit pequeno e focado em uma coisa.
- Escreva as mensagens de commit em português e no imperativo, por exemplo: `Corrige cálculo da sequência semanal`.
- `node_modules`, `dist` e `.env.local` não vão para o repositório.

## Documentação

- `README.md`: instruções de instalação, integrantes, requisitos e telas. A entrega exige que ele esteja completo.
- `docs/telas`: prints usados no README e na proposta. Se uma tela mudar bastante, atualize o print.
- `docs/proposta/proposta.html`: texto da proposta. O PDF `docs/proposta-fitquest.pdf` é gerado a partir dele com o Microsoft Edge:

```bash
"/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" --headless --disable-gpu --no-pdf-header-footer --virtual-time-budget=8000 --print-to-pdf="C:/dev/fitquest/docs/proposta-fitquest.pdf" "file:///C:/dev/fitquest/docs/proposta/proposta.html"
```

Esse caminho vale para a máquina em que o projeto foi criado. Em outro computador, ajuste os caminhos.
