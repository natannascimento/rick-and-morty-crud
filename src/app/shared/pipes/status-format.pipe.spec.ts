import { StatusFormatPipe } from './status-format.pipe';

describe('StatusFormatPipe', () => {
  let pipe: StatusFormatPipe;

  beforeEach(() => {
    pipe = new StatusFormatPipe();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Inicialização do Pipe', () => {
    it('deve ser criado', () => {
      expect(pipe).toBeTruthy();
    });

    it('deve implementar PipeTransform', () => {
      expect(pipe.transform).toBeDefined();
      expect(typeof pipe.transform).toBe('function');
    });
  });

  describe('Transformação de Status Válidos', () => {
    it('deve transformar "alive" em "🟢 Alive"', () => {
      const result = pipe.transform('alive');
      expect(result).toBe('🟢 Alive');
    });

    it('deve transformar "dead" em "🔴 Dead"', () => {
      const result = pipe.transform('dead');
      expect(result).toBe('🔴 Dead');
    });

    it('deve transformar "unknown" em "⚪ Unknown"', () => {
      const result = pipe.transform('unknown');
      expect(result).toBe('⚪ Unknown');
    });
  });

  describe('Tratamento de Case Insensitive', () => {
    it('deve transformar "ALIVE" (maiúsculo) em "🟢 Alive"', () => {
      const result = pipe.transform('ALIVE');
      expect(result).toBe('🟢 Alive');
    });

    it('deve transformar "Dead" (primeira letra maiúscula) em "🔴 Dead"', () => {
      const result = pipe.transform('Dead');
      expect(result).toBe('🔴 Dead');
    });

    it('deve transformar "UnKnOwN" (case misto) em "⚪ Unknown"', () => {
      const result = pipe.transform('UnKnOwN');
      expect(result).toBe('⚪ Unknown');
    });

    it('deve transformar "aLiVe" (case misto) em "🟢 Alive"', () => {
      const result = pipe.transform('aLiVe');
      expect(result).toBe('🟢 Alive');
    });
  });

  describe('Tratamento de Valores Inválidos', () => {
    it('deve retornar valor original para status não reconhecido', () => {
      const result = pipe.transform('invalid');
      expect(result).toBe('invalid');
    });

    it('deve retornar string vazia para string vazia', () => {
      const result = pipe.transform('');
      expect(result).toBe('');
    });

    it('deve retornar valor original para string com espaços', () => {
      const result = pipe.transform('  alive  ');
      expect(result).toBe('  alive  ');
    });

    it('deve retornar valor original para status parcialmente correto', () => {
      const result = pipe.transform('aliv');
      expect(result).toBe('aliv');
    });

    it('deve retornar valor original para números como string', () => {
      const result = pipe.transform('123');
      expect(result).toBe('123');
    });
  });

  describe('Tratamento de Valores Null/Undefined', () => {
    it('deve retornar null quando valor é null', () => {
      const result = pipe.transform(null as any);
      expect(result).toBe(null);
    });

    it('deve retornar undefined quando valor é undefined', () => {
      const result = pipe.transform(undefined as any);
      expect(result).toBe(undefined);
    });
  });

  describe('Testes de Edge Cases', () => {
    it('deve lidar com caracteres especiais', () => {
      const result = pipe.transform('alive!@#');
      expect(result).toBe('alive!@#');
    });

    it('deve lidar com strings muito longas', () => {
      const longString = 'alive'.repeat(100);
      const result = pipe.transform(longString);
      // Deve retornar o valor original pois não é exatamente "alive"
      expect(result).toBe(longString);
    });

    it('deve lidar com quebras de linha', () => {
      const result = pipe.transform('alive\n');
      expect(result).toBe('alive\n');
    });

    it('deve lidar com tabs', () => {
      const result = pipe.transform('alive\t');
      expect(result).toBe('alive\t');
    });
  });

  describe('Testes de Performance e Consistência', () => {
    it('deve retornar resultado consistente para múltiplas chamadas', () => {
      const input = 'alive';
      const result1 = pipe.transform(input);
      const result2 = pipe.transform(input);
      
      expect(result1).toBe(result2);
      expect(result1).toBe('🟢 Alive');
    });

    it('deve processar lista de diferentes status corretamente', () => {
      const statuses = ['alive', 'dead', 'unknown', 'invalid'];
      const expected = ['🟢 Alive', '🔴 Dead', '⚪ Unknown', 'invalid'];
      
      const results = statuses.map(status => pipe.transform(status));
      
      expect(results).toEqual(expected);
    });

    it('deve ser pure pipe (sem efeitos colaterais)', () => {
      const originalValue = 'alive';
      const result = pipe.transform(originalValue);
      
      // O valor original não deve ser modificado
      expect(originalValue).toBe('alive');
      expect(result).toBe('🟢 Alive');
      expect(result).not.toBe(originalValue);
    });
  });

  describe('Validação de Emojis e Formatação', () => {
    it('deve usar emoji correto para status alive', () => {
      const result = pipe.transform('alive');
      expect(result).toContain('🟢');
      expect(result).toContain('Alive');
    });

    it('deve usar emoji correto para status dead', () => {
      const result = pipe.transform('dead');
      expect(result).toContain('🔴');
      expect(result).toContain('Dead');
    });

    it('deve usar emoji correto para status unknown', () => {
      const result = pipe.transform('unknown');
      expect(result).toContain('⚪');
      expect(result).toContain('Unknown');
    });

    it('deve manter formatação consistente com espaço entre emoji e texto', () => {
      expect(pipe.transform('alive')).toBe('🟢 Alive');
      expect(pipe.transform('dead')).toBe('🔴 Dead');
      expect(pipe.transform('unknown')).toBe('⚪ Unknown');
    });
  });

  describe('Testes de Integração com Templates', () => {
    it('deve funcionar como seria usado em template com interpolação', () => {
      const character = { status: 'alive' };
      const result = pipe.transform(character.status);
      
      expect(result).toBe('🟢 Alive');
    });

    it('deve funcionar com binding dinâmico', () => {
      const statusValues = ['alive', 'dead', 'unknown'];
      const expectedResults = ['🟢 Alive', '🔴 Dead', '⚪ Unknown'];
      
      statusValues.forEach((status, index) => {
        const result = pipe.transform(status);
        expect(result).toBe(expectedResults[index]);
      });
    });

    it('deve ser adequado para uso em *ngFor', () => {
      const characters = [
        { name: 'Rick', status: 'alive' },
        { name: 'Birdperson', status: 'dead' },
        { name: 'Squanch', status: 'unknown' }
      ];

      const results = characters.map(char => ({
        name: char.name,
        formattedStatus: pipe.transform(char.status)
      }));

      expect(results[0].formattedStatus).toBe('🟢 Alive');
      expect(results[1].formattedStatus).toBe('🔴 Dead');
      expect(results[2].formattedStatus).toBe('⚪ Unknown');
    });
  });

  describe('Compatibilidade com CharacterStatus Types', () => {
    it('deve trabalhar com tipo CharacterStatus "Alive"', () => {
      const result = pipe.transform('Alive');
      expect(result).toBe('🟢 Alive');
    });

    it('deve trabalhar com tipo CharacterStatus "Dead"', () => {
      const result = pipe.transform('Dead');
      expect(result).toBe('🔴 Dead');
    });

    it('deve trabalhar com tipo CharacterStatus "unknown" (lowercase)', () => {
      const result = pipe.transform('unknown');
      expect(result).toBe('⚪ Unknown');
    });
  });

  describe('Testes de Acessibilidade', () => {
    it('deve incluir emoji como indicador visual', () => {
      expect(pipe.transform('alive')).toContain('🟢');
      expect(pipe.transform('dead')).toContain('🔴');
      expect(pipe.transform('unknown')).toContain('⚪');
    });

    it('deve manter texto legível após emoji', () => {
      expect(pipe.transform('alive')).toContain('Alive');
      expect(pipe.transform('dead')).toContain('Dead');
      expect(pipe.transform('unknown')).toContain('Unknown');
    });

    it('deve usar capitalização adequada para leitura', () => {
      expect(pipe.transform('alive')).toContain('Alive');
      expect(pipe.transform('dead')).toContain('Dead');
      expect(pipe.transform('unknown')).toContain('Unknown');
    });
  });
});