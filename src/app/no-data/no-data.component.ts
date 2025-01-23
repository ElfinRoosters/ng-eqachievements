import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-no-data',
  imports: [CommonModule, RouterModule],
  templateUrl: './no-data.component.html',
  styleUrl: './no-data.component.sass'
})
export class NoDataComponent {

}
