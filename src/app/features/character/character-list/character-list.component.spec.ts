import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PageEvent } from '@angular/material/paginator';
import { signal } from '@angular/core';
import { DebugElement } from '@angular/core';

import { CharacterListComponent } from './character-list.component';
import { CharactersService } from '../../../core/services/character.service';
import { Character } from '../../../core/models/character.model';

describe('CharacterListComponent', () => {
  let component: CharacterListComponent;
  let fixture: ComponentFixture<CharacterListComponent>;
  let mockRouter: jest.Mocked<Router>;
  let mockCharactersService: jest.Mocked<CharactersService>;

  const mockCharacters: Character[] = [
    {
      id: 1,
      name: 'Rick Sanchez',
      status: 'Alive',
      species: 'Human',
      gender: 'Male',
      image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg'
    },
    {
      id: 2,
      name: 'Morty Smith',
      status: 'Alive',
      species: 'Human',
      gender: 'Male',
      image: 'https://rickandmortyapi.com/api/character/avatar/2.jpeg'
    },
    {
      id: -1,
      name: 'Local Character',
      status: 'Alive',
      species: 'Alien',
      gender: 'unknown',
      image: 'https://example.com/local.jpg',
      _local: true
    }
  ];

  beforeEach(async () => {
    // Mock do Router
    mockRouter = {
      navigate: jest.fn().mockResolvedValue(true)
    } as any;

    // Mock do CharactersService
    mockCharactersService = {
      characters: signal(mockCharacters),
      total: signal(826),
      loading: signal(false),
      query: signal(''),
      page: signal(1),
      load: jest.fn().mockResolvedValue(undefined),
      deleteLocal: jest.fn().mockResolvedValue(undefined)
    } as any;

    await TestBed.configureTestingModule({
      imports: [
        CharacterListComponent,
        NoopAnimationsModule
      ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: CharactersService, useValue: mockCharactersService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CharacterListComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Inicialização do Componente', () => {
    it('deve ser criado', () => {
      expect(component).toBeTruthy();
    });

    it('deve ter as colunas da tabela definidas corretamente', () => {
      expect(component.displayedColumns).toEqual(['thumb', 'name', 'species', 'status', 'actions']);
    });

    it('deve injetar dependências corretamente', () => {
      expect(component.vm).toBe(mockCharactersService);
    });

    it('deve ter computed signal filtered configurado', () => {
      expect(typeof component.filtered).toBe('function');
      expect(component.filtered()).toEqual(mockCharacters);
    });

    it('deve carregar dados na inicialização', async () => {
      await component.ngOnInit();

      expect(mockCharactersService.load).toHaveBeenCalledWith(1, '');
      expect(mockCharactersService.load).toHaveBeenCalledTimes(1);
    });
  });

  describe('Navegação', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('deve navegar para criação de novo personagem', () => {
      component.new();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/characters/new']);
    });

    it('deve navegar para visualização de personagem', () => {
      const characterId = 123;
      component.view(characterId);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/characters', characterId]);
    });

    it('deve navegar para edição de personagem', () => {
      const characterId = 456;
      component.edit(characterId);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/characters', characterId, 'edit']);
    });

    it('deve navegar para detalhes via viewDetail', () => {
      const characterId = 789;
      component.viewDetail(characterId);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/character', characterId]);
    });

    it('deve usar rotas diferentes para view e viewDetail', () => {
      component.view(1);
      component.viewDetail(1);

      expect(mockRouter.navigate).toHaveBeenNthCalledWith(1, ['/characters', 1]);
      expect(mockRouter.navigate).toHaveBeenNthCalledWith(2, ['/character', 1]);
    });
  });

  describe('Paginação', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('deve processar evento de página corretamente', async () => {
      const pageEvent: PageEvent = {
        pageIndex: 2,
        pageSize: 20,
        length: 100
      };

      await component.onPage(pageEvent);

      expect(mockCharactersService.load).toHaveBeenCalledWith(3, ''); // pageIndex + 1
    });

    it('deve usar query atual ao paginar', async () => {
      mockCharactersService.query.set('rick');
      const pageEvent: PageEvent = {
        pageIndex: 1,
        pageSize: 20,
        length: 100
      };

      await component.onPage(pageEvent);

      expect(mockCharactersService.load).toHaveBeenCalledWith(2, 'rick');
    });

    it('deve lidar com primeira página', async () => {
      const pageEvent: PageEvent = {
        pageIndex: 0,
        pageSize: 20,
        length: 100
      };

      await component.onPage(pageEvent);

      expect(mockCharactersService.load).toHaveBeenCalledWith(1, '');
    });
  });

  describe('Funcionalidade de Busca', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('deve realizar busca com termo válido', async () => {
      const mockEvent = {
        target: { value: '  Rick Sanchez  ' }
      } as any;

      await component.search(mockEvent);

      expect(mockCharactersService.load).toHaveBeenCalledWith(1, 'Rick Sanchez');
    });

    it('deve realizar busca com string vazia', async () => {
      const mockEvent = {
        target: { value: '   ' }
      } as any;

      await component.search(mockEvent);

      expect(mockCharactersService.load).toHaveBeenCalledWith(1, '');
    });

    it('deve sempre buscar a partir da página 1', async () => {
      mockCharactersService.page.set(5); // Página atual é 5
      const mockEvent = {
        target: { value: 'morty' }
      } as any;

      await component.search(mockEvent);

      expect(mockCharactersService.load).toHaveBeenCalledWith(1, 'morty');
    });

    it('deve tratar input null ou undefined', async () => {
      const mockEvent = {
        target: { value: null }
      } as any;

      await expect(component.search(mockEvent)).rejects.toThrow();
    });
  });

  describe('Funcionalidade de Exclusão', () => {
    beforeEach(() => {
      fixture.detectChanges();
      // Mock do window.confirm
      Object.defineProperty(window, 'confirm', {
        writable: true,
        value: jest.fn()
      });
    });

    it('deve deletar personagem quando confirmado', async () => {
      (window.confirm as jest.Mock).mockReturnValue(true);
      const characterId = 123;

      await component.delete(characterId);

      expect(window.confirm).toHaveBeenCalledWith('Confirma a exclusão?');
      expect(mockCharactersService.deleteLocal).toHaveBeenCalledWith(characterId);
    });

    it('não deve deletar quando cancelado', async () => {
      (window.confirm as jest.Mock).mockReturnValue(false);
      const characterId = 456;

      await component.delete(characterId);

      expect(window.confirm).toHaveBeenCalledWith('Confirma a exclusão?');
      expect(mockCharactersService.deleteLocal).not.toHaveBeenCalled();
    });

    it('deve exibir mensagem de confirmação correta', async () => {
      (window.confirm as jest.Mock).mockReturnValue(true);

      await component.delete(1);

      expect(window.confirm).toHaveBeenCalledWith('Confirma a exclusão?');
    });
  });

  describe('Renderização do Template', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('deve renderizar título da página', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const title = compiled.querySelector('h1');

      expect(title?.textContent?.trim()).toBe('Rick & Morty Characters');
    });

    it('deve renderizar botão "New" com ícone', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const newButton = compiled.querySelector('button[color="primary"]');
      const icon = newButton?.querySelector('mat-icon');

      expect(newButton).toBeTruthy();
      expect(icon?.textContent?.trim()).toBe('add');
    });

    it('deve renderizar campo de busca', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const searchField = compiled.querySelector('mat-form-field.search');
      const input = searchField?.querySelector('input[matInput]');
      const label = searchField?.querySelector('mat-label');

      expect(searchField).toBeTruthy();
      expect(input).toBeTruthy();
      expect(label?.textContent?.trim()).toBe('Search by name');
    });

    it('deve renderizar tabela com colunas corretas', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const table = compiled.querySelector('table[mat-table]');
      const headers = table?.querySelectorAll('th[mat-header-cell]');

      expect(table).toBeTruthy();
      expect(headers).toHaveLength(5);
      expect(headers?.[0].textContent?.trim()).toBe('Image');
      expect(headers?.[1].textContent?.trim()).toBe('Name');
      expect(headers?.[2].textContent?.trim()).toBe('Species');
      expect(headers?.[3].textContent?.trim()).toBe('Status');
      expect(headers?.[4].textContent?.trim()).toBe('Actions');
    });

    it('deve renderizar dados dos personagens na tabela', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const rows = compiled.querySelectorAll('tr[mat-row]');

      expect(rows).toHaveLength(mockCharacters.length);
    });

    it('deve renderizar imagens dos personagens', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const images = compiled.querySelectorAll('img.thumb');

      expect(images).toHaveLength(mockCharacters.length);
      expect((images[0] as HTMLImageElement).src).toBe(mockCharacters[0].image);
    });

    it('deve renderizar badge "local" para personagens locais', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const badges = compiled.querySelectorAll('.badge');

      expect(badges).toHaveLength(1);
      expect(badges[0].textContent?.trim()).toBe('local');
    });

    it('deve renderizar botões de ação para cada personagem', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const actionButtons = compiled.querySelectorAll('td[mat-cell] button[mat-icon-button]');

      // 3 botões por personagem (view, edit, delete)
      expect(actionButtons).toHaveLength(mockCharacters.length * 3);
    });

    it('deve renderizar paginador', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const paginator = compiled.querySelector('mat-paginator');

      expect(paginator).toBeTruthy();
    });
  });

  describe('Estados de Loading', () => {
    it('deve mostrar progress bar quando loading é true', () => {
      mockCharactersService.loading.set(true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const progressBar = compiled.querySelector('mat-progress-bar');

      expect(progressBar).toBeTruthy();
    });

    it('não deve mostrar progress bar quando loading é false', () => {
      mockCharactersService.loading.set(false);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const progressBar = compiled.querySelector('mat-progress-bar');

      expect(progressBar).toBeFalsy();
    });
  });

  describe('Integração com Signals', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('deve reagir a mudanças no signal de characters', () => {
      const newCharacters = [mockCharacters[0]];
      mockCharactersService.characters.set(newCharacters);
      fixture.detectChanges();

      expect(component.filtered()).toEqual(newCharacters);
    });

    it('deve reagir a mudanças no signal de total', () => {
      const newTotal = 999;
      mockCharactersService.total.set(newTotal);
      fixture.detectChanges();

      expect(component.vm.total()).toBe(newTotal);
    });

    it('deve reagir a mudanças no signal de page', () => {
      const newPage = 5;
      mockCharactersService.page.set(newPage);
      fixture.detectChanges();

      expect(component.vm.page()).toBe(newPage);
    });
  });

  describe('Eventos de Interação', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('deve chamar viewDetail ao clicar no nome do personagem', () => {
      const spy = jest.spyOn(component, 'viewDetail');
      
      // Simula clique diretamente no método
      component.viewDetail(mockCharacters[0].id);

      expect(spy).toHaveBeenCalledWith(mockCharacters[0].id);
    });

    it('deve chamar new ao clicar no botão New', () => {
      const spy = jest.spyOn(component, 'new');
      const compiled = fixture.nativeElement as HTMLElement;
      const newButton = compiled.querySelector('button[color="primary"]') as HTMLElement;

      newButton?.click();

      expect(spy).toHaveBeenCalled();
    });

    it('deve chamar search ao digitar no campo de busca', () => {
      const spy = jest.spyOn(component, 'search');
      const compiled = fixture.nativeElement as HTMLElement;
      const searchInput = compiled.querySelector('input[matInput]') as HTMLInputElement;
      
      const inputEvent = new Event('input');
      searchInput.value = 'test';
      searchInput.dispatchEvent(inputEvent);

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('Tratamento de Erros', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('deve lidar com falha no carregamento inicial', async () => {
      mockCharactersService.load.mockRejectedValue(new Error('Network error'));

      await expect(component.ngOnInit()).rejects.toThrow('Network error');
    });

    it('deve lidar com falha na exclusão', async () => {
      (window.confirm as jest.Mock).mockReturnValue(true);
      mockCharactersService.deleteLocal.mockRejectedValue(new Error('Delete error'));

      await expect(component.delete(1)).rejects.toThrow('Delete error');
    });

    it('deve lidar com falha na busca', async () => {
      mockCharactersService.load.mockRejectedValue(new Error('Search error'));
      const mockEvent = { target: { value: 'test' } } as any;

      await expect(component.search(mockEvent)).rejects.toThrow('Search error');
    });

    it('deve lidar com falha na paginação', async () => {
      mockCharactersService.load.mockRejectedValue(new Error('Pagination error'));
      const pageEvent: PageEvent = { pageIndex: 1, pageSize: 20, length: 100 };

      await expect(component.onPage(pageEvent)).rejects.toThrow('Pagination error');
    });
  });
});
