import { CommonModule } from '@angular/common';
import { Component, computed, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AchievementDataService, EQCharacter } from '../achievement-data.service';
import { GameDataService } from '../game-data.service';
import { ConsoleLogService } from '../console-log.service';

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
  private readonly gameData = inject(GameDataService);
  private readonly logger = inject(ConsoleLogService);

  hasFilesLoaded = computed(() => this.dataService.isDataLoaded());

  category$!: string;
  achievement$!: string;

  characters = new Set<EQCharacter>();
  data = new Array();

  @Input()
  set category(id: string) {
    //this.logger.log('categoryId:', id);
    this.category$ = id;
  };

  @Input()
  set achievement(id: string) {
    //this.logger.log('achievementId:', id);
    this.achievement$ = id;
  };

  ngOnInit(): void {
    this.logger.log('ngOnInit()');
    this.characters.clear();
    this.dataService.characters.forEach((a) => {
      this.characters.add(a);
    });

    this.refreshTableData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.logger.log('ngOnChanges(): changes:', changes);
    if (!this.hasFilesLoaded()) {
      this.logger.log('ngOnChanges(): !hasFilesLoaded');
      return;
    }

    if (this.characters.size == 0) {
      this.logger.log('ngOnChanges() called before this.characters initialized');
      return;
    }

    this.refreshTableData();
  }
  refreshTableData() {
    this.logger.log('refreshTableData()');
    this.data.length = 0;

    this.logger.log('category$: ', this.category$);
    this.logger.log('achievement$: ', this.achievement$);
    this.logger.log('characters:', this.characters);

    const d = this.gameData.getClientIDsForAchievement(this.achievement$);
    //this.logger.log('d:', d);

    const e = this.gameData.getClients(d);
    //this.logger.log('e:', e);

    for (const [ridx, ac] of e.entries()) {

      const rdata = new Array(this.characters.size).fill("I");
      const el = {
        'id': ac.id,
        'name': ac.name,
        'text': ac.text,
        'points': ac.points,
        'missing': 0,
        'completed': 0,
        'data': rdata
      };

      let idx = 0;
      this.characters.forEach((c) => {
        const state = c.data.get(this.category$)?.get(this.achievement$)?.get(String(el.id))?.get(String(el.id));
        if (state === undefined) { return; }
        rdata[idx] = state.state;
        //this.logger.log('rdata[%d] = "%s"', idx, JSON.stringify(state.state));
        if (state.state === 'C') {
          el.completed++;
        }
        else {
          this.logger.log('state:', state);
          el.missing++;
        }
        idx++;
      });

      if (el.missing > 0) {
        this.logger.log('ac:', ac);
        const components = this.gameData.getComponents(ac.id);
        //this.logger.log('components:', components);
  
      }
      this.data.push(el);
      //this.logger.log('el.data: %s', JSON.stringify(el.data));
    }

  }
}
