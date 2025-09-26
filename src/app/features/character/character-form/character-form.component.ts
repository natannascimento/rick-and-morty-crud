import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Character } from '../../../core/models/character.model';
import { CharactersService } from '../../../core/services/character.service';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

@Component({
  standalone: true,
  selector: 'app-character-form',
  templateUrl: './character-form.component.html',
  styleUrls: ['./character-form.component.scss'],
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatSelectModule, MatOptionModule
  ]
})
export class CharacterFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private state = inject(CharactersService);

  id = signal<number | null>(null);
  title = computed(() => this.id() ? 'Edit Character' : 'New Character');

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    species: ['', Validators.required],
    status: ['unknown', Validators.required],
    gender: ['unknown', Validators.required],
    image: ['', Validators.required],
  });

  async ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.id.set(id);
     
      const data = (this.state as any).getById ? await (this.state as any).getById(id) : null;
      if (data) this.form.patchValue({
        name: data.name,
        species: data.species,
        status: data.status,
        gender: data.gender,
        image: data.image
      });
    } else {
      this.form.patchValue({
        status: 'Alive',
        gender: 'Male',
        image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg'
      });
    }
  }

  async save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = this.form.value as Omit<Character, 'id'>;

    if (this.id()) {
      if ((this.state as any).editLocalCharacter) {
        await (this.state as any).editLocalCharacter(this.id()!, payload);
      }
    } else {
      await this.state.addLocalCharacter(payload);
    }
    this.router.navigate(['/character']);
  }

  cancel() { this.router.navigate(['/character']); }
}
