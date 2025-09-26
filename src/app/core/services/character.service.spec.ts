import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CharactersService } from './character.service';
import { Character } from '../models/character.model';

describe('CharactersService', () => {
  let service: CharactersService;
  let httpMock: HttpTestingController;
  let localStorageMock: { [key: string]: string };

  const mockCharacter: Character = {
    id: 1,
    name: 'Rick Sanchez',
    status: 'Alive',
    species: 'Human',
    gender: 'Male',
    image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
    created: '2017-11-04T18:48:46.250Z',
  };

  const mockLocalCharacter: Character = {
    id: -1,
    name: 'Personagem Local',
    status: 'Alive',
    species: 'Human',
    gender: 'Male',
    image: 'local-image.jpg',
    _local: true,
    _updatedAt: '2025-09-26T10:00:00.000Z',
  };

  const mockApiResponse = {
    info: {
      count: 826,
      pages: 42,
      next: 'https://rickandmortyapi.com/api/character?page=2',
      prev: null,
    },
    results: [mockCharacter],
  };

  beforeEach(() => {
    localStorageMock = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key: string) => localStorageMock[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          localStorageMock[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete localStorageMock[key];
        }),
        clear: jest.fn(() => {
          localStorageMock = {};
        }),
      },
      writable: true,
    });

    TestBed.configureTestingModule({
      providers: [
        CharactersService,
        provideHttpClient(),
        provideHttpClientTesting()
      ],
    });

    service = TestBed.inject(CharactersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    jest.clearAllMocks();
  });

  describe('Inicialização do Serviço', () => {
    it('deve ser criado', () => {
      expect(service).toBeTruthy();
    });

    it('deve inicializar com valores padrão dos signals', () => {
      expect(service.characters()).toEqual([]);
      expect(service.total()).toBe(0);
      expect(service.loading()).toBe(false);
      expect(service.query()).toBe('');
      expect(service.page()).toBe(1);
    });
  });

  describe('load()', () => {
    it('deve carregar personagens da API com sucesso', async () => {
      const loadPromise = service.load(1, '');

      const req = httpMock.expectOne(
        'https://rickandmortyapi.com/api/character?page=1'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockApiResponse);

      await loadPromise;

      expect(service.characters()).toEqual([mockCharacter]);
      expect(service.total()).toBe(826);
      expect(service.loading()).toBe(false);
      expect(service.page()).toBe(1);
      expect(service.query()).toBe('');
    });

    it('deve carregar personagens com filtro de nome', async () => {
      const loadPromise = service.load(1, 'Rick');

      const req = httpMock.expectOne(
        'https://rickandmortyapi.com/api/character?page=1&name=Rick'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockApiResponse);

      await loadPromise;

      expect(service.query()).toBe('Rick');
    });

    it('deve mesclar personagens da API com personagens locais', async () => {
      localStorageMock['rm-local-characters'] = JSON.stringify([
        mockLocalCharacter,
      ]);

      const loadPromise = service.load(1, '');

      const req = httpMock.expectOne(
        'https://rickandmortyapi.com/api/character?page=1'
      );
      req.flush(mockApiResponse);

      await loadPromise;

      expect(service.characters()).toHaveLength(2);
      expect(service.characters()).toEqual([mockLocalCharacter, mockCharacter]);
      expect(service.total()).toBe(827);
    });

    it('não deve duplicar personagens ao mesclar', async () => {
      localStorageMock['rm-local-characters'] = JSON.stringify([mockCharacter]);

      const loadPromise = service.load(1, '');

      const req = httpMock.expectOne(
        'https://rickandmortyapi.com/api/character?page=1'
      );
      req.flush(mockApiResponse);

      await loadPromise;

      expect(service.characters()).toHaveLength(1);
      expect(service.characters()).toEqual([mockCharacter]);
    });

    it('deve lidar com erro da API e usar localStorage como fallback', async () => {
      localStorageMock['rm-local-characters'] = JSON.stringify([
        mockLocalCharacter,
      ]);

      const loadPromise = service.load(1, '');

      const req = httpMock.expectOne(
        'https://rickandmortyapi.com/api/character?page=1'
      );
      req.error(new ErrorEvent('Network error'));

      await loadPromise;

      expect(service.characters()).toEqual([mockLocalCharacter]);
      expect(service.total()).toBe(1);
      expect(service.loading()).toBe(false);
    });

    it('deve definir o estado de loading corretamente durante a operação', async () => {
      expect(service.loading()).toBe(false);

      const loadPromise = service.load(1, '');
      expect(service.loading()).toBe(true);

      const req = httpMock.expectOne(
        'https://rickandmortyapi.com/api/character?page=1'
      );
      req.flush(mockApiResponse);

      await loadPromise;
      expect(service.loading()).toBe(false);
    });
  });

  describe('getById()', () => {
    it('deve retornar personagem do localStorage se existir', async () => {
      localStorageMock['rm-local-characters'] = JSON.stringify([
        mockLocalCharacter,
      ]);

      const result = await service.getById(-1);

      expect(result).toEqual(mockLocalCharacter);
      httpMock.expectNone('https://rickandmortyapi.com/api/character/-1');
    });

    it('deve buscar personagem da API se não estiver no localStorage', async () => {
      const getByIdPromise = service.getById(1);

      const req = httpMock.expectOne(
        'https://rickandmortyapi.com/api/character/1'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockCharacter);

      const result = await getByIdPromise;
      expect(result).toEqual(mockCharacter);
    });

    it('deve lidar com erro da API ao buscar por ID', async () => {
      const getByIdPromise = service.getById(999);

      const req = httpMock.expectOne(
        'https://rickandmortyapi.com/api/character/999'
      );
      req.error(new ErrorEvent('Not found'));

      try {
        await getByIdPromise;
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('addLocalCharacter()', () => {
    it('deve adicionar novo personagem local com ID negativo', async () => {
      const newCharacterData = {
        name: 'Novo Personagem',
        status: 'Alive' as const,
        species: 'Human',
        gender: 'Male' as const,
        image: 'new-image.jpg',
      };

      jest.spyOn(service, 'load').mockResolvedValue();

      const result = await service.addLocalCharacter(newCharacterData);

      expect(result.id).toBe(-1);
      expect(result.name).toBe('Novo Personagem');
      expect(result._local).toBe(true);
      expect(result._updatedAt).toBeDefined();
      expect(service.load).toHaveBeenCalledWith(1, '');
    });

    it('deve gerar IDs negativos sequenciais para múltiplos personagens locais', async () => {
      localStorageMock['rm-local-characters'] = JSON.stringify([
        mockLocalCharacter,
      ]);

      const newCharacterData = {
        name: 'Segundo Personagem',
        status: 'Dead' as const,
        species: 'Alien',
        gender: 'Female' as const,
        image: 'second-image.jpg',
      };

      jest.spyOn(service, 'load').mockResolvedValue();

      const result = await service.addLocalCharacter(newCharacterData);

      expect(result.id).toBe(-2);
      expect(localStorage.getItem).toHaveBeenCalledWith('rm-local-characters');
      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('editLocalCharacter()', () => {
    it('deve editar personagem local existente', async () => {
      localStorageMock['rm-local-characters'] = JSON.stringify([
        mockLocalCharacter,
      ]);

      const patch = {
        name: 'Personagem Local Atualizado',
        status: 'Dead' as const,
      };
      jest.spyOn(service, 'load').mockResolvedValue();

      await service.editLocalCharacter(-1, patch);

      const savedData = JSON.parse(localStorageMock['rm-local-characters']);
      expect(savedData[0].name).toBe('Personagem Local Atualizado');
      expect(savedData[0].status).toBe('Dead');
      expect(savedData[0]._updatedAt).toBeDefined();
      expect(service.load).toHaveBeenCalled();
    });

    it('deve criar cópia local ao editar personagem da API', async () => {
      localStorageMock['rm-local-characters'] = JSON.stringify([]);

      const patch = { name: 'Rick Editado' };
      jest.spyOn(service, 'load').mockResolvedValue();
      jest.spyOn(service, 'getById').mockResolvedValue(mockCharacter);

      await service.editLocalCharacter(1, patch);

      const savedData = JSON.parse(localStorageMock['rm-local-characters']);
      expect(savedData).toHaveLength(1);
      expect(savedData[0].id).toBe(1);
      expect(savedData[0].name).toBe('Rick Editado');
      expect(savedData[0]._local).toBe(true);
      expect(savedData[0]._updatedAt).toBeDefined();
    });

    it('deve lidar com caso onde personagem não é encontrado', async () => {
      localStorageMock['rm-local-characters'] = JSON.stringify([]);

      const patch = { name: 'Inexistente' };
      jest.spyOn(service, 'load').mockResolvedValue();
      jest.spyOn(service, 'getById').mockResolvedValue(undefined);

      await service.editLocalCharacter(999, patch);

      const savedData = JSON.parse(localStorageMock['rm-local-characters']);
      expect(savedData).toHaveLength(0);
    });
  });

  describe('deleteLocal()', () => {
    it('deve remover personagem do localStorage', async () => {
      const characters = [
        mockLocalCharacter,
        { ...mockCharacter, id: -2, _local: true },
      ];
      localStorageMock['rm-local-characters'] = JSON.stringify(characters);

      jest.spyOn(service, 'load').mockResolvedValue();

      await service.deleteLocal(-1);

      const savedData = JSON.parse(localStorageMock['rm-local-characters']);
      expect(savedData).toHaveLength(1);
      expect(savedData[0].id).toBe(-2);
      expect(service.load).toHaveBeenCalled();
    });

    it('deve lidar com exclusão de personagem inexistente', async () => {
      localStorageMock['rm-local-characters'] = JSON.stringify([
        mockLocalCharacter,
      ]);

      jest.spyOn(service, 'load').mockResolvedValue();

      await service.deleteLocal(999);

      const savedData = JSON.parse(localStorageMock['rm-local-characters']);
      expect(savedData).toHaveLength(1);
      expect(savedData[0].id).toBe(-1);
    });
  });

  describe('Operações do localStorage', () => {
    it('deve lidar com localStorage vazio graciosamente', async () => {
      const loadPromise = service.load(1, '');

      const req = httpMock.expectOne(
        'https://rickandmortyapi.com/api/character?page=1'
      );
      req.flush(mockApiResponse);

      await loadPromise;

      expect(service.characters()).toEqual([mockCharacter]);
      expect(localStorage.getItem).toHaveBeenCalledWith('rm-local-characters');
    });

    it('deve lidar com dados corrompidos no localStorage durante load', async () => {
      const originalParse = JSON.parse;
      JSON.parse = jest.fn().mockImplementation((data) => {
        if (data === 'json inválido') {
          throw new SyntaxError('Unexpected token');
        }
        return originalParse(data);
      });

      localStorageMock['rm-local-characters'] = 'json inválido';

      const loadPromise = service.load(1, '');

      const req = httpMock.expectOne(
        'https://rickandmortyapi.com/api/character?page=1'
      );
      req.error(new ErrorEvent('Network error'));

      await expect(loadPromise).rejects.toThrow();

      JSON.parse = originalParse;
    });

    it('deve lidar com JSON.parse falhando no readLocal durante getById', async () => {
      const originalParse = JSON.parse;
      JSON.parse = jest.fn().mockImplementation((data) => {
        if (data === 'json inválido') {
          throw new SyntaxError('Unexpected token');
        }
        return originalParse(data);
      });

      localStorageMock['rm-local-characters'] = 'json inválido';

      try {
        await service.getById(-999);
        fail('Deveria ter lançado erro');
      } catch (error) {
        expect(error).toBeInstanceOf(SyntaxError);
        expect((error as Error).message).toBe('Unexpected token');
      }

      JSON.parse = originalParse;
    });

    it('deve lidar com resposta vazia da API (results undefined)', async () => {
      const emptyApiResponse = {
        info: {
          count: 0,
          pages: 1,
          next: null,
          prev: null,
        },
        results: undefined, 
      };

      const loadPromise = service.load(1, '');

      const req = httpMock.expectOne(
        'https://rickandmortyapi.com/api/character?page=1'
      );
      req.flush(emptyApiResponse);

      await loadPromise;

      expect(service.characters()).toEqual([]);
      expect(service.total()).toBe(0);
    });

    it('deve lidar com resposta da API completamente null/undefined', async () => {
      const loadPromise = service.load(1, '');

      const req = httpMock.expectOne(
        'https://rickandmortyapi.com/api/character?page=1'
      );
      req.flush(null); 

      await loadPromise;

      expect(service.characters()).toEqual([]);
      expect(service.total()).toBe(0);
    });

    it('deve testar o método writeLocal diretamente através de addLocalCharacter', async () => {
      const newCharacterData = {
        name: 'Test Write',
        status: 'Alive' as const,
        species: 'Human',
        gender: 'Male' as const,
        image: 'test.jpg',
      };

      jest.spyOn(service, 'load').mockResolvedValue();

      await service.addLocalCharacter(newCharacterData);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'rm-local-characters',
        expect.any(String)
      );

      const savedData = JSON.parse(localStorageMock['rm-local-characters']);
      expect(savedData).toHaveLength(1);
      expect(savedData[0].name).toBe('Test Write');
    });

    it('deve testar load sem parâmetros (valores padrão)', async () => {
      const loadPromise = service.load(); 

      const req = httpMock.expectOne(
        'https://rickandmortyapi.com/api/character?page=1'
      );
      req.flush(mockApiResponse);

      await loadPromise;

      expect(service.page()).toBe(1);
      expect(service.query()).toBe('');
    });

    it('deve testar editLocalCharacter quando getById falha', async () => {
      localStorageMock['rm-local-characters'] = JSON.stringify([]);

      const patch = { name: 'Rick Editado' };
      jest.spyOn(service, 'load').mockResolvedValue();
      jest.spyOn(service, 'getById').mockRejectedValue(new Error('API Error'));

      await expect(service.editLocalCharacter(1, patch)).rejects.toThrow('API Error');
    });

    it('deve preservar state atual de page e query durante operações', async () => {
      service.page.set(3);
      service.query.set('test');

      jest.spyOn(service, 'load').mockResolvedValue();

      await service.deleteLocal(-1);

      expect(service.load).toHaveBeenCalledWith(3, 'test');
    });

    it('deve testar scenarios de API responses com diferentes estruturas', async () => {
      const apiResponseWithoutInfo = {
        results: [mockCharacter],
        info: {
          count: undefined, 
          next: null,
          prev: null,
        }
      };

      const loadPromise = service.load(1, '');

      const req = httpMock.expectOne(
        'https://rickandmortyapi.com/api/character?page=1'
      );
      req.flush(apiResponseWithoutInfo);

      await loadPromise;

      expect(service.characters()).toEqual([mockCharacter]);
      expect(service.total()).toBe(0); 
    });
  });

  describe('Testes de Edge Cases e Integrações', () => {
    it('deve manter consistência dos signals durante múltiplas operações', async () => {
      expect(service.loading()).toBe(false);
      
      const loadPromise = service.load(2, 'morty');
      expect(service.loading()).toBe(true);
      expect(service.page()).toBe(2);
      expect(service.query()).toBe('morty');

      const req = httpMock.expectOne(
        'https://rickandmortyapi.com/api/character?page=2&name=morty'
      );
      req.flush(mockApiResponse);

      await loadPromise;
      
      expect(service.loading()).toBe(false);
      expect(service.characters()).toEqual([mockCharacter]);
    });

    it('deve testar addLocalCharacter com reload do estado atual', async () => {
      service.page.set(5);
      service.query.set('search-term');

      const newCharacterData = {
        name: 'Test Reload',
        status: 'Alive' as const,
        species: 'Human',
        gender: 'Male' as const,
        image: 'test.jpg',
      };

      jest.spyOn(service, 'load').mockResolvedValue();

      await service.addLocalCharacter(newCharacterData);

      expect(service.load).toHaveBeenCalledWith(5, 'search-term');
    });
  });
});
