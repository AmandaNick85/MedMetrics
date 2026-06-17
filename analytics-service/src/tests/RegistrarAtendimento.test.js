import RegistrarAtendimento from '../domain/usecases/RegistrarAtendimento.js';
import MockAtendimentoRepository from './mocks/MockAtendimentoRepository.js';

describe('TDD — UseCase RegistrarAtendimento (Injeção de Dependência)', () => {
  let mockRepository;
  let useCase;

  beforeEach(() => {
    mockRepository = new MockAtendimentoRepository();
    useCase = new RegistrarAtendimento(mockRepository);
  });

  test('deve persistir atendimento válido via repositório injetado', async () => {
    const dados = {
      adolescente_id: '5005',
      equipe: 'SAUDE_MENTAL',
      tipo: 'INDIVIDUAL',
      descricao: 'Adolescente apresentou boa evolução no atendimento psicossocial.',
      tecnico_responsavel: 'Carlos Silva',
    };

    const resultado = await useCase.execute(dados);

    expect(resultado.adolescente_id).toBe('5005');
    expect(resultado.equipe).toBe('SAUDE_MENTAL');
    expect(mockRepository.registros).toHaveLength(1);
  });

  test('deve propagar erro de validação de domínio sem chamar o repositório', async () => {
    const dadosInvalidos = {
      adolescente_id: '5005',
      equipe: 'ENFERMAGEM',
      tipo: 'INDIVIDUAL',
      descricao: 'Descrição técnica.',
      tecnico_responsavel: 'Carlos Silva',
    };

    await expect(useCase.execute(dadosInvalidos)).rejects.toThrow(
      'Equipe inválida para este lançamento: ENFERMAGEM'
    );
    expect(mockRepository.registros).toHaveLength(0);
  });
});
