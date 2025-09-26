import { Component, inject, Signal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Character } from '../../../core/models/character.model';
import { CharactersService } from '../../../core/services/character.service';

@Component({
  selector: 'app-character-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './character-detail.component.html',
  styleUrls: ['./character-detail.component.scss']
})
export class CharacterDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private characterService = inject(CharactersService);

  character = signal<Character | null>(null);

  constructor() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        const chars = this.characterService.characters() as Character[];
        const found = chars.find((c: Character) => c.id === +id) ?? null;
        this.character.update(() => found);
      }
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }
}