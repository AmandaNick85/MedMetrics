# Justificativa Técnica das Escolhas Realizadas — MedMetrics

**Projeto:** MedMetrics — Sistema de Gestão de Saúde e Analytics (Novo DEGASE)  
**Escopo:** Métricas de atendimentos da Equipe Técnica Multidisciplinar e Saúde Mental do DEGASE  
**Versão do documento:** 1.0

---

## Sumário

1. [Descrição do Problema Escolhido](#1-descrição-do-problema-escolhido)
2. [Divisão da Solução em Microsserviços](#2-divisão-da-solução-em-microsserviços)
3. [Organização do Projeto com Arquitetura Limpa](#3-organização-do-projeto-com-arquitetura-limpa)
4. [Aplicação dos Princípios SOLID](#4-aplicação-dos-princípios-solid)
5. [Aplicação de Design Patterns](#5-aplicação-de-design-patterns)
6. [Evidências de Clean Code](#6-evidências-de-clean-code)
7. [Testes Criados com TDD](#7-testes-criados-com-tdd)
8. [Cenários de Comportamento com BDD](#8-cenários-de-comportamento-com-bdd)

---

## 1. Descrição do Problema Escolhido

### 1.1 Contexto institucional

O **DEGASE** (Departamento Geral de Ações Socioeducativas) é responsável pelo acompanhamento de adolescentes em cumprimento de medidas socioeducativas no estado do Rio de Janeiro. Dentro dessa estrutura, duas frentes operacionais são centrais para a qualidade do cuidado:

- **Equipe Técnica Multidisciplinar** — profissionais de assistência social, pedagogia e áreas correlatas que registram intervenções individuais, familiares, em grupo e visitas presenciais ou virtuais.
- **Equipe de Saúde Mental** — psicólogos e profissionais de saúde mental que acompanham a evolução clínica e psicossocial dos adolescentes.

Atualmente, o registro desses atendimentos costuma ocorrer de forma fragmentada: planilhas isoladas, sistemas legados acoplados ou anotações em papel. Isso dificulta a consolidação de **métricas de atendimento** — indicadores como volume por equipe, tipo de intervenção, evolução por adolescente e produtividade por técnico responsável.

### 1.2 Problema identificado

| Dificuldade | Impacto |
|-------------|---------|
| Registros dispersos e não padronizados | Impossibilita comparar indicadores entre unidades |
| Sistemas monolíticos que misturam autenticação e analytics | Risco de vazamento de dados sensíveis (LGPD) |
| Ausência de validação de regras de negócio no registro | Dados inconsistentes (equipes ou tipos de atendimento inválidos) |
| Falta de controle de acesso por perfil (RBAC) | Técnicos e diretores compartilham as mesmas permissões |
| Dificuldade de escalar consultas analíticas | Relatórios degradam o desempenho do sistema transacional |

### 1.3 Proposta de solução — MedMetrics

O **MedMetrics** foi concebido para centralizar, validar e auditar os registros de atendimentos das equipes **EQUIPE_TECNICA** e **SAUDE_MENTAL**, permitindo:

1. **Registro padronizado** de atendimentos com validação de domínio (ID do adolescente, equipe, tipo de intervenção, evolução clínica).
2. **Controle de acesso** diferenciado entre Diretor Técnico (gestão de servidores) e Técnico de Saúde (lançamentos clínicos).
3. **Persistência analítica** em banco NoSQL (MongoDB), adequado ao volume e flexibilidade de schema dos registros clínicos.
4. **Separação arquitetural** entre autenticação (PostgreSQL) e analytics (MongoDB), garantindo conformidade regulatória e escalabilidade independente.

### 1.4 Justificativa da escolha do problema

A escolha deste domínio é tecnicamente relevante porque:

- Envolve **regras de negócio concretas** (equipes permitidas, tipos de atendimento enumerados) que exigem validação rigorosa no domínio.
- Possui **dois perfis de usuário distintos** (Diretor e Técnico), justificando RBAC e microsserviço de autenticação.
- Gera **dados analíticos de alto volume** com schema flexível, justificando banco document-oriented separado.
- É um cenário real de **setor público** com exigências de auditoria, LGPD e rastreabilidade.

---

## 2. Divisão da Solução em Microsserviços

### 2.1 Critério de decomposição

A divisão seguiu o princípio de **Bounded Contexts** (contextos delimitados do Domain-Driven Design): cada microsserviço possui um conjunto coeso de responsabilidades, banco de dados próprio e ciclo de deploy independente.

### 2.2 Mapa de microsserviços

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                   │
│              Porta 3000 — Interface do usuário               │
└──────────────┬──────────────────────────┬───────────────────┘
               │ HTTP/REST                │ HTTP/REST
               ▼                          ▼
┌──────────────────────────┐  ┌──────────────────────────────┐
│     AUTH-SERVICE          │  │     ANALYTICS-SERVICE         │
│  Node.js + Express        │  │  Node.js + Express            │
│  Porta 3001               │  │  Porta 3002                   │
│  PostgreSQL (Sequelize)   │  │  MongoDB (Mongoose)           │
│                           │  │  Clean Architecture             │
│  • Login / JWT            │  │  • Registrar atendimentos     │
│  • CRUD de servidores     │  │  • Validar regras de domínio  │
│  • RBAC (DIRETOR/TECNICO) │  │  • Persistir métricas clínicas│
└──────────────────────────┘  └──────────────────────────────┘
```

### 2.3 Detalhamento por serviço

| Microsserviço | Responsabilidade | Banco | Porta | Justificativa técnica |
|---------------|------------------|-------|-------|----------------------|
| **frontend** | SPA React com telas de login, painel do Diretor e painel do Técnico | — | 3000 | Camada de apresentação desacoplada; pode ser servida como site estático (Nginx) |
| **auth-service** | Autenticação JWT, cadastro e gestão de servidores, RBAC | PostgreSQL | 3001 | Dados transacionais, relacionais e sensíveis (credenciais); exige ACID |
| **analytics-service** | Registro e validação de atendimentos clínicos, base para métricas | MongoDB | 3002 | Alto volume, schema flexível, consultas analíticas sem impactar autenticação |

### 2.4 Comunicação entre serviços

- **Protocolo:** HTTP REST (JSON).
- **Autenticação cruzada:** token JWT emitido pelo `auth-service` e validado pelo `analytics-service` via `JWT_SECRET` compartilhado.
- **Orquestração local:** `docker-compose.yml` define rede interna (`medmetrics-network`) e dependências entre containers.
- **Deploy em produção:** `render.yaml` declara os três serviços de forma independente no Render.

### 2.5 Por que microsserviços e não monolito?

| Aspecto | Monolito | Microsserviços (escolha adotada) |
|---------|----------|----------------------------------|
| Escalabilidade | Escala tudo junto | Escala analytics independentemente de auth |
| Banco de dados | Um banco para tudo | PostgreSQL (transacional) + MongoDB (analítico) |
| Deploy | Uma falha derruba tudo | Falha isolada por serviço |
| Equipes | Um time no mesmo código | Times podem evoluir auth e analytics separadamente |
| Conformidade LGPD | Dados sensíveis misturados | Autenticação isolada com políticas distintas |

---

## 3. Organização do Projeto com Arquitetura Limpa

### 3.1 Princípio fundamental

A **Arquitetura Limpa** (Clean Architecture), proposta por Robert C. Martin, organiza o código em camadas concêntricas onde **as dependências apontam sempre para o centro** — o domínio. Frameworks, bancos de dados e interfaces HTTP são detalhes de implementação na borda externa.

### 3.2 Estrutura de pastas — Analytics-Service

O `analytics-service` é o microsserviço que implementa integralmente a Arquitetura Limpa:

```
analytics-service/src/
├── domain/                          ← NÚCLEO (regras de negócio puras)
│   ├── entities/
│   │   └── Atendimento.js           ← Entidade com validações de domínio
│   ├── enums/
│   │   └── tipoAtendimento.js       ← Tipos de intervenção permitidos
│   ├── ports/
│   │   └── IAtendimentoRepository.js← Contrato de persistência (saída)
│   └── usecases/
│       └── RegistrarAtendimento.js  ← Caso de uso de registro
│
├── infrastructure/                  ← BORDA (detalhes técnicos)
│   └── database/mongodb/
│       ├── AtendimentoRepository.js ← Implementação concreta do port
│       ├── MongoConnection.js       ← Singleton de conexão
│       └── models/
│           └── AtendimentoModel.js  ← Schema Mongoose
│
├── app.js                           ← Composição e rotas HTTP (Express)
└── server.js                        ← Bootstrap e conexão ao banco
```

### 3.3 Regra de dependência

```
infrastructure  ──depende de──▶  domain
app.js          ──depende de──▶  domain + infrastructure
domain          ──NÃO depende──▶  infrastructure, Express, Mongoose
```

O domínio (`Atendimento`, `RegistrarAtendimento`, `IAtendimentoRepository`) **nunca importa** Express, Mongoose ou qualquer biblioteca de infraestrutura. Isso garante que regras clínicas do DEGASE permaneçam intactas mesmo que o banco de dados ou o framework HTTP sejam substituídos.

### 3.4 Fluxo de uma requisição de registro

```
1. Frontend envia POST /api/analytics/atendimentos
2. app.js (infraestrutura) recebe a requisição HTTP
3. app.js invoca RegistrarAtendimento.execute(dados)
4. UseCase cria entidade Atendimento (validações de domínio)
5. UseCase chama atendimentoRepository.salvar(entidade)
6. AtendimentoRepository persiste no MongoDB via Mongoose
7. Resposta HTTP 201 retorna ao frontend
```

### 3.5 Justificativa da escolha

| Decisão | Motivo |
|---------|--------|
| Domínio isolado em `domain/` | Regras de equipe e tipo de atendimento são regulatórias; não podem ser contaminadas por detalhes de banco |
| Port `IAtendimentoRepository` | O domínio define **o que** precisa ser persistido; a infraestrutura define **como** |
| UseCase como orquestrador | Uma única entrada (`execute`) encapsula o fluxo de registro |
| Composição em `app.js` | Injeção de dependências ocorre na borda, não no núcleo |

---

## 4. Aplicação dos Princípios SOLID

### 4.1 S — Single Responsibility (Responsabilidade Única)

> *"Uma classe deve ter apenas um motivo para mudar."*

| Classe / Módulo | Responsabilidade única | Motivo de mudança |
|-----------------|------------------------|-------------------|
| `Atendimento.js` | Validar e representar um atendimento clínico | Regras de domínio do DEGASE |
| `RegistrarAtendimento.js` | Orquestrar o fluxo de registro | Novo fluxo de registro |
| `AtendimentoRepository.js` | Persistir e recuperar atendimentos no MongoDB | Troca de banco ou ORM |
| `authController.js` | Expor rotas HTTP de autenticação | Novos endpoints de auth |
| `GuardedRoute` (frontend) | Controlar acesso às rotas por perfil | Mudança de política RBAC |

**Evidência no código — entidade com responsabilidade única:**

```javascript
// domain/entities/Atendimento.js
export default class Atendimento {
  constructor({ adolescente_id, equipe, tipo, descricao, tecnico_responsavel }) {
    if (!adolescente_id || !descricao) {
      throw new Error('Campos obrigatórios ausentes: adolescente_id e descricao.');
    }
    const equipesPermitidas = ['EQUIPE_TECNICA', 'SAUDE_MENTAL'];
    if (!equipesPermitidas.includes(equipe)) {
      throw new Error(`Equipe inválida para este lançamento: ${equipe}`);
    }
    // ...
  }
}
```

A entidade **não sabe** salvar no banco, **não sabe** responder HTTP — apenas valida e representa.

---

### 4.2 O — Open/Closed (Aberto/Fechado)

> *"Aberto para extensão, fechado para modificação."*

| Extensão | Como | Sem modificar |
|----------|------|---------------|
| Novo tipo de atendimento | Adicionar valor em `tipoAtendimento.js` | Lógica da entidade `Atendimento` |
| Novo repositório (ex.: PostgreSQL) | Criar `PostgresAtendimentoRepository` | UseCase `RegistrarAtendimento` |
| Novo perfil de usuário | Adicionar rota com `GuardedRoute` | Componentes de dashboard existentes |

**Evidência — enum extensível:**

```javascript
// domain/enums/tipoAtendimento.js
const TipoAtendimento = Object.freeze({
  FAMILIAR: 'FAMILIAR',
  INDIVIDUAL: 'INDIVIDUAL',
  EM_GRUPO: 'EM_GRUPO',
  VISITA: 'VISITA',
  VISITA_VIRTUAL: 'VISITA_VIRTUAL'
});
```

Para incluir um sexto tipo, basta adicionar uma entrada no enum. A validação em `Atendimento.js` (`TipoAtendimento[tipo]`) passa a aceitá-lo automaticamente.

---

### 4.3 L — Liskov Substitution (Substituição de Liskov)

> *"Subtipos devem ser substituíveis por seus tipos base."*

O `MockAtendimentoRepository` (usado em testes) substitui o `AtendimentoRepository` (produção) sem alterar o comportamento esperado pelo UseCase:

```javascript
// tests/mocks/MockAtendimentoRepository.js — implementa o mesmo contrato
async salvar(atendimento) {
  this.registros.push(atendimento);
  return atendimento;
}
```

Nos testes TDD, o UseCase recebe o mock e funciona identicamente — prova de que a abstração é respeitada.

---

### 4.4 I — Interface Segregation (Segregação de Interface)

> *"Nenhum cliente deve ser forçado a depender de métodos que não utiliza."*

O port `IAtendimentoRepository` expõe **apenas** os métodos necessários ao domínio:

```javascript
// domain/ports/IAtendimentoRepository.js
export default class IAtendimentoRepository {
  async salvar(_atendimento) { /* contrato */ }
  async listarTodos() { /* contrato */ }
}
```

Não há métodos de conexão, query builder ou configuração de ORM no contrato — apenas operações de negócio.

---

### 4.5 D — Dependency Inversion (Inversão de Dependência)

> *"Módulos de alto nível não devem depender de módulos de baixo nível. Ambos devem depender de abstrações."*

**Evidência — UseCase depende de abstração, não de MongoDB:**

```javascript
// domain/usecases/RegistrarAtendimento.js
export default class RegistrarAtendimento {
  constructor(atendimentoRepository) {
    this.atendimentoRepository = atendimentoRepository;
  }

  async execute(dadosEntrada) {
    const novoAtendimento = new Atendimento(dadosEntrada);
    return await this.atendimentoRepository.salvar(novoAtendimento);
  }
}
```

A composição concreta ocorre na borda (`app.js`):

```javascript
const atendimentoRepository = new AtendimentoRepository();
const registrarAtendimentoUseCase = new RegistrarAtendimento(atendimentoRepository);
```

O domínio **nunca instancia** `AtendimentoRepository` — recebe qualquer implementação que respeite o contrato.

---

## 5. Aplicação de Design Patterns

Foram aplicados **quatro Design Patterns** adequados ao contexto de microsserviços, persistência e segurança do MedMetrics.

### 5.1 Repository Pattern (Padrão Repositório)

| Item | Detalhe |
|------|---------|
| **Onde** | `infrastructure/database/mongodb/AtendimentoRepository.js` |
| **Problema** | O domínio não deve conhecer Mongoose, schemas ou queries MongoDB |
| **Solução** | Repositório atua como mediador entre entidade de domínio e persistência |
| **Benefício** | Troca de MongoDB por PostgreSQL exige apenas novo repositório; UseCase intacto |

```javascript
// infrastructure/database/mongodb/AtendimentoRepository.js
export default class AtendimentoRepository {
  async salvar(atendimentoEntidade) {
    const novoDocumento = new AtendimentoModel({
      adolescente_id: atendimentoEntidade.adolescente_id,
      equipe: atendimentoEntidade.equipe,
      // ... mapeamento entidade → documento
    });
    return await novoDocumento.save();
  }
}
```

---

### 5.2 Dependency Injection (Injeção de Dependência)

| Item | Detalhe |
|------|---------|
| **Onde** | `RegistrarAtendimento.js` (receptor) + `app.js` (compositor) |
| **Problema** | UseCase acoplado ao banco impede testes unitários isolados |
| **Solução** | Repositório injetado via construtor na camada de composição |
| **Benefício** | Habilita TDD com `MockAtendimentoRepository` sem banco real |

---

### 5.3 Singleton Pattern

| Item | Detalhe |
|------|---------|
| **Onde** | `infrastructure/database/mongodb/MongoConnection.js` |
| **Problema** | Múltiplas conexões MongoDB por requisição esgotam sockets do SO |
| **Solução** | Classe com instância estática privada e método `getInstance()` |
| **Benefício** | Uma conexão reutilizada por todo o ciclo de vida do processo |

```javascript
class MongoConnection {
  static #instance = null;

  static getInstance() {
    if (!MongoConnection.#instance) {
      MongoConnection.#instance = mongoose;
    }
    return MongoConnection.#instance;
  }
}
```

Utilizado em `server.js` para conectar ao MongoDB antes de iniciar o Express.

---

### 5.4 Proxy / Decorator Pattern

| Item | Detalhe |
|------|---------|
| **Onde** | `GuardedRoute` em `frontend/src/App.jsx` |
| **Problema** | Lógica de RBAC espalhada em cada dashboard |
| **Solução** | Componente interceptador que envolve rotas protegidas |
| **Benefício** | Dashboards focam em UI; segurança fica centralizada |

```javascript
const GuardedRoute = ({ children, roleRequired }) => {
  const token = localStorage.getItem('medmetrics_token');
  const userRole = localStorage.getItem('medmetrics_role');

  if (!token) return <Navigate to="/login" replace />;
  if (roleRequired && userRole !== roleRequired.toUpperCase()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};
```

Uso nas rotas:

```javascript
<Route path="/diretor/*" element={
  <GuardedRoute roleRequired="DIRETOR">
    <DiretorDashboard />
  </GuardedRoute>
} />
```

---

### 5.5 Resumo comparativo

| Pattern | Camada | Problema resolvido |
|---------|--------|-------------------|
| Repository | Infraestrutura (backend) | Desacoplar domínio de persistência |
| Dependency Injection | Domínio + composição | Testabilidade e inversão de dependência |
| Singleton | Infraestrutura (backend) | Gestão eficiente de conexão MongoDB |
| Proxy / Decorator | Apresentação (frontend) | RBAC centralizado nas rotas |

---

## 6. Evidências de Clean Code

Clean Code (Robert C. Martin) orienta a escrita de código legível, manutenível e autoexplicativo. Abaixo estão evidências concretas aplicadas no MedMetrics.

### 6.1 Nomes expressivos e intencionais

| Ruim (evitado) | Bom (adotado) | Motivo |
|----------------|---------------|--------|
| `processData()` | `execute(dadosEntrada)` | Descreve a intenção do UseCase |
| `save()` genérico | `salvar(atendimentoEntidade)` | Indica o que é persistido |
| `check()` | `GuardedRoute` | Nome revela o papel de proteção de rota |
| `data` | `adolescente_id`, `tecnico_responsavel` | Campos de domínio identificáveis |

### 6.2 Funções pequenas com responsabilidade única

- **`Atendimento` constructor:** apenas valida campos e inicializa propriedades (~25 linhas).
- **`RegistrarAtendimento.execute()`:** apenas cria entidade e delega persistência (3 linhas de lógica).
- **`GuardedRoute`:** apenas verifica token e perfil antes de renderizar.

### 6.3 Separação de camadas (sem mistura de concerns)

| Concern | Onde fica | Onde NÃO fica |
|---------|-----------|---------------|
| Validação de equipe/tipo | `domain/entities/Atendimento.js` | Controller HTTP |
| Persistência MongoDB | `infrastructure/.../AtendimentoRepository.js` | UseCase |
| Rotas HTTP | `app.js` / `authController.js` | Entidade de domínio |
| Controle de acesso UI | `GuardedRoute` | Dashboards |

### 6.4 Tratamento de erros com mensagens claras

```javascript
throw new Error('Campos obrigatórios ausentes: adolescente_id e descricao.');
throw new Error(`Equipe inválida para este lançamento: ${equipe}`);
throw new Error(`Tipo de atendimento inválido: ${tipo}`);
```

Mensagens descrevem **o que falhou** e **por quê**, facilitando debug e feedback ao usuário.

### 6.5 Ausência de código morto e comentários redundantes

- Comentários existentes explicam **decisões arquiteturais** (ports, singleton), não o óbvio.
- Sem variáveis não utilizadas, imports desnecessários ou blocos comentados.

### 6.6 Consistência de convenções

| Convenção | Padrão adotado |
|-----------|----------------|
| Idioma do domínio | Português nos nomes de negócio (`RegistrarAtendimento`, `equipe`) |
| Idioma técnico | Inglês em padrões (`Repository`, `execute`, `Mock`) |
| Estrutura de pastas | `domain/`, `infrastructure/`, `tests/` em todos os serviços |
| Extensões ESM | `.js` com `"type": "module"` no `package.json` |

---

## 7. Testes Criados com TDD

### 7.1 Metodologia TDD adotada

O ciclo **Red → Green → Refactor** foi aplicado no `analytics-service`:

1. **Red:** escrever teste que falha (ex.: validação de equipe inválida).
2. **Green:** implementar código mínimo para passar (validação na entidade).
3. **Refactor:** extrair enum, port e UseCase sem quebrar testes.

### 7.2 Estrutura da suíte de testes

```
analytics-service/src/tests/
├── Atendimento.test.js              ← Testes da entidade de domínio
├── RegistrarAtendimento.test.js     ← Testes do UseCase com mock
├── mocks/
│   └── MockAtendimentoRepository.js ← Repositório em memória
├── features/
│   └── registrar_atendimento.feature← Cenários BDD (Gherkin)
└── bdd/
    └── registrarAtendimento.steps.js← Step definitions executáveis
```

### 7.3 Testes unitários — Entidade `Atendimento`

**Arquivo:** `src/tests/Atendimento.test.js`

| # | Teste | Comportamento validado | Resultado esperado |
|---|-------|------------------------|-------------------|
| 1 | Criação com dados válidos | Todos os campos corretos | Instância criada com `adolescente_id`, `equipe`, `tipo` corretos |
| 2 | Equipe inválida (`ENFERMAGEM`) | Equipe fora do escopo DEGASE | Lança erro: `"Equipe inválida para este lançamento: ENFERMAGEM"` |
| 3 | Tipo inválido (`INTERNACAO_MEDICA`) | Tipo fora do enum | Lança erro: `"Tipo de atendimento inválido: INTERNACAO_MEDICA"` |

Estes testes foram escritos **antes** da implementação final da entidade, guiando as regras de validação de domínio.

### 7.4 Testes unitários — UseCase `RegistrarAtendimento`

**Arquivo:** `src/tests/RegistrarAtendimento.test.js`

| # | Teste | Comportamento validado | Resultado esperado |
|---|-------|------------------------|-------------------|
| 1 | Persistência via mock | Dados válidos + mock repository | 1 registro no mock; `adolescente_id = '5005'` |
| 2 | Erro sem persistir | Equipe inválida | Erro propagado; mock com 0 registros |

**Evidência — isolamento total do banco:**

```javascript
beforeEach(() => {
  mockRepository = new MockAtendimentoRepository();
  useCase = new RegistrarAtendimento(mockRepository);
});

test('deve persistir atendimento válido via repositório injetado', async () => {
  const resultado = await useCase.execute(dados);
  expect(mockRepository.registros).toHaveLength(1);
});
```

### 7.5 Configuração de execução

```bash
cd analytics-service
npm install
npm test
```

Framework: **Jest** com suporte ESM (`NODE_OPTIONS=--experimental-vm-modules`).  
Configuração: `jest.config.js` na raiz do `analytics-service`.

### 7.6 Justificativa dos testes TDD

| Regra de negócio | Por que testar com TDD |
|------------------|------------------------|
| Apenas `EQUIPE_TECNICA` e `SAUDE_MENTAL` | Evita registros de equipes não autorizadas pelo DEGASE |
| Tipos enumerados (Individual, Familiar, etc.) | Garante padronização para métricas comparáveis |
| Campos obrigatórios (`adolescente_id`, `descricao`) | Impede registros incompletos na base analítica |
| UseCase não persiste dados inválidos | Protege integridade do MongoDB |

---

## 8. Cenários de Comportamento com BDD

### 8.1 Metodologia BDD adotada

O **Behavior-Driven Development** descreve o comportamento do sistema em linguagem natural (Gherkin), compreensível tanto por desenvolvedores quanto por gestores do DEGASE. Os cenários são **executáveis** via biblioteca **jest-cucumber**, fechando a lacuna entre especificação e código.

### 8.2 Arquivos BDD

| Arquivo | Papel |
|---------|-------|
| `src/tests/features/registrar_atendimento.feature` | Cenários em Gherkin (português) |
| `src/tests/bdd/registrarAtendimento.steps.js` | Step definitions que executam o UseCase |

### 8.3 Funcionalidade descrita

```gherkin
# language: pt
Funcionalidade: Registro de Atendimentos Técnicos no DEGASE
  Como um Técnico Socioeducativo autorizado no MedMetrics
  Eu quero registrar os atendimentos prestados aos adolescentes no sistema
  Para que os indicadores clínicos e sociais sejam computados no Analytics-Service
```

Esta estrutura segue o formato **Como / Eu quero / Para que**, alinhado ao template de User Story + especificação executável.

### 8.4 Cenário 1 — Registro com sucesso

```gherkin
Cenário: Registro de atendimento realizado com sucesso
  Dado que o usuário está autenticado com o perfil de "TECNICO"
  E preenche o formulário com o ID do adolescente "5005"
  E seleciona a equipe "SAUDE_MENTAL"
  E seleciona o tipo de intervenção "INDIVIDUAL"
  E insere a evolução "Adolescente apresentou boa evolução no atendimento psicossocial."
  Quando ele executa o caso de uso "RegistrarAtendimento"
  Então o sistema deve salvar o registro com sucesso
  E o adolescente_id deve ser "5005"
```

| Passo | Ação técnica executada |
|-------|------------------------|
| Dado (autenticação) | Simula perfil `TECNICO` no contexto do teste |
| E (formulário) | Monta objeto com `adolescente_id`, `equipe`, `tipo`, `descricao` |
| Quando (UseCase) | Invoca `RegistrarAtendimento.execute(formulario)` |
| Então (sucesso) | Assert: mock repository contém 1 registro |
| E (adolescente_id) | Assert: `resultado.adolescente_id === '5005'` |

### 8.5 Cenário 2 — Rejeição por equipe inválida

```gherkin
Cenário: Rejeição de atendimento com equipe inválida
  Dado que o usuário está autenticado com o perfil de "TECNICO"
  E preenche o formulário com o ID do adolescente "5005"
  E seleciona a equipe "ENFERMAGEM"
  E seleciona o tipo de intervenção "INDIVIDUAL"
  E insere a evolução "Descrição técnica."
  Quando ele executa o caso de uso "RegistrarAtendimento"
  Então o sistema deve rejeitar o registro com erro de equipe inválida
```

| Passo | Ação técnica executada |
|-------|------------------------|
| E (equipe ENFERMAGEM) | Equipe fora do escopo DEGASE (`EQUIPE_TECNICA`, `SAUDE_MENTAL`) |
| Quando (UseCase) | Invoca `execute()` — entidade lança exceção |
| Então (rejeição) | Assert: erro contém `"Equipe inválida"`; mock com 0 registros |

### 8.6 Relação entre TDD e BDD

```
┌─────────────────────────────────────────────────────────┐
│  BDD (.feature)                                         │
│  "O que o sistema deve fazer" (linguagem de negócio)    │
└──────────────────────┬──────────────────────────────────┘
                       │ implementado por
                       ▼
┌─────────────────────────────────────────────────────────┐
│  Step Definitions (.steps.js)                           │
│  Traduz Gherkin → chamadas ao UseCase                   │
└──────────────────────┬──────────────────────────────────┘
                       │ validado por
                       ▼
┌─────────────────────────────────────────────────────────┐
│  TDD (.test.js)                                         │
│  Testes unitários isolados (entidade + UseCase + mock)  │
└─────────────────────────────────────────────────────────┘
```

- **TDD** garante correção técnica em nível de unidade.
- **BDD** garante que o comportamento atende aos requisitos de negócio do DEGASE.
- Ambos compartilham o mesmo `MockAtendimentoRepository` e `RegistrarAtendimento`.

### 8.7 Justificativa do BDD neste contexto

| Stakeholder | Benefício do BDD |
|-------------|------------------|
| Técnico de Saúde | Cenários descrevem o fluxo real de registro de atendimento |
| Diretor Técnico | Valida que apenas equipes autorizadas são aceitas |
| Equipe de desenvolvimento | Cenários executáveis detectam regressões automaticamente |
| Auditoria / LGPD | Comportamento documentado e testável serve como evidência de conformidade |

---

## Referências de Arquivos do Projeto

| Conceito | Caminho no repositório |
|----------|------------------------|
| Entidade de domínio | `analytics-service/src/domain/entities/Atendimento.js` |
| Caso de uso | `analytics-service/src/domain/usecases/RegistrarAtendimento.js` |
| Port (contrato) | `analytics-service/src/domain/ports/IAtendimentoRepository.js` |
| Repositório | `analytics-service/src/infrastructure/database/mongodb/AtendimentoRepository.js` |
| Singleton MongoDB | `analytics-service/src/infrastructure/database/mongodb/MongoConnection.js` |
| GuardedRoute (Proxy) | `frontend/src/App.jsx` |
| Testes TDD | `analytics-service/src/tests/Atendimento.test.js`, `RegistrarAtendimento.test.js` |
| Cenários BDD | `analytics-service/src/tests/features/registrar_atendimento.feature` |
| Step definitions BDD | `analytics-service/src/tests/bdd/registrarAtendimento.steps.js` |
| Orquestração Docker | `docker-compose.yml` |
| Deploy produção | `render.yaml` |

---

*Documento elaborado como parte da entrega técnica do projeto MedMetrics — Novo DEGASE.*
