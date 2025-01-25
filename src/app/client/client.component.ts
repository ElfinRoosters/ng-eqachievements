import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-client',
  imports: [RouterModule, CommonModule],
  templateUrl: './client.component.html',
  styleUrl: './client.component.sass'
})
export class ClientComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  category$!: string;
  achievement$!: string;

  @Input() 
  set category(id: string) {
    console.log('categoryId:', id);
    this.category$ = id;
  };

  @Input() 
  set achievement(id: string) {
    console.log('achievementId:', id);
    this.achievement$ = id;
  };

}
