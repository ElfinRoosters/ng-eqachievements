import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { default as MenuData } from './menu.json';
import { AchievementDataService } from '../achievement-data.service';
import { Observable, switchMap } from 'rxjs';

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
  imports: [NgbAccordionModule, RouterLink],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.sass'
})
export class MenuComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  menu!: MenuItem[];

  constructor(private dataService: AchievementDataService) {
    this.menu = MenuData.data;

  }

}
