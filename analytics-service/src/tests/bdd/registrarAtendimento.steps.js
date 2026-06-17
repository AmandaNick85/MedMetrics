import { defineFeature, loadFeature } from 'jest-cucumber';
import path from 'path';
import { fileURLToPath } from 'url';
import RegistrarAtendimento from '../../domain/usecases/RegistrarAtendimento.js';
import MockAtendimentoRepository from '../mocks/MockAtendimentoRepository.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const feature = loadFeature(path.join(__dirname, '../features/registrar_atendimento.feature'));

defineFeature(feature, (test) => {
  let mockRepository;
  let useCase;
  let formulario;
  let resultado;
  let erro;

  const resetContext = () => {
    mockRepository = new MockAtendimentoRepository();
    useCase = new RegistrarAtendimento(mockRepository);
    formulario = {};
    resultado = null;
    erro = null;
  };

  test('Registro de atendimento realizado com sucesso', ({ given, and, when, then }) => {
    given(/^que o usuário está autenticado com o perfil de "(.*)"$/, (perfil) => {
      resetContext();
      formulario.perfil = perfil;
    });

    and(/^preenche o formulário com o ID do adolescente "(.*)"$/, (id) => {
      formulario.adolescente_id = id;
    });

    and(/^seleciona a equipe "(.*)"$/, (equipe) => {
      formulario.equipe = equipe;
    });

    and(/^seleciona o tipo de intervenção "(.*)"$/, (tipo) => {
      formulario.tipo = tipo;
    });

    and(/^insere a evolução "(.*)"$/, (descricao) => {
      formulario.descricao = descricao;
      formulario.tecnico_responsavel = 'Técnico Autenticado';
    });

    when(/^ele executa o caso de uso "(.*)"$/, async () => {
      try {
        resultado = await useCase.execute(formulario);
      } catch (e) {
        erro = e;
      }
    });

    then('o sistema deve salvar o registro com sucesso', () => {
      expect(erro).toBeNull();
      expect(mockRepository.registros).toHaveLength(1);
    });

    and(/^o adolescente_id deve ser "(.*)"$/, (id) => {
      expect(resultado.adolescente_id).toBe(id);
    });
  });

  test('Rejeição de atendimento com equipe inválida', ({ given, and, when, then }) => {
    given(/^que o usuário está autenticado com o perfil de "(.*)"$/, (perfil) => {
      resetContext();
      formulario.perfil = perfil;
    });

    and(/^preenche o formulário com o ID do adolescente "(.*)"$/, (id) => {
      formulario.adolescente_id = id;
    });

    and(/^seleciona a equipe "(.*)"$/, (equipe) => {
      formulario.equipe = equipe;
    });

    and(/^seleciona o tipo de intervenção "(.*)"$/, (tipo) => {
      formulario.tipo = tipo;
    });

    and(/^insere a evolução "(.*)"$/, (descricao) => {
      formulario.descricao = descricao;
      formulario.tecnico_responsavel = 'Técnico Autenticado';
    });

    when(/^ele executa o caso de uso "(.*)"$/, async () => {
      try {
        resultado = await useCase.execute(formulario);
      } catch (e) {
        erro = e;
      }
    });

    then('o sistema deve rejeitar o registro com erro de equipe inválida', () => {
      expect(erro).not.toBeNull();
      expect(erro.message).toContain('Equipe inválida');
      expect(mockRepository.registros).toHaveLength(0);
    });
  });
});
