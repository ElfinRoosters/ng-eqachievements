import { inject, Injectable, signal } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from '@angular/router';
import { GameDataService } from './game-data.service';
import { ConsoleLogService } from './console-log.service';

export class EQCharacter {
  data = new Map<string, any>();
  constructor(
    public name: string,
    public server: string,
  ) { }

  getTaskState(categoryID: string, subcategoryID: string, clientID: string, taskID: string) {
    return this.data.get(categoryID)?.get(subcategoryID)?.get(clientID)?.get(taskID);
  }

  getState(categoryID: string, subcategoryID: string, clientID: string, taskID?: string) {
    //console.log('getState(%s, %s, %s, %s)', categoryID, subcategoryID, clientID, taskID);
    if (taskID !== undefined) {
      return this.getTaskState(categoryID, subcategoryID, clientID, taskID);
    }
    if (categoryID !== '80') {
      return this.getTaskState(categoryID, subcategoryID, clientID, clientID);
    }

    var state = {'state':'I','count':0,'total':0};
    for(const [id, map] of this.data.get(categoryID)?.get(subcategoryID)?.get(clientID)) {
      if (id === clientID) { continue; }
      // console.log('id: %s, map: %s', id, JSON.stringify(map));
      state = map;
      break;
    };
    
    //console.log('getState("%s","%s","%s"): returning: %s', categoryID, subcategoryID, clientID, JSON.stringify(state));
    return state;
  }
}

export class AchievementFile {
  constructor(
    public eqCharacter: EQCharacter,
    public text: string,
  ) { }
}

@Injectable({
  providedIn: 'root'
})
export class AchievementDataService implements CanActivate {
  private readonly router = inject(Router);
  private readonly gamedata = inject(GameDataService);
  private readonly logger = inject(ConsoleLogService);

  isDataLoaded = signal(false);
  private readonly fileNameRe = /^(.*?)_(.*?)-Achievements.txt$/;
  characters = new Set<EQCharacter>();

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {
    if (this.isDataLoaded()) {
      return true;
    } else {
      this.router.navigate([''], { skipLocationChange: true });
      return false;
    }
  }

  private files: File[] = [];

  loadFiles($event: Event) {
    if (this.files.length == 0) {
      return false;
    }
    this.logger.log('loadFiles(): this.files.length > 0');

    const promises: Promise<AchievementFile>[] = this.files.filter(file => this.fileNameRe.test(file.name))
      .map(file => new Promise((resolve, reject) => {

        const match: RegExpExecArray | null = this.fileNameRe.exec(file.name);
        if (match === null) { return reject(new Error('regex match failure')); }

        const eqCharacter = new EQCharacter(match[1], match[2]);

        const reader = new FileReader();
        reader.onload = () => resolve(new AchievementFile(eqCharacter, reader.result as string));
        reader.onerror = () => reject(new Error('Reading file ' + file.name + ' failed.'));
        reader.readAsText(file);
      }));

    this.logger.log("watching for promises to resolve");
    const alldone = Promise.allSettled(promises).then((results) => {
      this.logger.log('Clearing character list');
      this.characters.clear();

      results.filter((result) => result.status === 'fulfilled').forEach(
        (result) => {
          //this.logger.log('result:', result);
          const lines = result.value.text.split(/[\r\n]+/).map((line) => line.trim());
          this.parseAchievements(result.value.eqCharacter, lines);
          this.characters.add(result.value.eqCharacter);
        }
      );
    }).finally(() => {
      this.logger.log('loadFiles:characters:', this.characters);
      this.isDataLoaded.set(this.characters.size > 0);
      this.router.navigate(['/category/10/achievement/11'], { skipLocationChange: true });
    });
    return true;
  }

  onFileSelected($event: Event) {
    const element: HTMLInputElement = $event.target as HTMLInputElement;
    if (element.files === null) {
      this.logger.log("element has no input type='file'?");
      this.files.length = 0;
      return false;
    }
    if (element.files.length == 0) {
      this.logger.log("no files selected.");
      this.files.length = 0;
      return false;
    }

    let fileList: FileList = element.files;
    //this.logger.log('fileList: %s', JSON.stringify(fileList));
    const fileArray = Array.from(fileList);

    const filteredFiles = fileArray.sort((a, b) => a.name.localeCompare(b.name)).filter(file => this.fileNameRe.test(file.name));
    this.logger.log(filteredFiles);
    this.files.length = 0;
    this.files.push(...filteredFiles);
    this.logger.log("onFileSelected files.length: %d", this.files.length);

    return true;
  }

  parseAchievements(character: EQCharacter, lines: string[]) {
    //this.logger.log('parseAchievements: character: ', character);

    // Locked / Completed / Incomplete
    const reAchievement = /^[LCI]\s/;
    const reUnfinished = new RegExp("^(.*?)\\t(\\d+)/(\\d+)$");
    var category1ID: string = "";
    var category2ID: string = "";
    var clientID: string = "";
    var componentID: string = "";
    var map: Map<string, any> | undefined;

    for (const [idx, line] of lines.entries()) {
      // if ((idx % 1000) == 0) { this.logger.log('idx: %d', idx); }
      if (line.length < 4) { continue; }

      const match = reAchievement.exec(line);
      if (!match) {
        // We have the category: sub-category
        const pos = line.indexOf(': ');
        if (pos < 0) {
          this.logger.log("pos: %d, line: [%s]", pos, line);
          continue;
        }
        [category1ID, category2ID] = this.gamedata.getCategoryPair(line.substring(0, pos), line.substring(pos + 2));
        if (!character.data.has(category1ID)) {
          character.data.set(category1ID, new Map<string, any>());
        }
        if (!character.data.get(category1ID).has(category2ID)) {
          character.data.get(category1ID).set(category2ID, new Map<string, any>());
        }
        map = character.data.get(category1ID).get(category2ID);
        continue;
      }
      if (category1ID.length < 1 || category2ID.length < 1 || typeof map !== 'object') {
        this.logger.log('[%d,%d]: idx=%d %s', category1ID, category2ID, idx, line);
        continue;
      }

      // We have an achievement!
      const state = line.charAt(0);
      var count = 0;
      var total = 0;

      // client component
      if (line.charCodeAt(2) == 9) {
        // [LCI]\t\t
        var component = line.substring(3);

        //this.logger.log('2: [' + component + ']');
        const match = reUnfinished.exec(component);
        if (match) {
          //this.logger.log("match: " + match[2] + "/" + match[3]);
          component = match[1];
          count = parseInt(match[2]);
          total = parseInt(match[3]);
          //this.logger.log("component: %s: %d/%d", component, count, total);
        }
        //this.logger.log("task: " + task);
        componentID = this.gamedata.getComponentID(category1ID, category2ID, clientID, component);
      }
      // client / achievement
      else if (line.charCodeAt(1) == 9) {
        // [LCI]\t
        //this.logger.log('1: [' + line.substring(2) + ']');
        clientID = this.gamedata.getClientID(category1ID, category2ID, line.substring(2));
        if (!map.has(clientID)) {
          map.set(clientID, new Map<string, any>());
        }
        componentID = clientID;
      }
      //this.logger.log('%s: [%d,%d,%d,%d]: state=%s, count=%d, total=%d', character.name, category1ID,category2ID,clientID,componentID,state,count,total);
      map.get(clientID).set(componentID, { 'state': state, 'count': count, 'total': total });
    }

    //this.logger.log('character:', character);
  }
}
