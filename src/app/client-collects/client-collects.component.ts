import { Component, computed, inject, Input, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AchievementDataService, EQCharacter } from '../achievement-data.service';
import { ConsoleLogService } from '../console-log.service';
import { AchievementComponent, GameDataService } from '../game-data.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-client-collects',
  imports: [RouterModule, CommonModule],
  templateUrl: './client-collects.component.html',
  styleUrl: './client-collects.component.sass'
})
export class ClientCollectsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dataService = inject(AchievementDataService);
  private readonly gameData = inject(GameDataService);
  private readonly logger = inject(ConsoleLogService);

  showCompleted = signal(true);

  hasFilesLoaded = computed(() => this.dataService.isDataLoaded());

  categoryID!: string;
  achievementID!: string;

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

  refreshTableData() {
    //this.logger.log('refreshTableData()');
    this.data.length = 0;

    //this.logger.log('categoryID: ', this.categoryID);
    //this.logger.log('achievementID: ', this.achievementID);
    //this.logger.log('clientID:', this.clientID);
    //this.logger.log('characters:', this.characters);

    const clientIDs = this.gameData.getClientIDsForAchievement(this.achievementID);
    //this.logger.log('clientIDs:', clientIDs);

    const clients = this.gameData.getClients(clientIDs);
    //this.logger.log('clients:', clients);

    for(const client of clients) {
      //this.logger.log('client: ', client);
      const components = this.gameData.getComponents(client.id);
      if (components === undefined) { continue }
      
      //this.logger.log('components: ', components);
      for(const ac of components.filter((ac) => { return ac.count !== undefined && ac.required < 3 })) {
        const rdata = new Array(this.characters.size).fill("I");
        const el = {
          'id': ac.id,
          'name': ac.name,
          'missing': 0,
          'completed': 0,
          'data': rdata
        };

        let idx = 0;
        this.characters.forEach((c) => {
          const state = c.getState(this.categoryID, this.achievementID, String(client.id), String(ac.id));
          if (state !== undefined) {
            rdata[idx] = state.state;
            if (state.state === 'C') {
              el.completed++;
            }
            else {
              el.missing++;
            }
          }
          idx++;
        });

        this.data.push(el);
      }

    }
  }

}
