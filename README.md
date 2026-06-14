# MedMetrics - Sistema de Gestão de Saúde e Analytics (Novo DEGASE)

Solução de software baseada em microsserviços desenvolvida para otimizar, centralizar e auditar os registros de atendimentos e intervenções técnicas realizados pelas equipes de assistência aos adolescentes no ecossistema do Novo DEGASE.

## 📋 Descrição do Problema
O acompanhamento de adolescentes em medidas socioeducativas envolve múltiplas frentes (técnica multidisciplinar e saúde mental). Sistemas monolíticos tradicionais sofrem com acoplamento excessivo, falhas de sincronização e misturam auditorias analíticas com dados transacionais de autenticação. O MedMetrics resolve isso dividindo as responsabilidades em microsserviços especializados, garantindo integridade regulatória, LGPD e alta escalabilidade.

---

## 🛠️ Arquitetura e Divisão de Microsserviços

O ecossistema é orquestrado via **Docker Compose** e dividido em:
1. **Frontend (React + Tailwind CSS):** Interface responsiva que gerencia o fluxo de controle de acesso (RBAC) e as telas operacionais do Diretor Técnico e do Técnico de Saúde.
2. **Auth-Service (Node.js + Express + PostgreSQL):** Gerencia o controle transacional de usuários, cadastro de funcionários e emissão de tokens de segurança JWT. (Porta `3001`).
3. **Analytics-Service (Node.js + Express + MongoDB):** Implementa os pilares da **Arquitetura Limpa (Clean Architecture)** para registrar e computar os indicadores clínicos e relatórios de evolução. (Porta `3002`).

---

## 📐 Padrões de Projeto (Design Patterns) Aplicados
* **Repository Pattern:** Desacopla a camada de dados (Mongoose/Sequelize) das regras de aplicação, facilitando a troca do banco ou mock de testes.
* **Dependency Injection (Injeção de Dependência):** UseCases recebem suas abstrações de repositórios via construtor, garantindo inversão de controle.
* **Singleton:** Aplicado nas conexões de banco de dados para evitar múltiplas conexões concorrentes desnecessárias nos clusters.
* **Guarda de Rotas (Decorator/Proxy Pattern):** O componente `GuardedRoute` intercepta e valida as claims de perfil antes de renderizar os módulos do sistema.

---

## 🎭 Cenários de Comportamento (BDD)

# language: pt
Funcionalidade: Registro de Atendimentos Técnicos no DEGASE
  Como um Técnico Socioeducativo autorizado no MedMetrics
  Eu quero registrar os atendimentos prestados aos adolescentes no sistema
  Para que os indicadores clínicos e sociais sejam computados no Analytics-Service.

  Cenário: Registro de atendimento realizado com sucesso
    Dado que o usuário está autenticado com o perfil de "TECNICO"
    E preenche o formulário com o ID do adolescente "5005"
    E seleciona a equipe "EQUIPE_SAUDE_MENTAL"
    E seleciona o tipo de intervenção "INDIVIDUAL"
    E insere a evolução "Adolescente apresentou boa evolução no atendimento psicossocial."
    Quando ele clica em "Salvar Atendimento"
    Então o sistema deve processar a requisição através do UseCase "RegistrarAtendimento"
    E deve salvar o registro com sucesso na coleção do MongoDB
    E exibir a mensagem "Atendimento clínico registrado e enviado para a base MongoDB!"