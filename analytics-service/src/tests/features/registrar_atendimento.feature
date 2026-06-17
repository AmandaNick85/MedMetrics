# language: pt
Funcionalidade: Registro de Atendimentos Técnicos no DEGASE
  Como um Técnico Socioeducativo autorizado no MedMetrics
  Eu quero registrar os atendimentos prestados aos adolescentes no sistema
  Para que os indicadores clínicos e sociais sejam computados no Analytics-Service

  Cenário: Registro de atendimento realizado com sucesso
    Dado que o usuário está autenticado com o perfil de "TECNICO"
    E preenche o formulário com o ID do adolescente "5005"
    E seleciona a equipe "SAUDE_MENTAL"
    E seleciona o tipo de intervenção "INDIVIDUAL"
    E insere a evolução "Adolescente apresentou boa evolução no atendimento psicossocial."
    Quando ele executa o caso de uso "RegistrarAtendimento"
    Então o sistema deve salvar o registro com sucesso
    E o adolescente_id deve ser "5005"

  Cenário: Rejeição de atendimento com equipe inválida
    Dado que o usuário está autenticado com o perfil de "TECNICO"
    E preenche o formulário com o ID do adolescente "5005"
    E seleciona a equipe "ENFERMAGEM"
    E seleciona o tipo de intervenção "INDIVIDUAL"
    E insere a evolução "Descrição técnica."
    Quando ele executa o caso de uso "RegistrarAtendimento"
    Então o sistema deve rejeitar o registro com erro de equipe inválida
