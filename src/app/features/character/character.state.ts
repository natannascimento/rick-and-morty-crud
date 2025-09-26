import { inject } from '@angular/core';
import { CharactersService } from '../../core/services/character.service';

export function useCharactersState() {
  const svc = inject(CharactersService);
  return {
    characters: svc.characters,
    total:       svc.total,
    loading:     svc.loading,
    query:       svc.query,
    page:        svc.page,
    load:        svc.load.bind(svc),
    getById:     svc.getById.bind(svc),
    addLocalCharacter: svc.addLocalCharacter.bind(svc),
    editLocalCharacter: svc.editLocalCharacter.bind(svc),
    deleteLocal: svc.deleteLocal.bind(svc),
  };
}