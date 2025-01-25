import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { TopbarComponent } from '../topbar/topbar.component';
import { MenuComponent } from '../menu/menu.component';

@Component({
  selector: 'app-main',
  imports: [TopbarComponent, MenuComponent, RouterOutlet],
  templateUrl: './main.component.html',
  styleUrl: './main.component.sass'
})
export class MainComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
}
