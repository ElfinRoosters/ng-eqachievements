import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgbAccordionModule, NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { AchievementDataService } from '../achievement-data.service';

export interface MenuItem {
  name?: string;
  icon?: string;
  tooltip?: string;
  children?: MenuItem[];
  routerLink?: string;
  href?: string;
  badge?: string;
  id?: number;
  order?: number;
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

  constructor(private dataService: AchievementDataService) {
    this.menu = dataService.menuData.data;

  }

}
