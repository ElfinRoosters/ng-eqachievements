import { Component, computed, inject, Input, OnChanges, OnInit, signal, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AchievementDataService, EQCharacter } from '../achievement-data.service';
import { ConsoleLogService } from '../console-log.service';
import { GameDataService } from '../game-data.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-client-task',
  imports: [RouterModule, CommonModule],
  templateUrl: './client-task.component.html',
  styleUrl: './client-task.component.sass'
})
export class ClientTaskComponent implements OnInit, OnChanges {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dataService = inject(AchievementDataService);
  private readonly gameData = inject(GameDataService);
  private readonly logger = inject(ConsoleLogService);

  private readonly MAX_LEVEL = 125;
  showCompleted = signal(true);

  hasFilesLoaded = computed(() => this.dataService.isDataLoaded());

  categoryID!: string;
  achievementID!: string;
  clientID!: string;

  characters = new Set<EQCharacter>();
  data = new Array();

  @Input()
  set category(id: string) {
    //this.logger.log('categoryId:', id);
    this.categoryID = id;
  };

  @Input()
  set achievement(id: string) {
    //this.logger.log('achievementId:', id);
    this.achievementID = id;
  };

  @Input()
  set task(id: string) {
    //this.logger.log('clientID:', id);
    this.clientID = id;
  };

  getCategoryName(id: string) {
    return this.gameData.getCategory(parseInt(id));
  }

  getClientName(id: string) {
    return this.gameData.getClient(parseInt(id));
  }

  toggleCompleted() {
    //this.logger.log("showCompleted: %s -> %s", this.showCompleted(), !this.showCompleted());
    this.showCompleted.set(!this.showCompleted());
    return false;
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
    this.refreshTableData();
  }

  refreshTableData() {
    //this.logger.log('refreshTableData()');
    this.data.length = 0;

    //this.logger.log('categoryID: ', this.categoryID);
    //this.logger.log('achievementID: ', this.achievementID);
    //this.logger.log('clientID:', this.clientID);
    //this.logger.log('characters:', this.characters);

    const clients = this.gameData.getClientsForAchievement(this.achievementID);
    //this.logger.log('clients:', clients);

    const components = this.gameData.getComponents(parseInt(this.clientID));
    if (components === undefined) {
      return;
    }

    //this.logger.log('components:', components);

    for (const [tidx, component] of components.entries()) {
      if (component.required == 3) { continue }
      const client = clients.find((ac) => ac.name === component.name);

      const rdata = new Array(this.characters.size).fill("I");
      const el = {
        'id': component.id,
        'name': this.gameData.checkAchievementRename(component.name),
        'missing': 0,
        'completed': 0,
        'components': 0,
        'points': 0,
        'data': rdata
      };
      if (client !== undefined) {
        el.points = client.points;
        el.components = 1;
        el.id = client.id;
      }

      let idx = 0;
      this.characters.forEach((c) => {
        const state = c.getState(this.categoryID, this.achievementID, this.clientID, String(component.id));
        if (state !== undefined) {
          rdata[idx] = state.state;
          if (state.state === 'C') {
            el.completed++;
          }
          else {

            el.missing++;
            // Special case for Slayer:
            // display the number remaining to complete this achievement.
          }
        }
        idx++;
      });

      if (el.missing > 0) {
        //this.logger.log('ac:', ac);

      }
      this.data.push(el);
      //this.logger.log('el.data: %s', JSON.stringify(el.data));
    }

    /*
        const e = this.gameData.getClients(d);
        //this.logger.log('e:', e);
    
        var lastName = "";
        for (const [ridx, ac] of e.entries()) {
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
    */
  }

}
