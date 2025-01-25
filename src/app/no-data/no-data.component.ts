import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'app-no-data',
  imports: [CommonModule, RouterModule, TopbarComponent],
  templateUrl: './no-data.component.html',
  styleUrl: './no-data.component.sass'
})
export class NoDataComponent {

}
