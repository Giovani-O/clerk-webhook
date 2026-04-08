# Clerk Webhook Demo

Projeto de demonstração do ciclo completo de um webhook: um evento ocorre no Clerk, uma requisição HTTP assinada é entregue ao backend, o payload é verificado e persistido, e o frontend exibe o resultado em tempo quase real.

Feito como ferramenta de ensino para desenvolvedores que estão aprendendo como webhooks funcionam na prática.

---

## O que o projeto faz

- Recebe eventos `user.created`, `user.updated` e `user.deleted` enviados pelo Clerk via Svix
- Verifica a assinatura de cada requisição antes de persistir qualquer dado
- Armazena os eventos em um banco SQLite local
- Exibe os eventos em um inspetor no frontend, com atualização automática a cada 1.5 segundos
- Permite acionar os eventos diretamente pela interface: basta criar conta, atualizar perfil ou deletar a conta

---

## Estrutura do repositório

```
clerk-webhook/
├── apps/
│   ├── backend/    # Servidor Fastify (porta 3001)
│   └── frontend/   # App React + Vite (porta 5173)
└── packages/
    └── types/      # Schemas Zod e tipos TypeScript compartilhados
```

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) v20 ou superior
- [pnpm](https://pnpm.io/) v8 ou superior
- [ngrok](https://ngrok.com/) — necessário para expor o backend à internet e receber webhooks do Clerk
- Uma conta no [Clerk](https://clerk.com/) com um projeto criado

---

## Configuração das variáveis de ambiente

### Backend — `apps/backend/.env`

Crie o arquivo copiando o exemplo:

```bash
cp apps/backend/.env.example apps/backend/.env
```

Preencha os valores:

```bash
CLERK_WEBHOOK_SIGNING_SECRET=whsec_...   # Clerk Dashboard → Webhooks → seu endpoint → Signing Secret
PORT=3001
```

> O `CLERK_WEBHOOK_SIGNING_SECRET` só estará disponível após criar o endpoint de webhook no Clerk Dashboard (veja o passo a passo abaixo).

### Frontend — `apps/frontend/.env`

Crie o arquivo copiando o exemplo:

```bash
cp apps/frontend/.env.example apps/frontend/.env
```

Preencha os valores:

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...   # Clerk Dashboard → API Keys
VITE_API_URL=http://localhost:3001
```

---

## Como rodar

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Compilar o pacote de tipos compartilhados

```bash
pnpm --filter @clerk-webhook/types build
```

### 3. Iniciar o backend

```bash
pnpm --filter backend dev
```

O servidor sobe na porta `3001`.

### 4. Iniciar o frontend

```bash
pnpm --filter frontend dev
```

O app estará disponível em `http://localhost:5173`.

### 5. Criar o túnel com ngrok

O Clerk precisa de uma URL pública para entregar os webhooks. O ngrok cria um túnel do seu localhost para a internet:

```bash
ngrok http 3001
```

O ngrok exibirá uma URL pública no formato `https://xxxx.ngrok.io`. Guarde essa URL.

### 6. Configurar o webhook no Clerk Dashboard

1. Acesse o [Clerk Dashboard](https://dashboard.clerk.com/)
2. Vá em **Webhooks** e clique em **Add Endpoint**
3. Informe a URL: `https://xxxx.ngrok.io/webhooks/clerk`
4. Selecione os eventos: `user.created`, `user.updated`, `user.deleted`
5. Salve o endpoint
6. Copie o **Signing Secret** exibido e cole em `CLERK_WEBHOOK_SIGNING_SECRET` no `apps/backend/.env`
7. Reinicie o backend para carregar a variável atualizada

### 7. Testar

Abra `http://localhost:5173`, crie uma conta pelo painel esquerdo e observe o evento aparecer no inspetor à direita.

---

## Observações

- O ngrok precisa estar rodando sempre que você quiser receber webhooks. A URL muda a cada reinicialização do ngrok na conta gratuita — se isso acontecer, atualize o endpoint no Clerk Dashboard.
- O banco SQLite é criado automaticamente em `apps/backend/data/webhook_events.sqlite` na primeira execução.
- O botão de reset no frontend chama `DELETE /api/events` e apaga todos os eventos armazenados.
