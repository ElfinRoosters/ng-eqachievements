import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgbAccordionModule, NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { GameData } from '../game-data.data';

export interface MenuItem {
  name: string;
  tooltip: string;
  children?: MenuItem[];
  id: number;
  order: number;
}

@Component({
  selector: 'app-menu',
  imports: [RouterLink, NgbAccordionModule, NgbTooltip],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.sass'
})
export class MenuComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  menu!: MenuItem[];

  constructor() {
    this.menu = GameData.makeMenuData() as MenuItem[];

  }

}
