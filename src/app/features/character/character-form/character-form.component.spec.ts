import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';

import { CharacterFormComponent } from './character-form.component';
import { CharactersService } from '../../../core/services/character.service';
import { Character } from '../../../core/models/character.model';

describe('CharacterFormComponent', () => {
  let component: CharacterFormComponent;
  let fixture: ComponentFixture<CharacterFormComponent>;
  let mockRouter: jest.Mocked<Router>;
  let mockActivatedRoute: any;
  let mockCharactersService: jest.Mocked<CharactersService>;

  const mockCharacter: Character = {
    id: 1,
    name: 'Rick Sanchez',
    status: 'Alive',
    species: 'Human',
    gender: 'Male',
    image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg'
  };

  const mockLocalCharacter: Character = {
    id: -1,
    name: 'Local Character',
    status: 'Dead',
    species: 'Alien',
    gender: 'Female',
    image: 'https://example.com/local.jpg',
    _local: true
  };

  beforeEach(async () => {
    // Mock do Router
    mockRouter = {
      navigate: jest.fn().mockResolvedValue(true)
    } as any;

    // Mock do ActivatedRoute
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jest.fn()
        }
      }
    };

    // Mock do CharactersService
    mockCharactersService = {
      characters: signal([mockCharacter, mockLocalCharacter]),
      total: signal(2),
      loading: signal(false),
      query: signal(''),
      page: signal(1),
      getById: jest.fn(),
      addLocalCharacter: jest.fn().mockResolvedValue(mockLocalCharacter),
      editLocalCharacter: jest.fn().mockResolvedValue(undefined)
    } as any;

    await TestBed.configureTestingModule({
      imports: [
        CharacterFormComponent,
        ReactiveFormsModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: CharactersService, useValue: mockCharactersService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CharacterFormComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Inicialização do Componente', () => {
    it('deve ser criado', () => {
      expect(component).toBeTruthy();
    });

    it('deve inicializar formulário com valores padrão', () => {
      expect(component.form).toBeDefined();
      expect(component.form.get('status')?.value).toBe('unknown');
      expect(component.form.get('gender')?.value).toBe('unknown');
    });

    it('deve inicializar ID como null', () => {
      expect(component.id()).toBeNull();
    });

    it('deve ter computed signal title configurado', () => {
      expect(typeof component.title).toBe('function');
    });

    it('deve configurar validadores do formulário corretamente', () => {
      const nameControl = component.form.get('name');
      const speciesControl = component.form.get('species');
      const statusControl = component.form.get('status');
      const genderControl = component.form.get('gender');
      const imageControl = component.form.get('image');

      expect(nameControl?.hasError('required')).toBe(true);
      expect(speciesControl?.hasError('required')).toBe(true);
      expect(statusControl?.hasError('required')).toBe(false); // Tem valor padrão
      expect(genderControl?.hasError('required')).toBe(false); // Tem valor padrão
      expect(imageControl?.hasError('required')).toBe(true);
    });
  });

  describe('Inicialização para Novo Personagem', () => {
    beforeEach(async () => {
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue(null);
      await component.ngOnInit();
      fixture.detectChanges();
    });

    it('deve configurar valores padrão para novo personagem', () => {
      expect(component.id()).toBeNull();
      expect(component.form.get('status')?.value).toBe('Alive');
      expect(component.form.get('gender')?.value).toBe('Male');
      expect(component.form.get('image')?.value).toBe('https://rickandmortyapi.com/api/character/avatar/1.jpeg');
    });

    it('deve ter título "New Character"', () => {
      expect(component.title()).toBe('New Character');
    });

    it('não deve chamar getById quando não há ID', async () => {
      expect(mockCharactersService.getById).not.toHaveBeenCalled();
    });
  });

  describe('Inicialização para Edição de Personagem', () => {
    beforeEach(async () => {
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue('1');
      mockCharactersService.getById.mockResolvedValue(mockCharacter);
      await component.ngOnInit();
      fixture.detectChanges();
    });

    it('deve configurar ID do personagem', () => {
      expect(component.id()).toBe(1);
    });

    it('deve ter título "Edit Character"', () => {
      expect(component.title()).toBe('Edit Character');
    });

    it('deve chamar getById com ID correto', () => {
      expect(mockCharactersService.getById).toHaveBeenCalledWith(1);
    });

    it('deve preencher formulário com dados do personagem', () => {
      expect(component.form.get('name')?.value).toBe(mockCharacter.name);
      expect(component.form.get('species')?.value).toBe(mockCharacter.species);
      expect(component.form.get('status')?.value).toBe(mockCharacter.status);
      expect(component.form.get('gender')?.value).toBe(mockCharacter.gender);
      expect(component.form.get('image')?.value).toBe(mockCharacter.image);
    });
  });

  describe('Inicialização com Personagem Inexistente', () => {
    beforeEach(async () => {
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue('999');
      mockCharactersService.getById.mockResolvedValue(undefined);
      await component.ngOnInit();
      fixture.detectChanges();
    });

    it('deve configurar ID mesmo quando personagem não existe', () => {
      expect(component.id()).toBe(999);
    });

    it('deve ter título "Edit Character"', () => {
      expect(component.title()).toBe('Edit Character');
    });

    it('não deve preencher formulário quando personagem não existe', () => {
      expect(component.form.get('name')?.value).toBe('');
    });
  });

  describe('Validações do Formulário', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('deve ser inválido quando campos obrigatórios estão vazios', () => {
      component.form.patchValue({
        name: '',
        species: '',
        image: ''
      });

      expect(component.form.invalid).toBe(true);
      expect(component.form.get('name')?.hasError('required')).toBe(true);
      expect(component.form.get('species')?.hasError('required')).toBe(true);
      expect(component.form.get('image')?.hasError('required')).toBe(true);
    });

    it('deve validar nome com minLength', () => {
      component.form.patchValue({ name: 'a' });

      expect(component.form.get('name')?.hasError('minlength')).toBe(true);
    });

    it('deve ser válido quando todos os campos estão preenchidos corretamente', () => {
      component.form.patchValue({
        name: 'Test Character',
        species: 'Human',
        status: 'Alive',
        gender: 'Male',
        image: 'https://example.com/image.jpg'
      });

      expect(component.form.valid).toBe(true);
    });

    it('deve aceitar nome com minLength válido', () => {
      component.form.patchValue({ name: 'Ab' });

      expect(component.form.get('name')?.hasError('minlength')).toBe(false);
    });

    it('deve ter status e gender válidos por padrão', () => {
      expect(component.form.get('status')?.valid).toBe(true);
      expect(component.form.get('gender')?.valid).toBe(true);
    });

    it('deve validar nome com maxLength', () => {
      const longName = 'a'.repeat(51); // 51 caracteres
      component.form.patchValue({ name: longName });

      expect(component.form.get('name')?.hasError('maxlength')).toBe(true);
    });

    it('deve aceitar nome com maxLength válido', () => {
      const validName = 'a'.repeat(50); // 50 caracteres
      component.form.patchValue({ name: validName });

      expect(component.form.get('name')?.hasError('maxlength')).toBe(false);
    });

    it('deve validar species com maxLength', () => {
      const longSpecies = 'a'.repeat(31); // 31 caracteres
      component.form.patchValue({ species: longSpecies });

      expect(component.form.get('species')?.hasError('maxlength')).toBe(true);
    });

    it('deve aceitar species com maxLength válido', () => {
      const validSpecies = 'a'.repeat(30); // 30 caracteres
      component.form.patchValue({ species: validSpecies });

      expect(component.form.get('species')?.hasError('maxlength')).toBe(false);
    });

    it('deve validar image com maxLength', () => {
      const longImage = 'https://example.com/' + 'a'.repeat(500); // Mais de 500 caracteres
      component.form.patchValue({ image: longImage });

      expect(component.form.get('image')?.hasError('maxlength')).toBe(true);
    });

    it('deve aceitar image com maxLength válido', () => {
      const validImage = 'https://example.com/' + 'a'.repeat(480); // Menos de 500 caracteres
      component.form.patchValue({ image: validImage });

      expect(component.form.get('image')?.hasError('maxlength')).toBe(false);
    });
  });

  describe('Salvamento de Novo Personagem', () => {
    beforeEach(async () => {
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue(null);
      await component.ngOnInit();
      fixture.detectChanges();

      component.form.patchValue({
        name: 'New Character',
        species: 'Alien',
        status: 'Alive',
        gender: 'Female',
        image: 'https://example.com/new.jpg'
      });
    });

    it('deve chamar addLocalCharacter ao salvar novo personagem', async () => {
      await component.save();

      expect(mockCharactersService.addLocalCharacter).toHaveBeenCalledWith({
        name: 'New Character',
        species: 'Alien',
        status: 'Alive',
        gender: 'Female',
        image: 'https://example.com/new.jpg'
      });
    });

    it('deve navegar para lista após salvar', async () => {
      await component.save();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/character']);
    });

    it('não deve salvar formulário inválido', async () => {
      component.form.patchValue({ name: '' });

      await component.save();

      expect(mockCharactersService.addLocalCharacter).not.toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('deve marcar todos os campos como touched quando formulário inválido', async () => {
      component.form.patchValue({ name: '' });
      const markAllAsTouchedSpy = jest.spyOn(component.form, 'markAllAsTouched');

      await component.save();

      expect(markAllAsTouchedSpy).toHaveBeenCalled();
    });
  });

  describe('Edição de Personagem Existente', () => {
    beforeEach(async () => {
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue('1');
      mockCharactersService.getById.mockResolvedValue(mockCharacter);
      await component.ngOnInit();
      fixture.detectChanges();
    });

    it('deve chamar editLocalCharacter ao salvar personagem existente', async () => {
      component.form.patchValue({
        name: 'Updated Character',
        species: 'Updated Species'
      });

      await component.save();

      expect(mockCharactersService.editLocalCharacter).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          name: 'Updated Character',
          species: 'Updated Species'
        })
      );
    });

    it('deve navegar para lista após editar', async () => {
      await component.save();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/character']);
    });

    it('não deve editar se editLocalCharacter não existe', async () => {
      delete (mockCharactersService as any).editLocalCharacter;

      await component.save();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/character']);
    });
  });

  describe('Cancelamento', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('deve navegar para lista ao cancelar', () => {
      component.cancel();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/character']);
    });

    it('deve cancelar independente do estado do formulário', () => {
      component.form.patchValue({ name: 'Some changes' });
      component.cancel();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/character']);
    });
  });

  describe('Título Dinâmico', () => {
    it('deve retornar "New Character" quando ID é null', () => {
      component.id.set(null);
      expect(component.title()).toBe('New Character');
    });

    it('deve retornar "Edit Character" quando ID existe', () => {
      component.id.set(123);
      expect(component.title()).toBe('Edit Character');
    });

    it('deve reagir a mudanças no signal ID', () => {
      component.id.set(null);
      expect(component.title()).toBe('New Character');

      component.id.set(456);
      expect(component.title()).toBe('Edit Character');
    });
  });

  describe('Renderização do Template', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('deve renderizar título da página', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const title = compiled.querySelector('h2');

      expect(title?.textContent?.trim()).toBe('New Character');
    });

    it('deve renderizar formulário', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const form = compiled.querySelector('form');

      expect(form).toBeTruthy();
    });

    it('deve renderizar preview de imagem', () => {
      component.form.patchValue({ image: 'https://example.com/test.jpg' });
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const img = compiled.querySelector('.preview img') as HTMLImageElement;

      expect(img).toBeTruthy();
      expect(img.src).toBe('https://example.com/test.jpg');
    });

    it('deve renderizar campos do formulário', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const nameField = compiled.querySelector('input[formControlName="name"]');
      const speciesField = compiled.querySelector('input[formControlName="species"]');
      const statusSelect = compiled.querySelector('mat-select[formControlName="status"]');
      const genderSelect = compiled.querySelector('mat-select[formControlName="gender"]');
      const imageField = compiled.querySelector('input[formControlName="image"]');

      expect(nameField).toBeTruthy();
      expect(speciesField).toBeTruthy();
      expect(statusSelect).toBeTruthy();
      expect(genderSelect).toBeTruthy();
      expect(imageField).toBeTruthy();
    });

    it('deve renderizar botões de ação', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const saveButton = compiled.querySelector('button[type="submit"]');
      const cancelButton = compiled.querySelector('button[type="button"]');

      expect(saveButton?.textContent?.trim()).toBe('Save');
      expect(cancelButton?.textContent?.trim()).toBe('Cancel');
    });

    it('deve renderizar select de Status', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const statusSelect = compiled.querySelector('mat-select[formControlName="status"]');

      expect(statusSelect).toBeTruthy();
    });

    it('deve renderizar select de Gender', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const genderSelect = compiled.querySelector('mat-select[formControlName="gender"]');

      expect(genderSelect).toBeTruthy();
    });
  });

  describe('Eventos de Interação', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('deve chamar save ao submeter formulário', () => {
      const spy = jest.spyOn(component, 'save').mockImplementation();
      const compiled = fixture.nativeElement as HTMLElement;
      const form = compiled.querySelector('form') as HTMLFormElement;

      form.dispatchEvent(new Event('submit'));

      expect(spy).toHaveBeenCalled();
    });

    it('deve chamar cancel ao clicar no botão Cancel', () => {
      const spy = jest.spyOn(component, 'cancel');
      const compiled = fixture.nativeElement as HTMLElement;
      const cancelButton = compiled.querySelector('button[type="button"]') as HTMLButtonElement;

      cancelButton.click();

      expect(spy).toHaveBeenCalled();
    });

    it('deve atualizar preview da imagem ao alterar URL', () => {
      const newImageUrl = 'https://example.com/new-image.jpg';
      component.form.patchValue({ image: newImageUrl });
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const img = compiled.querySelector('.preview img') as HTMLImageElement;

      expect(img.src).toBe(newImageUrl);
    });
  });

  describe('Tratamento de Erros', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('deve lidar com erro ao buscar personagem por ID', async () => {
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue('1');
      mockCharactersService.getById.mockRejectedValue(new Error('Network error'));

      await expect(component.ngOnInit()).rejects.toThrow('Network error');
    });

    it('deve lidar com erro ao salvar novo personagem', async () => {
      component.form.patchValue({
        name: 'Test',
        species: 'Test',
        image: 'test.jpg'
      });
      mockCharactersService.addLocalCharacter.mockRejectedValue(new Error('Save error'));

      await expect(component.save()).rejects.toThrow('Save error');
    });

    it('deve lidar com erro ao editar personagem', async () => {
      component.id.set(1);
      component.form.patchValue({
        name: 'Test',
        species: 'Test',
        image: 'test.jpg'
      });
      mockCharactersService.editLocalCharacter.mockRejectedValue(new Error('Edit error'));

      await expect(component.save()).rejects.toThrow('Edit error');
    });

    it('deve lidar com ID inválido na URL', async () => {
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue('invalid');

      await component.ngOnInit();

      expect(component.id()).toBeNaN();
    });

    it('deve funcionar quando getById não existe no service', async () => {
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue('1');
      delete (mockCharactersService as any).getById;

      await component.ngOnInit();

      expect(component.id()).toBe(1);
      expect(component.form.get('name')?.value).toBe('');
    });
  });

  describe('Estados do Formulário', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('deve mostrar erros de validação quando campos são touched', () => {
      const nameControl = component.form.get('name');
      nameControl?.markAsTouched();
      nameControl?.setValue('');

      expect(nameControl?.invalid).toBe(true);
      expect(nameControl?.hasError('required')).toBe(true);
    });

    it('deve limpar erros quando campos são preenchidos corretamente', () => {
      const nameControl = component.form.get('name');
      nameControl?.setValue('Valid Name');

      expect(nameControl?.valid).toBe(true);
      expect(nameControl?.hasError('required')).toBe(false);
      expect(nameControl?.hasError('minlength')).toBe(false);
    });

    it('deve manter estado pristine até primeira alteração', () => {
      expect(component.form.pristine).toBe(true);

      const nameControl = component.form.get('name');
      nameControl?.setValue('Changed');
      nameControl?.markAsDirty();

      expect(component.form.pristine).toBe(false);
    });

    it('deve marcar formulário como dirty após alterações', () => {
      expect(component.form.dirty).toBe(false);

      const nameControl = component.form.get('name');
      nameControl?.setValue('Test');
      nameControl?.markAsDirty();

      expect(component.form.dirty).toBe(true);
    });
  });

  describe('Integração com Signals', () => {
    it('deve reagir a mudanças no signal ID', () => {
      expect(component.title()).toBe('New Character');

      component.id.set(123);
      expect(component.title()).toBe('Edit Character');

      component.id.set(null);
      expect(component.title()).toBe('New Character');
    });

    it('deve manter reatividade do computed signal', () => {
      const titles: string[] = [];
      
      // Simula subscription ao computed signal
      titles.push(component.title());
      
      component.id.set(1);
      titles.push(component.title());
      
      component.id.set(null);
      titles.push(component.title());

      expect(titles).toEqual(['New Character', 'Edit Character', 'New Character']);
    });
  });
});