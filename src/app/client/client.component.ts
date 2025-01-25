import { CommonModule } from '@angular/common';
import { Component, computed, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AchievementDataService, EQCharacter } from '../achievement-data.service';
import { GameData } from '../game-data.data';

@Component({
  selector: 'app-client',
  imports: [RouterModule, CommonModule],
  templateUrl: './client.component.html',
  styleUrl: './client.component.sass'
})
export class ClientComponent implements OnInit, OnChanges {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dataService = inject(AchievementDataService);
  
  hasFilesLoaded = computed(() => this.dataService.isDataLoaded());
  
  category$!: number;
  achievement$!: number;

  characters = new Set<EQCharacter>();
  data = new Array();

  @Input() 
  set category(id: number) {
    //console.log('categoryId:', id);
    this.category$ = id;
  };

  @Input() 
  set achievement(id: number) {
    //console.log('achievementId:', id);
    this.achievement$ = id;
  };

  ngOnInit(): void {
    console.log('ngOnInit()');
    this.characters.clear();
    this.dataService.characters.forEach((a) => {
      this.characters.add(a);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnChanges(): changes:', changes);
    if (!this.hasFilesLoaded()) {
      console.log('ngOnChanges(): !hasFilesLoaded');
      return;
    }

    console.log('ngOnChanges(): hasFilesLoaded');
    this.data.length = 0;

    const d = GameData.getClientIDs(this.achievement$);
    console.log('d:', d);

    const e = GameData.getClients(d);
    console.log('e:', e);

    for(const row of e) {
      const el = {
        'id': row[0] as number,
        'name': row[1],
        'text': row[2],
        'points': row[4] as number,
        'missing': 0,
        'completed': 0,
        'data': [] as any[]
      };
      const rdata = this.dataService.achievementStatus(this.category$, this.achievement$, el.id);
      el.data.push(...rdata);
      rdata.forEach((r) => {
        if (r === 'C') {
          el.completed ++;
        }
        else {
          el.missing ++;
        }
      });

      this.data.push(el);
    }
  }
}
