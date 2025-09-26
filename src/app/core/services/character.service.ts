import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Character } from '../models/character.model';

type ApiResponse = {
  info: { count: number; pages: number; next: string | null; prev: string | null };
  results: Character[];
};

@Injectable({ providedIn: 'root' })
export class CharactersService {
  private http = inject(HttpClient);
  private baseUrl = 'https://rickandmortyapi.com/api/character';

  characters = signal<Character[]>([]);
  total = signal<number>(0);
  loading = signal<boolean>(false);
  query = signal<string>('');
  page = signal<number>(1);

  private readonly LS_KEY = 'rm-local-characters';

  private readLocal(): Character[] {
    const raw = localStorage.getItem(this.LS_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private getLocalCharacters(): Character[] {
    try {
      return this.readLocal();
    } catch (error) {
      console.warn('Error reading local characters:', error);
      return [];
    }
  }

  private writeLocal(list: Character[]) {
    localStorage.setItem(this.LS_KEY, JSON.stringify(list));
  }

  private saveLocalCharacters(characters: Character[]): void {
    try {
      this.writeLocal(characters);
    } catch (error) {
      console.error('Error saving local characters:', error);
    }
  }

  private addToLocalStorage(character: Character): void {
    const locals = this.readLocal();
    locals.unshift(character);
    this.writeLocal(locals);
  }

  private updateInLocalStorage(id: number, updates: Partial<Character>): void {
    const locals = this.readLocal();
    const index = locals.findIndex(char => char.id === id);
    if (index >= 0) {
      locals[index] = { ...locals[index], ...updates, _updatedAt: new Date().toISOString() };
      this.writeLocal(locals);
    }
  }

  private removeFromLocalStorage(id: number): void {
    const locals = this.readLocal().filter(char => char.id !== id);
    this.writeLocal(locals);
  }

  private mergeCharactersData(apiCharacters: Character[], localCharacters: Character[]): Character[] {
    return [...localCharacters, ...apiCharacters.filter(apiChar => 
      !localCharacters.some(localChar => localChar.id === apiChar.id)
    )];
  }

  private calculateTotalCount(apiCount: number, localCount: number): number {
    return apiCount + localCount;
  }

  private buildApiUrl(page: number, name: string): string {
    const params = new URLSearchParams();
    params.set('page', String(page));
    if (name) params.set('name', name);
    return `${this.baseUrl}?${params.toString()}`;
  }

  private updateCharacterState(characters: Character[], total: number): void {
    this.characters.set(characters);
    this.total.set(total);
  }

  async load(page = 1, name = '') {
    this.loading.set(true);
    this.page.set(page);
    this.query.set(name);

    try {
      const apiUrl = this.buildApiUrl(page, name);
      const response = await this.http.get<ApiResponse>(apiUrl).toPromise();
      const apiCharacters = response?.results ?? [];
      const localCharacters = this.readLocal();

      const mergedCharacters = this.mergeCharactersData(apiCharacters, localCharacters);
      const totalCount = this.calculateTotalCount(response?.info.count ?? 0, localCharacters.length);

      this.updateCharacterState(mergedCharacters, totalCount);
    } catch {
      const localCharacters = this.readLocal();
      this.updateCharacterState(localCharacters, localCharacters.length);
    } finally {
      this.loading.set(false);
    }
  }

  private generateLocalId(existingCharacters: Character[]): number {
    return -(existingCharacters.length + 1);
  }

  private createLocalCharacter(data: Omit<Character, 'id'>, id: number): Character {
    return {
      ...data,
      id,
      _local: true,
      _updatedAt: new Date().toISOString()
    };
  }

  private async refreshCurrentView(): Promise<void> {
    await this.load(this.page(), this.query());
  }

  getById(id: number) {
    const local = this.readLocal().find(p => p.id === id);
    if (local) return Promise.resolve(local);

    return this.http.get<Character>(`${this.baseUrl}/${id}`).toPromise();
  }

  async addLocalCharacter(data: Omit<Character, 'id'>) {
    const existingCharacters = this.readLocal();
    const newId = this.generateLocalId(existingCharacters);
    const newCharacter = this.createLocalCharacter(data, newId);
    
    this.addToLocalStorage(newCharacter);
    await this.refreshCurrentView();
    return newCharacter;
  }

  async editLocalCharacter(id: number, updates: Partial<Character>) {
    const localCharacters = this.readLocal();
    const existingCharacter = localCharacters.find(char => char.id === id);
    
    if (existingCharacter) {
      this.updateInLocalStorage(id, updates);
    } else {
      const originalCharacter = await this.getById(id);
      if (originalCharacter) {
        const updatedCharacter = this.createLocalCharacter(
          { ...originalCharacter, ...updates }, 
          id
        );
        this.addToLocalStorage(updatedCharacter);
      }
    }
    
    await this.refreshCurrentView();
  }

  async deleteLocal(id: number) {
    this.removeFromLocalStorage(id);
    await this.refreshCurrentView();
  }
}