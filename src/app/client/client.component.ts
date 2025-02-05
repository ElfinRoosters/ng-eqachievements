import { CommonModule } from '@angular/common';
import { Component, computed, inject, Input, OnChanges, OnInit, signal, SimpleChanges } from '@angular/core';
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

  private readonly MAX_LEVEL = 125;
  showCompleted = signal(true);

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

  toggleCompleted() {
    this.showCompleted.set(!this.showCompleted());
    return false;
  }

  getCategoryName(categoryID: string) {
    return this.gameData.getCategory(parseInt(categoryID));
  }

  ngOnInit(): void {
    //this.logger.log('ngOnInit()');
    this.characters.clear();
    this.dataService.characters.forEach((a) => {
      this.characters.add(a);
    });

    this.refreshTableData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    //this.logger.log('ngOnChanges(): changes:', changes);
    if (!this.hasFilesLoaded()) {
      //this.logger.log('ngOnChanges(): !hasFilesLoaded');
      return;
    }

    if (this.characters.size == 0) {
      //this.logger.log('ngOnChanges() called before this.characters initialized');
      return;
    }

    this.showCompleted.set(true);
    this.refreshTableData();
  }
  refreshTableData() {
    //this.logger.log('refreshTableData()');
    this.data.length = 0;

    //this.logger.log('category$: ', this.category$);
    //this.logger.log('achievement$: ', this.achievement$);
    //this.logger.log('characters:', this.characters);

    const clientIDs = this.gameData.getClientIDsForAchievement(this.achievement$);
    //this.logger.log('clientIDs:', clientIDs);

    const clients = this.gameData.getClients(clientIDs);
    //this.logger.log('clients:', clients);

    var lastName = "";
    for (const [ridx, ac] of clients.entries()) {
      if (lastName === ac.name) { continue }
      lastName = ac.name;

      const rdata = new Array(this.characters.size).fill("I");
      const el = {
        'id': ac.id,
        'name': ac.name,
        'text': ac.text,
        'points': ac.points,
        'missing': 0,
        'completed': 0,
        'components': 0,      
        'data': rdata
      };
      const components = this.gameData.getComponents(ac.id);
      if (components !== undefined) {
        // this.logger.log('components:', components);
        el.components = components.filter((ac) => ac.required < 3).length
      }

      let idx = 0;
      this.characters.forEach((c) => {
        const state = (this.category$ === '80') ?
          c.getState(this.category$, this.achievement$, String(el.id)) :
          c.getState(this.category$, this.achievement$, String(el.id), String(el.id));
        if (state !== undefined) {
          rdata[idx] = state.state;
          if (state.state === 'C') {
            el.completed++;
          }
          else {
            //this.logger.log('state:', state);
            el.missing++;
            // Special case for Slayer:
            // display the number remaining to complete this achievement.
            if (this.category$ === '80' && state.count > 0) {
              rdata[idx] = state.total - state.count;
            }
          }
        }
        idx++;
      });

      if (el.missing > 0) {
        //this.logger.log('ac:', ac);

      }
      this.data.push(el);
      //this.logger.log('el.data: %s', JSON.stringify(el.data));

      // For General > Advancement, don't display any achievements after 
      // the last one none have completed.
      if (this.achievement$ === '11') {
        if (el.completed == 0) {
          break
        }
      }
      if (this.achievement$ === '13') {
        if (ac.id == this.MAX_LEVEL) {
          break;
        }
      }
    }
  }
}
