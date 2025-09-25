import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Character } from '../models/character.model';

type ApiResponse = {
  info: { count: number; pages: number; next: string | null; prev: string | null };
  results: Character[];
};

@Injectable({ providedIn: 'root' })
export class CharactersState {
  private http = inject(HttpClient);
  private baseUrl = 'https://rickandmortyapi.com/api/character';

  characters = signal<Character[]>([]);
  total = signal<number>(0);
  loading = signal<boolean>(false);
  query = signal<string>('');
  page = signal<number>(1);

  private LS_KEY = 'rm-local-characters';

  private readLocal(): Character[] {
    const raw = localStorage.getItem(this.LS_KEY);
    return raw ? JSON.parse(raw) : [];
  }
  private writeLocal(list: Character[]) {
    localStorage.setItem(this.LS_KEY, JSON.stringify(list));
  }

  async load(page = 1, name = '') {
    this.loading.set(true);
    this.page.set(page);
    this.query.set(name);

    const params = new URLSearchParams();
    params.set('page', String(page));
    if (name) params.set('name', name);

    try {
      const resp = await this.http.get<ApiResponse>(`${this.baseUrl}?${params.toString()}`).toPromise();
      const apiItems = resp?.results ?? [];
      const locals = this.readLocal();

      const merged = [...locals, ...apiItems.filter(a => !locals.some(l => l.id === a.id))];

      this.characters.set(merged);
      this.total.set((resp?.info.count ?? 0) + locals.length);
    } catch {
      const locals = this.readLocal();
      this.characters.set(locals);
      this.total.set(locals.length);
    } finally {
      this.loading.set(false);
    }
  }

  async deleteLocal(id: number) {
    const locals = this.readLocal().filter(p => p.id !== id);
    this.writeLocal(locals);
    await this.load(this.page(), this.query());
  }
}