# Demonstração Prática dos Conceitos — MedMetrics

Este documento mapeia **cada conceito exigido** para implementação concreta no código, com **justificativa técnica** de por que foi aplicado daquela forma.

---

## 1. Clean Code (Código Limpo)

**O que é:** Escrever código legível, com nomes expressivos, funções pequenas e responsabilidades claras.

**Onde está no projeto:**

| Prática | Arquivo | Exemplo |
|---------|---------|---------|
| Nomes expressivos | `RegistrarAtendimento.js` | `execute(dadosEntrada)` descreve a intenção |
| Funções curtas | `Atendimento.js` | Validações isoladas no construtor da entidade |
| Separação de camadas | `domain/`, `infrastructure/` | Regras de negócio separadas de HTTP e banco |
| Sem comentários óbvios | Todo o projeto | Código autoexplicativo; comentários só em padrões arquiteturais |

**Justificativa:** Em sistemas de saúde pública (DEGASE), regras de domínio mudam com frequência (novos tipos de atendimento, equipes). Código limpo reduz o custo de manutenção e facilita auditorias LGPD.

---

## 2. SOLID

### S — Single Responsibility (Responsabilidade Única)
- **`Atendimento.js`**: apenas valida e representa um atendimento.
- **`RegistrarAtendimento.js`**: apenas orquestra o registro.
- **`authController.js`**: apenas rotas HTTP de autenticação.

### O — Open/Closed (Aberto/Fechado)
- Novos tipos de atendimento são adicionados em `tipoAtendimento.js` sem alterar a entidade.
- Novos repositórios (ex.: PostgreSQL) podem ser criados sem mudar o UseCase.

### L — Liskov Substitution (Substituição de Liskov)
- `MockAtendimentoRepository` substitui `AtendimentoRepository` nos testes sem quebrar o UseCase.

### I — Interface Segregation (Segregação de Interface)
- `IAtendimentoRepository.js` expõe apenas `salvar()` e `listarTodos()` — nada além do necessário.

### D — Dependency Inversion (Inversão de Dependência)
- O UseCase recebe o repositório via construtor, não instancia o MongoDB:

```javascript
// domain/usecases/RegistrarAtendimento.js
constructor(atendimentoRepository) {
  this.atendimentoRepository = atendimentoRepository;
}
```

**Justificativa:** SOLID garante que cada microsserviço evolua independentemente — auth e analytics podem ser escalados, testados e substituídos sem efeito cascata.

---

## 3. Design Patterns (Padrões de Projeto)

| Padrão | Onde | Justificativa |
|--------|------|---------------|
| **Repository** | `AtendimentoRepository.js` | Abstrai persistência MongoDB; domínio não conhece Mongoose |
| **Dependency Injection** | `app.js` + `RegistrarAtendimento.js` | Composição na camada de infraestrutura; testabilidade |
| **Singleton** | `MongoConnection.js` | Uma conexão MongoDB por processo — evita esgotamento de sockets |
| **Proxy / Decorator** | `GuardedRoute` em `App.jsx` | Intercepta rotas protegidas antes da renderização (RBAC) |

---

## 4. TDD (Test-Driven Development)

**Metodologia:** Escrever o teste **antes** (ou junto) da implementação; o teste guia o design.

**Suíte de testes unitários:**

```
analytics-service/src/tests/
├── Atendimento.test.js          ← Entidade de domínio (validações)
├── RegistrarAtendimento.test.js ← UseCase com Mock Repository
└── mocks/MockAtendimentoRepository.js
```

**Como executar:**

```bash
cd analytics-service
npm install
npm test
```

**Exemplo TDD — teste do UseCase com mock (sem banco real):**

```javascript
// Inject mock → execute → assert
const mockRepository = new MockAtendimentoRepository();
const useCase = new RegistrarAtendimento(mockRepository);
const resultado = await useCase.execute(dadosValidos);
expect(mockRepository.registros).toHaveLength(1);
```

**Justificativa:** Regras clínicas (equipes permitidas, tipos de atendimento) são críticas. TDD garante que mudanças futuras não quebrem validações silenciosamente.

---

## 5. BDD (Behavior-Driven Development)

**Metodologia:** Descrever comportamento em linguagem natural (Gherkin) compreensível por negócio e desenvolvimento.

**Arquivos BDD:**

```
analytics-service/src/tests/
├── features/registrar_atendimento.feature  ← Cenários em português
└── bdd/registrarAtendimento.steps.js       ← Step definitions executáveis
```

**Cenário executável (Gherkin):**

```gherkin
Cenário: Registro de atendimento realizado com sucesso
  Dado que o usuário está autenticado com o perfil de "TECNICO"
  E preenche o formulário com o ID do adolescente "5005"
  ...
  Quando ele executa o caso de uso "RegistrarAtendimento"
  Então o sistema deve salvar o registro com sucesso
```

**Justificativa:** Técnicos e gestores do DEGASE validam requisitos em linguagem de negócio. BDD fecha a lacuna entre especificação e código executável.

---

## 6. Arquitetura Limpa (Clean Architecture)

**Camadas do Analytics-Service:**

```
src/
├── domain/           ← Regras de negócio puras (núcleo)
│   ├── entities/     ← Atendimento
│   ├── enums/        ← TipoAtendimento
│   ├── ports/        ← IAtendimentoRepository (contrato)
│   └── usecases/     ← RegistrarAtendimento
└── infrastructure/   ← Detalhes técnicos (borda)
    └── database/mongodb/
        ├── AtendimentoRepository.js  ← Implementação concreta
        └── MongoConnection.js
```

**Regra de dependência:** `domain` **nunca** importa `infrastructure`. Apenas o inverso.

**Fluxo de uma requisição:**

```
HTTP POST → app.js → RegistrarAtendimento → Atendimento (validação)
                              ↓
                    AtendimentoRepository → MongoDB
```

**Justificativa:** Separar domínio de infraestrutura permite trocar MongoDB por outro banco, ou adicionar filas/eventos, sem reescrever regras clínicas.

---

## 7. Microsserviços

**Divisão por bounded context:**

| Serviço | Responsabilidade | Banco | Porta |
|---------|------------------|-------|-------|
| `auth-service` | Autenticação, RBAC, CRUD usuários | PostgreSQL | 3001 |
| `analytics-service` | Registro e indicadores clínicos | MongoDB | 3002 |
| `frontend` | Interface React (SPA) | — | 3000 |

**Comunicação:** REST via HTTP; JWT compartilhado (`JWT_SECRET`) para autorização entre serviços.

**Justificativa:** Autenticação (dados sensíveis, transacional) e analytics (volume alto, schema flexível) têm perfis de carga e conformidade distintos — microsserviços permitem escalar e auditar cada um separadamente.

---

## 8. Docker

**Orquestração:** `docker-compose.yml` na raiz sobe 5 containers:

```
postgres → auth-service → frontend
mongodb  → analytics-service ↗
```

**Cada serviço possui Dockerfile:**

| Serviço | Estratégia |
|---------|------------|
| `auth-service/Dockerfile` | Node 24 Alpine, produção |
| `analytics-service/Dockerfile` | Node 24 Alpine, produção |
| `frontend/Dockerfile` | Multi-stage: build Vite + Nginx |

**Como subir localmente:**

```bash
docker compose up --build
```

Acesse: `http://localhost:3000`

**Justificativa:** Ambiente idêntico em dev, teste e produção — elimina o problema "na minha máquina funciona".

---

## 9. Deploy em Servidor

**Plataforma:** [Render](https://render.com) via `render.yaml` (Infrastructure as Code).

| Serviço Render | Tipo | Runtime |
|----------------|------|---------|
| `medmetrics-frontend` | Static Site | Node build → dist |
| `medmetrics-auth-service` | Web Service | Node nativo |
| `medmetrics-analytics-service` | Web Service | **Docker** (lê Dockerfile) |

**Bancos em produção (multi-cloud):**
- PostgreSQL: Supabase ou Neon.tech
- MongoDB: MongoDB Atlas

**Variáveis de ambiente necessárias:**

```
# Auth
DATABASE_URL=postgres://...
JWT_SECRET=...
PORT=3001

# Analytics
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
PORT=3002

# Frontend (build time)
VITE_API_AUTH_URL=https://medmetrics-auth-service.onrender.com
VITE_API_ANALYTICS_URL=https://medmetrics-analytics-service.onrender.com
```

**Justificativa:** Deploy declarativo (`render.yaml`) versionado no Git garante reprodutibilidade. O analytics-service usa Docker no Render para paridade total com o ambiente local.

---

## Credenciais de Demonstração

| Perfil | ID Institucional | Senha |
|--------|------------------|-------|
| Diretor Técnico | 1001 | Med@123 |
| Técnico de Saúde | 2002 | Med@123 |

---

## Comandos Rápidos

```bash
# Subir tudo com Docker
docker compose up --build

# Rodar testes TDD + BDD
cd analytics-service && npm test

# Health checks
curl http://localhost:3001/health
curl http://localhost:3002/health
```
