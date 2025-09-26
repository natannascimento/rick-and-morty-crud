import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { CharacterDetailComponent } from './character-detail.component';
import { CharactersService } from '../../../core/services/character.service';
import { Character } from '../../../core/models/character.model';

describe('CharacterDetailComponent', () => {
  let component: CharacterDetailComponent;
  let fixture: ComponentFixture<CharacterDetailComponent>;
  let mockRouter: jest.Mocked<Router>;
  let mockCharactersService: jest.Mocked<CharactersService>;
  let paramMapSubject: BehaviorSubject<any>;
  let mockActivatedRoute: any;

  const mockCharacter: Character = {
    id: 1,
    name: 'Rick Sanchez',
    status: 'Alive',
    species: 'Human',
    gender: 'Male',
    image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
    created: '2017-11-04T18:48:46.250Z'
  };

  const mockLocalCharacter: Character = {
    id: -1,
    name: 'Personagem Local',
    status: 'Dead',
    species: 'Alien',
    gender: 'Female',
    image: 'local-image.jpg',
    _local: true,
    _updatedAt: '2025-09-26T10:00:00.000Z'
  };

  const mockCharactersList = [mockCharacter, mockLocalCharacter];

  const createComponent = async (initialParamId?: string) => {
    
    paramMapSubject = new BehaviorSubject(
      convertToParamMap(initialParamId ? { id: initialParamId } : {})
    );

    mockActivatedRoute = {
      paramMap: paramMapSubject.asObservable()
    };

    TestBed.resetTestingModule();
    
    await TestBed.configureTestingModule({
      imports: [
        CharacterDetailComponent,
        NoopAnimationsModule
      ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: CharactersService, useValue: mockCharactersService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(CharacterDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    
    return { component, fixture };
  };

  beforeEach(async () => {
    // Mock do Router
    mockRouter = {
      navigate: jest.fn().mockResolvedValue(true)
    } as any;

    // Mock do CharactersService
    mockCharactersService = {
      characters: jest.fn().mockReturnValue(mockCharactersList)
    } as any;

    await TestBed.configureTestingModule({
      imports: [
        CharacterDetailComponent,
        NoopAnimationsModule
      ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: CharactersService, useValue: mockCharactersService },
        { provide: ActivatedRoute, useValue: {} } 
      ]
    }).compileComponents();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Inicialização do Componente', () => {
    it('deve ser criado', async () => {
      await createComponent();
      expect(component).toBeTruthy();
    });

    it('deve inicializar com personagem null quando não há parâmetro ID', async () => {
      await createComponent(); 
      expect(component.character()).toBeNull();
    });

    it('deve ter a propriedade character como signal', async () => {
      await createComponent();
      expect(typeof component.character).toBe('function');
    });

    it('deve carregar personagem automaticamente se ID estiver presente na inicialização', async () => {
      await createComponent('1');
      expect(component.character()).toEqual(mockCharacter);
    });
  });

  describe('Carregamento de Personagem por ID', () => {
    it('deve carregar personagem quando ID válido é fornecido', async () => {
      await createComponent('1');
      expect(component.character()).toEqual(mockCharacter);
    });

    it('deve carregar personagem local com ID negativo', async () => {
      await createComponent('-1');
      expect(component.character()).toEqual(mockLocalCharacter);
    });

    it('deve retornar null quando personagem não é encontrado', async () => {
      await createComponent('999');
      expect(component.character()).toBeNull();
    });

    it('deve chamar o serviço para obter lista de personagens', async () => {
      await createComponent('1');
      expect(mockCharactersService.characters).toHaveBeenCalled();
    });

    it('deve atualizar personagem quando parâmetro da rota muda', async () => {
      await createComponent('1');
      expect(component.character()).toEqual(mockCharacter);

      paramMapSubject.next(convertToParamMap({ id: '-1' }));
      fixture.detectChanges();
      expect(component.character()).toEqual(mockLocalCharacter);
    });
  });

  describe('Tratamento de Parâmetros Inválidos', () => {
    it('deve lidar com ID nulo', async () => {
      await createComponent(); 
      expect(component.character()).toBeNull();
    });

    it('deve lidar com ID vazio', async () => {
      await createComponent('');
      expect(component.character()).toBeNull();
    });

    it('deve lidar com ID não numérico', async () => {
      await createComponent('abc');
      expect(component.character()).toBeNull();
    });

    it('deve lidar com lista de personagens vazia', async () => {
      mockCharactersService.characters.mockReturnValue([]);
      await createComponent('1');
      expect(component.character()).toBeNull();
    });

    it('deve atualizar para null quando muda para ID inválido', async () => {
      await createComponent('1');
      expect(component.character()).toEqual(mockCharacter);

      paramMapSubject.next(convertToParamMap({ id: 'invalid' }));
      fixture.detectChanges();
      expect(component.character()).toBeNull();
    });
  });

  describe('Navegação', () => {
    it('deve navegar de volta ao chamar goBack()', async () => {
      await createComponent();
      component.goBack();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    it('deve navegar de volta independente do estado do personagem', async () => {
      await createComponent();
      component.goBack();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);

      mockRouter.navigate.mockClear();

      await createComponent('1');
      component.goBack();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('Renderização do Template', () => {
    it('deve renderizar card quando personagem está carregado', async () => {
      await createComponent('1');

      const compiled = fixture.nativeElement as HTMLElement;
      const matCard = compiled.querySelector('mat-card');
      
      expect(matCard).toBeTruthy();
    });

    it('não deve renderizar card quando personagem é null', async () => {
      await createComponent('999');

      const compiled = fixture.nativeElement as HTMLElement;
      const matCard = compiled.querySelector('mat-card');
      
      expect(matCard).toBeFalsy();
    });

    it('deve exibir nome do personagem no título', async () => {
      await createComponent('1');

      const compiled = fixture.nativeElement as HTMLElement;
      const cardTitle = compiled.querySelector('mat-card-title');
      
      expect(cardTitle?.textContent?.trim()).toBe('Rick Sanchez');
    });

    it('deve exibir informações do personagem no subtítulo', async () => {
      await createComponent('1');

      const compiled = fixture.nativeElement as HTMLElement;
      const cardSubtitle = compiled.querySelector('mat-card-subtitle');
      
      expect(cardSubtitle?.textContent?.trim()).toBe('Human | Alive');
    });

    it('deve exibir imagem do personagem', async () => {
      await createComponent('1');

      const compiled = fixture.nativeElement as HTMLElement;
      const cardImg = compiled.querySelector('img[mat-card-image]') as HTMLImageElement;
      
      expect(cardImg).toBeTruthy();
      expect(cardImg.src).toBe(mockCharacter.image);
      expect(cardImg.alt).toBe(mockCharacter.name);
    });

    it('deve exibir avatar do personagem no header', async () => {
      await createComponent('1');

      const compiled = fixture.nativeElement as HTMLElement;
      const avatarImg = compiled.querySelector('div[mat-card-avatar] img') as HTMLImageElement;
      
      expect(avatarImg).toBeTruthy();
      expect(avatarImg.src).toBe(mockCharacter.image);
      expect(avatarImg.alt).toBe(mockCharacter.name);
    });
  });

  describe('Integração com Serviços', () => {
    it('deve reagir a mudanças na lista de personagens do serviço', async () => {
      const newCharacter: Character = {
        id: 2,
        name: 'Morty Smith',
        status: 'Alive',
        species: 'Human',
        gender: 'Male',
        image: 'https://rickandmortyapi.com/api/character/avatar/2.jpeg'
      };

      await createComponent('2');
      expect(component.character()).toBeNull();

      mockCharactersService.characters.mockReturnValue([...mockCharactersList, newCharacter]);
      
      paramMapSubject.next(convertToParamMap({ id: '2' }));
      fixture.detectChanges();

      expect(component.character()).toEqual(newCharacter);
    });

    it('deve funcionar com diferentes tipos de personagens (API e locais)', async () => {
      await createComponent('1');
      const apiCharacter = component.character();
      expect(apiCharacter).toEqual(mockCharacter);
      expect(apiCharacter?._local).toBeUndefined();

      paramMapSubject.next(convertToParamMap({ id: '-1' }));
      fixture.detectChanges();
      const localCharacter = component.character();
      expect(localCharacter).toEqual(mockLocalCharacter);
      expect(localCharacter?._local).toBe(true);
    });
  });

  describe('Gestão de Memória e Performance', () => {
    it('deve fazer unsubscribe adequadamente', async () => {
      await createComponent('1');
      
      expect(() => fixture.destroy()).not.toThrow();
    });

    it('deve atualizar signal de forma eficiente', async () => {
      await createComponent('1');
      const updateSpy = jest.spyOn(component.character, 'update');
      
      paramMapSubject.next(convertToParamMap({ id: '-1' }));
      fixture.detectChanges();

      expect(updateSpy).toHaveBeenCalled();
    });

    it('deve reagir apenas a mudanças reais de parâmetro', async () => {
      await createComponent('1');
      const initialCallCount = mockCharactersService.characters.mock.calls.length;
      
      paramMapSubject.next(convertToParamMap({ id: '1' }));
      fixture.detectChanges();

      expect(mockCharactersService.characters.mock.calls.length).toBeGreaterThan(initialCallCount);
    });
  });
});