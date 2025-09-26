import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Location } from '@angular/common';
import { Routes } from '@angular/router';
import { provideLocationMocks } from '@angular/common/testing';
import { CHARACTERS_ROUTES } from './character.routes';

@Component({
  template: '<h1>Lista de Personagens</h1>',
  standalone: true
})
class MockCharacterListComponent { }

@Component({
  template: '<h1>Formulário de Personagem</h1>',
  standalone: true
})
class MockCharacterFormComponent { }

@Component({
  template: '<h1>Detalhes do Personagem</h1>',
  standalone: true
})
class MockCharacterDetailComponent { }

jest.mock('./character-list/character-list.component', () => ({
  CharacterListComponent: MockCharacterListComponent
}));

jest.mock('./character-form/character-form.component', () => ({
  CharacterFormComponent: MockCharacterFormComponent
}));

jest.mock('./character-detail/character-detail.component', () => ({
  CharacterDetailComponent: MockCharacterDetailComponent
}));

describe('Character Routes', () => {
  let router: Router;
  let location: Location;

  beforeEach(async () => {
    const testRoutes: Routes = [
      {
        path: 'characters',
        children: CHARACTERS_ROUTES
      },
      {
        path: '',
        redirectTo: '/characters',
        pathMatch: 'full'
      }
    ];

    await TestBed.configureTestingModule({
      providers: [
        provideRouter(testRoutes),
        provideLocationMocks()
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
  });

  describe('Configuração das Rotas', () => {
    it('deve ter 4 rotas configuradas', () => {
      expect(CHARACTERS_ROUTES).toHaveLength(4);
    });

    it('deve ter rota para listagem de personagens ("")', () => {
      const listRoute = CHARACTERS_ROUTES.find(route => route.path === '');
      expect(listRoute).toBeDefined();
      expect(listRoute?.loadComponent).toBeDefined();
    });

    it('deve ter rota para novo personagem ("new")', () => {
      const newRoute = CHARACTERS_ROUTES.find(route => route.path === 'new');
      expect(newRoute).toBeDefined();
      expect(newRoute?.loadComponent).toBeDefined();
    });

    it('deve ter rota para detalhes do personagem (":id")', () => {
      const detailRoute = CHARACTERS_ROUTES.find(route => route.path === ':id');
      expect(detailRoute).toBeDefined();
      expect(detailRoute?.loadComponent).toBeDefined();
    });

    it('deve ter rota para edição de personagem (":id/edit")', () => {
      const editRoute = CHARACTERS_ROUTES.find(route => route.path === ':id/edit');
      expect(editRoute).toBeDefined();
      expect(editRoute?.loadComponent).toBeDefined();
    });
  });

  describe('Lazy Loading dos Componentes', () => {
    it('deve carregar CharacterListComponent para rota vazia', async () => {
      const listRoute = CHARACTERS_ROUTES.find(route => route.path === '');
      expect(listRoute?.loadComponent).toBeDefined();

      if (listRoute?.loadComponent) {
        const componentModule = await listRoute.loadComponent();
        expect(componentModule).toBe(MockCharacterListComponent);
      }
    });

    it('deve carregar CharacterFormComponent para rota "new"', async () => {
      const newRoute = CHARACTERS_ROUTES.find(route => route.path === 'new');
      expect(newRoute?.loadComponent).toBeDefined();

      if (newRoute?.loadComponent) {
        const componentModule = await newRoute.loadComponent();
        expect(componentModule).toBe(MockCharacterFormComponent);
      }
    });

    it('deve carregar CharacterDetailComponent para rota ":id"', async () => {
      const detailRoute = CHARACTERS_ROUTES.find(route => route.path === ':id');
      expect(detailRoute?.loadComponent).toBeDefined();

      if (detailRoute?.loadComponent) {
        const componentModule = await detailRoute.loadComponent();
        expect(componentModule).toBe(MockCharacterDetailComponent);
      }
    });

    it('deve carregar CharacterFormComponent para rota ":id/edit"', async () => {
      const editRoute = CHARACTERS_ROUTES.find(route => route.path === ':id/edit');
      expect(editRoute?.loadComponent).toBeDefined();

      if (editRoute?.loadComponent) {
        const componentModule = await editRoute.loadComponent();
        expect(componentModule).toBe(MockCharacterFormComponent);
      }
    });
  });

  describe('Navegação entre Rotas', () => {
    it('deve navegar para lista de personagens', async () => {
      await router.navigate(['/characters']);
      expect(location.path()).toBe('/characters');
    });

    it('deve navegar para formulário de novo personagem', async () => {
      await router.navigate(['/characters/new']);
      expect(location.path()).toBe('/characters/new');
    });

    it('deve navegar para detalhes de personagem específico', async () => {
      const characterId = '123';
      await router.navigate(['/characters', characterId]);
      expect(location.path()).toBe('/characters/123');
    });

    it('deve navegar para edição de personagem específico', async () => {
      const characterId = '456';
      await router.navigate(['/characters', characterId, 'edit']);
      expect(location.path()).toBe('/characters/456/edit');
    });

    it('deve distinguir entre rota de detalhes e rota de edição', async () => {
      await router.navigate(['/characters/789']);
      expect(location.path()).toBe('/characters/789');

      await router.navigate(['/characters/789/edit']);
      expect(location.path()).toBe('/characters/789/edit');
    });
  });

  describe('Resolução de Parâmetros', () => {
    it('deve resolver parâmetro id na rota de detalhes', async () => {
      const detailRoute = CHARACTERS_ROUTES.find(route => route.path === ':id');
      expect(detailRoute?.path).toBe(':id');
      
      await router.navigate(['/characters/100']);
      expect(location.path()).toBe('/characters/100');
    });

    it('deve resolver parâmetro id na rota de edição', async () => {
      const editRoute = CHARACTERS_ROUTES.find(route => route.path === ':id/edit');
      expect(editRoute?.path).toBe(':id/edit');
      
      await router.navigate(['/characters/200/edit']);
      expect(location.path()).toBe('/characters/200/edit');
    });

    it('deve lidar com IDs numéricos', async () => {
      await router.navigate(['/characters/1']);
      expect(location.path()).toBe('/characters/1');
      
      await router.navigate(['/characters/1/edit']);
      expect(location.path()).toBe('/characters/1/edit');
    });

    it('deve lidar com IDs negativos (personagens locais)', async () => {
      await router.navigate(['/characters/-1']);
      expect(location.path()).toBe('/characters/-1');
      
      await router.navigate(['/characters/-1/edit']);
      expect(location.path()).toBe('/characters/-1/edit');
    });
  });

  describe('Precedência de Rotas', () => {
    it('deve priorizar rota "new" sobre rota ":id"', () => {
      const newRouteIndex = CHARACTERS_ROUTES.findIndex(route => route.path === 'new');
      const idRouteIndex = CHARACTERS_ROUTES.findIndex(route => route.path === ':id');
      
      expect(newRouteIndex).toBeLessThan(idRouteIndex);
    });

    it('deve distinguir corretamente entre "new" e um ID específico', async () => {
      await router.navigate(['/characters/new']);
      expect(location.path()).toBe('/characters/new');
      
      await router.navigate(['/characters/123']);
      expect(location.path()).toBe('/characters/123');
    });
  });

  describe('Validação da Estrutura', () => {
    it('deve ter todas as rotas como objetos válidos', () => {
      CHARACTERS_ROUTES.forEach(route => {
        expect(route).toBeInstanceOf(Object);
        expect(route.path).toBeDefined();
        expect(typeof route.path).toBe('string');
        expect(route.loadComponent).toBeDefined();
        expect(typeof route.loadComponent).toBe('function');
      });
    });

    it('não deve ter rotas duplicadas', () => {
      const paths = CHARACTERS_ROUTES.map(route => route.path);
      const uniquePaths = [...new Set(paths)];
      expect(paths).toHaveLength(uniquePaths.length);
    });

    it('deve ter caminhos válidos para todas as rotas', () => {
      const validPaths = ['', 'new', ':id', ':id/edit'];
      const routePaths = CHARACTERS_ROUTES.map(route => route.path);
      
      validPaths.forEach(validPath => {
        expect(routePaths).toContain(validPath);
      });
    });
  });
});