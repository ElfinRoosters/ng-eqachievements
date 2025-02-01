import { Component, computed, inject, Input, OnInit } from '@angular/core';
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
export class ClientTaskComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dataService = inject(AchievementDataService);
  private readonly gameData = inject(GameDataService);
  private readonly logger = inject(ConsoleLogService);

  private readonly MAX_LEVEL = 125;

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

  ngOnInit(): void {
    this.logger.log('ngOnInit()');
    this.characters.clear();
    this.dataService.characters.forEach((a) => {
      this.characters.add(a);
    });

    this.refreshTableData();
  }

  refreshTableData() {
    this.logger.log('refreshTableData()');
    this.data.length = 0;

    //this.logger.log('categoryID: ', this.categoryID);
    //this.logger.log('achievementID: ', this.achievementID);
    //this.logger.log('clientID:', this.clientID);
    //this.logger.log('characters:', this.characters);

    const components = this.gameData.getComponents(parseInt(this.clientID));
    if (components === undefined) {
      return;
    }

    //this.logger.log('components:', components);

    for (const [tidx, component] of components.entries()) {
      if (component.required == 3) { continue }

      const rdata = new Array(this.characters.size).fill("I");
      const el = {
        'id': component.id,
        'name': component.name,
        'missing': 0,
        'completed': 0,
        'components': 0,
        'data': rdata
      };

      let idx = 0;
      this.characters.forEach((c) => {
        const state = c.getState(this.categoryID, this.achievementID, this.clientID, String(component.id));
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
