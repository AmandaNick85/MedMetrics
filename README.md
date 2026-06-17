# MedMetrics

Sistema para registro e acompanhamento de atendimentos das equipes **Técnica Multidisciplinar** e **Saúde Mental** do Novo DEGASE.

---

## Pré-requisitos

- [Docker](https://www.docker.com/) e Docker Compose instalados

Para rodar testes localmente (opcional): Node.js 20+ e npm.

---

## Subir o sistema

Na raiz do projeto:

```bash
docker compose up --build
```

Aguarde todos os containers iniciarem. Acesse: **http://localhost:3000**

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Auth API | http://localhost:3001/health |
| Analytics API | http://localhost:3002/health |

Para parar:

```bash
docker compose down
```

---

## Acesso ao sistema

Usuários criados automaticamente na primeira execução:

| Perfil | ID Institucional | Senha | Acesso |
|--------|------------------|-------|--------|
| Diretor Técnico | `1001` | `Med@123` | Gestão de servidores |
| Técnico de Saúde | `2002` | `Med@123` | Registro de atendimentos |

---

## Como usar

### Diretor Técnico

1. Faça login com o ID `1001`.
2. No painel, cadastre novos servidores (nome, ID institucional, senha e perfil).
3. Consulte a lista de servidores ativos e remova registros quando necessário.
4. O diretor master (`1001`) não pode ser excluído.

### Técnico de Saúde

1. Faça login com o ID `2002` (ou outro cadastrado como TÉCNICO).
2. Preencha o formulário de atendimento:
   - **ID do adolescente** (obrigatório)
   - **Equipe:** Equipe Técnica ou Saúde Mental
   - **Tipo:** Individual, Familiar, Em Grupo, Visita ou Visita Virtual
   - **Evolução clínica** (obrigatório)
3. Clique em **Salvar Atendimento**. O registro é validado e persistido no MongoDB.

---

## Rodar testes

```bash
cd analytics-service
npm install
npm test
```

Executa testes unitários (TDD) e cenários de comportamento (BDD) do módulo de analytics.

---

## Estrutura do projeto

```
medmetrics-root/
├── frontend/           → Interface React (porta 3000)
├── auth-service/       → Autenticação e usuários (porta 3001)
├── analytics-service/  → Registro de atendimentos (porta 3002)
├── docker-compose.yml  → Orquestração local
└── render.yaml         → Deploy em produção (Render)
```

---

## Deploy em produção

O arquivo `render.yaml` mantido apenas como referência de infraestrutura.
O deploy atual é realizado através da configuração manual dos serviços no [Render](https://render.com): frontend (site estático), auth-service e analytics-service (Docker).

Variáveis necessárias em produção:

| Serviço | Variáveis |
|---------|-----------|
| auth-service | `DATABASE_URL`, `JWT_SECRET`, `PORT=3001` |
| analytics-service | `MONGO_URI`, `JWT_SECRET`, `PORT=3002` |
| frontend | `VITE_API_AUTH_URL`, `VITE_API_ANALYTICS_URL` |

Bancos recomendados: PostgreSQL (Supabase/Neon) para auth; MongoDB Atlas para analytics.

---

## Documentação técnica

Detalhes de arquitetura, SOLID, Design Patterns, TDD e BDD estão nos documentos:

- [`docs/DEMONSTRACAO_CONCEITOS.md`](docs/DEMONSTRACAO_CONCEITOS.md)
- [`docs/JUSTIFICATIVA_TECNICA.md`](docs/JUSTIFICATIVA_TECNICA.md)
