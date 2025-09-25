import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';

import { CharactersState } from '../../../core/services/character.service';

@Component({
  standalone: true,
  selector: 'app-character-list',
  templateUrl: './character-list.component.html',
  styleUrls: ['./character-list.component.scss'],
  imports: [
    CommonModule,
    MatTableModule, MatPaginatorModule, MatFormFieldModule, MatInputModule,
    MatIconModule, MatButtonModule, MatProgressBarModule, MatCardModule
  ]
})
export class CharacterListComponent implements OnInit {
  private router = inject(Router);
  vm = inject(CharactersState);

  displayedColumns = ['thumb', 'name', 'species', 'status', 'actions'];
  filtered = computed(() => this.vm.characters());

  async ngOnInit() {
    await this.vm.load(1, '');
  }

  async onPage(e: PageEvent) {
    const page = e.pageIndex + 1;
    await this.vm.load(page, this.vm.query());
  }

  async search(ev: Event) {
    const value = (ev.target as HTMLInputElement).value.trim();
    await this.vm.load(1, value);
  }

  new() { this.router.navigate(['/characters/new']); }
  view(id: number) { this.router.navigate(['/characters', id]); }
  edit(id: number) { this.router.navigate(['/characters', id, 'edit']); }
  async delete(id: number) {
    if (confirm('Confirma a exclusão?')) {
      await this.vm.deleteLocal(id);
    }
  }
}