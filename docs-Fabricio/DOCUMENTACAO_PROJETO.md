# MedMetrics — Documentação Técnica do Projeto

Esta documentação descreve a arquitetura, decisões de design, tecnologias e diretrizes de execução para a aplicação integrada **MedMetrics**, desenvolvida para atender aos requisitos de persistência híbrida, segurança, conteinerização e cobertura de testes.

---

## 1. Visão Geral do Sistema e Arquitetura

O sistema foi concebido utilizando os princípios da **Clean Architecture** e **Domain-Driven Design (DDD)**, estruturado em microsserviços isolados para garantir alta coesão e baixo acoplamento. O ecossistema é dividido em:

* **Auth-Service:** Responsável pela autenticação, autorização e gerenciamento de usuários utilizando um banco de dados relacional (**PostgreSQL**).
* **Analytics-Service:** Voltado para a gestão de registros socioeducativos, métricas e relatórios técnicos utilizando um banco de dados NoSQL (**MongoDB**).
* **Frontend-App:** Interface web SPA moderna desenvolvida em **React** e **Tailwind CSS**, que consome os microsserviços de forma transparente.

### Padrões de Projeto Adotados (Design Patterns)
* **Repository Pattern (Ports & Adapters):** Desacopla o domínio de negócios das tecnologias de persistência (Sequelize/Mongoose).
* **Singleton Pattern:** Aplicado na infraestrutura de conexões (`MongoConnection`) para garantir uma única instância do driver por processo, mitigando o esgotamento de sockets em ambientes de produção.
* **Gateway/API Client Pattern:** Abstração das chamadas HTTP no Frontend através do Axios para isolar a lógica de requisições dos componentes visuais.

---

## 2. Tecnologias Utilizadas

* **Ambiente de Execução:** Node.js (v24-alpine)
* **Framework Web:** Express.js
* **Bancos de Dados:** PostgreSQL (Relacional) e MongoDB v6.0 (NoSQL)
* **Mapeamento de Dados:** Sequelize (SQL) e Mongoose (NoSQL)
* **Segurança:** JSON Web Tokens (JWT), Crypto/Bcrypt, CORS habilitado
* **Interface Visual:** React, Tailwind CSS (v4) e Nginx (para servir o build estático em produção)
* **Testes:** Jest e Supertest (Testes de integração de ponta a ponta)
* **Conteinerização:** Docker e Docker Compose

---

## 3. Persistência de Dados (Estrutura NoSQL)

No microsserviço `analytics-service`, foram implementados **3 CRUDs completos** utilizando o MongoDB. Alinhado ao escopo de medidas socioeducativas, as coleções foram modeladas da seguinte forma:

1.  **Atendimentos (`atendimentos`):** Registra os acolhimentos, visitas virtuais e atendimentos de saúde mental realizados com os adolescentes.
2.  **Analytics (`analytics`):** Agrega métricas temporais, indicadores de produtividade técnica e volumetria por tipo de atendimento.
3.  **Relatórios (`relatorios`):** Armazena a confecção de documentos técnicos cruciais (PIA, Relatórios Evolutivos e Conclusivos).

---

## 4. Segurança e Boas Práticas (OWASP Top 10)

A aplicação foi blindada seguindo as recomendações do guia **OWASP Top 10**:
* **A01:2021-Broken Access Control & A07:2021-Identification and Authentication Failure:** Implementação rigorosa de autenticação via Bearer Tokens JWT. As rotas sensíveis do backend barram requisições sem tokens válidos ou expirados. No Frontend, rotas protegidas impedem o acesso a telas administrativas por usuários não autenticados.
* **A03:2021-Injection:** Utilização de queries parametrizadas pelo Sequelize e Schemas tipados e validados pelo Mongoose, mitigando vulnerabilidades de SQL Injection e NoSQL Injection.
* **A04:2021-Insecure Design:** Uso de variáveis de ambiente (`.env`) para segregação de credenciais, garantindo que chaves criptográficas (`JWT_SECRET`) e URIs de banco nunca fiquem expostas no código-fonte.

---

## 5. Estratégia de Testes

Os recursos foram validados através de **Testes de Integração** robustos utilizando **Jest** e **Supertest**. 
* Os testes cobrem o fluxo de ponta a ponta (E2E) simulando requisições HTTP reais contra os endpoints da API.
* Valida-se o comportamento de sucesso (status `201 Created`, `200 OK`) e cenários de erro esperados (status `400 Bad Request`, `401 Unauthorized`), garantindo a integridade dos dados e das regras de validação antes de qualquer deploy.

---

## 6. Instruções para Execução via Docker (Fluxo Principal)

O projeto está totalmente configurado para subir em orquestração através do Docker Compose, isolando serviços e bancos em uma rede privada bridge (`medmetrics-network`).

### Pré-requisitos
* Docker e Docker Compose instalados na máquina.

### Como subir a aplicação completa

1. Certifique-se de que o arquivo `.env` na raiz do projeto está configurado de acordo com o exemplo fornecido.
2. No terminal, navegue até a raiz do projeto (`MEDMETRICS-ROOT`) e execute o comando de build e inicialização:

```bash
docker-compose up --build

### O Docker Compose fará o download das imagens oficiais, construirá os ambientes isolados do auth-service, analytics-service e compilará o build do frontend em React através de um Multi-stage build, disponibilizando-o em um servidor Nginx otimizado.

### Portas de Acesso Local

  - Frontend (React Web): http://localhost:3000

  - Auth-Service (API SQL): http://localhost:3001

  - Analytics-Service (API NoSQL): http://localhost:3002

### Documentação Swagger: Acessível diretamente no endpoint /api-docs de cada microsserviço correspondente.