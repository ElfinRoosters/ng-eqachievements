import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AchievementDataService } from '../achievement-data.service';

@Component({
  selector: 'app-topbar',
  imports: [CommonModule, RouterModule, RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.sass'
})
export class TopbarComponent {
  private dataService = inject(AchievementDataService);

  hasFilesLoaded = computed(() => this.dataService.isDataLoaded());

  onFileSelected($event:Event) {
    $event.preventDefault();
    return this.dataService.onFileSelected($event);    
  }

  loadFiles($event:Event) {
    $event.preventDefault();
    return this.dataService.loadFiles($event);
  }
}
