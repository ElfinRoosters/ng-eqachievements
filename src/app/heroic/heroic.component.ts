import { CommonModule } from '@angular/common';
import { Component, computed, inject, Input, OnInit, signal } from '@angular/core';
import { AchievementDataService, EQCharacter } from '../achievement-data.service';
import { GameDataService } from '../game-data.service';
import { ConsoleLogService } from '../console-log.service';
import { AchievementData } from '../achievement-data';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-heroic',
  imports: [CommonModule, NgbTooltipModule],
  templateUrl: './heroic.component.html',
  styleUrl: './heroic.component.sass'
})
export class HeroicComponent extends AchievementData implements OnInit {
  private readonly dataService = inject(AchievementDataService);
  private readonly gameData = inject(GameDataService);
  private readonly logger = inject(ConsoleLogService);

  hasFilesLoaded = computed(() => this.dataService.isDataLoaded());
  showCompleted = signal(true);

  category$!: string;

  characters = new Set<EQCharacter>();
  data = new Array();
  num_heroic_AAs = new Array<number>(3).fill(0);

  @Input()
  set category(id: string) {
    //this.logger.log('categoryId:', id);
    this.category$ = id;
  };

  getCategoryName(categoryID: string) {
    return this.gameData.getCategory(parseInt(categoryID));
  }

  toggleCompleted() {
    this.logger.log("showCompleted: %s -> %s", this.showCompleted(), !this.showCompleted());
    this.showCompleted.set(!this.showCompleted());
    return false;
  }

  ngOnInit(): void {
    //this.logger.log('ngOnInit()');
    this.characters.clear();
    this.dataService.characters.forEach((a) => {
      this.characters.add(a);
    });

    this.data.length = 0;

    const totalAAs = new Array(this.characters.size * 3).fill(0);

    for (const [category, cdata] of this.heroicAAs.entries()) {
      //this.logger.log('category: %s', category);
      const categoryID = this.gameData.getCategoryID(category);

      for (const [subcategory, scdata] of cdata.entries()) {
        const subcategoryID = this.gameData.getAchievementID(category, subcategory);
        //this.logger.log('subcategory[%d]: %s', subcategoryID, subcategory);
        const clientIDs = this.gameData.getClientIDsForAchievement(subcategoryID);
        const clients = this.gameData.getClients(clientIDs);

        for (const [task, aas] of scdata.entries()) {
          const ac = clients.find((c) => c.name === task);
          if (ac === undefined) { continue }
          // this.logger.log('task: ', task, ', aas:', aas, ', ac:', ac);
          if (aas.includes('F')) {
            this.num_heroic_AAs[0]++;
          }
          if (aas.includes('R')) {
            this.num_heroic_AAs[1]++;
          }
          if (aas.includes('V')) {
            this.num_heroic_AAs[2]++;
          }

          const rdata = new Array(this.characters.size * 3).fill("");
          const el = {
            'id': ac.id,
            'name': ac.name,
            'text': ac.text,
            'points': 0,
            'missing': 0,
            'completed': 0,
            'data': rdata
          };
          let idx = 0;
          let cidx = 0;
          for (const c of this.characters) {
            let has_completed = 0;
            const state = c.data.get(categoryID)?.get(subcategoryID).get(String(ac.id)).get(String(ac.id));
            // this.logger.log('c.name: ', c.name, ', state: ', state);
            // V: Vitality
            // F: Fortitude
            // R: Resolution
            if (aas.includes('F')) {
              rdata[idx] = state.state;
              if (state.state === 'C') { totalAAs[cidx*3+0]++; has_completed++; }
            }
            idx++;
            if (aas.includes('R')) {
              rdata[idx] = state.state;
              if (state.state === 'C') { totalAAs[cidx*3+1]++; has_completed++; }
            }
            idx++;
            if (aas.includes('V')) {
              rdata[idx] = state.state;
              if (state.state === 'C') { totalAAs[cidx*3+2]++; has_completed++; }
            }
            if (has_completed) {
              el.completed ++;
            }
            idx++;
            cidx++;
          }

          this.data.push(el);
        }
      }
    }
    this.data.push({
      'id': 0,
      'name': 'Totals',
      'text': 'Finished Achievements',
      'points': 0,
      'missing': 0,
      'completed': 0,
      'data': totalAAs
    });
  }
}
