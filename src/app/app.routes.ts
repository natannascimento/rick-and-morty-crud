import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'characters' },
  {
    path: 'characters',
    loadChildren: () =>
      import('./features/character/character.routes').then(m => m.CHARACTERS_ROUTES)
  },
  { path: '**', redirectTo: 'characters' }
];