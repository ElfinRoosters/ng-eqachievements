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

  category$!: string;
  achievement$!: string;

  characters = new Set<EQCharacter>();
  data = new Array();

  @Input()
  set category(id: string) {
    //console.log('categoryId:', id);
    this.category$ = id;
  };

  @Input()
  set achievement(id: string) {
    //console.log('achievementId:', id);
    this.achievement$ = id;
  };

  ngOnInit(): void {
    console.log('ngOnInit()');
    this.characters.clear();
    this.dataService.characters.forEach((a) => {
      this.characters.add(a);
    });

    this.refreshTableData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnChanges(): changes:', changes);
    if (!this.hasFilesLoaded()) {
      console.log('ngOnChanges(): !hasFilesLoaded');
      return;
    }

    if (this.characters.size == 0) {
      console.log('ngOnChanges() called before this.characters initialized');
      return;
    }

    this.refreshTableData();
  }
  refreshTableData() {
    console.log('refreshTableData()');
    this.data.length = 0;

    console.log('category$: ', this.category$);
    console.log('achievement$: ', this.achievement$);
    console.log('characters:', this.characters);

    /*
    for (const c of this.characters) {
      console.log("c.name: %s", c.name);
      //console.log("c.data: ", c.data);
      if (!c.data.has(this.category$)) {
        console.log("c.data.keys() %s does not contain %d", JSON.stringify(Object.keys(c.data)), this.category$);
      }
      if (!c.data.get(this.category$).has(this.achievement$)) {
        console.log("c.data.category.keys() %s does not contain %d", JSON.stringify(Object.keys(c.data.get(this.category$))), this.achievement$);
      }
    }
      */

    const d = GameData.getClientIDsForAchievement(this.achievement$);
    //console.log('d:', d);

    const e = GameData.getClients(d);
    //console.log('e:', e);

    for (const [ridx, row] of e.entries()) {
      const rdata = new Array(this.characters.size).fill("I");
      const el = {
        'id': row[0] as number,
        'name': row[1],
        'text': row[2],
        'points': row[4] as number,
        'missing': 0,
        'completed': 0,
        'data': rdata
      };

      let idx = 0;
      this.characters.forEach((c) => {
        const state = c.data.get(this.category$)?.get(this.achievement$)?.get(String(el.id))?.get(String(el.id));
        if (state === undefined) { return; }
        rdata[idx] = state.state;
        //console.log('rdata[%d] = "%s"', idx, JSON.stringify(state.state));
        if (state.state === 'C') {
          el.completed++;
        }
        else {
          console.log('state:', state);
          el.missing++;
        }
        idx++;
      });
      this.data.push(el);
      //console.log('el.data: %s', JSON.stringify(el.data));
    }

  }
}
