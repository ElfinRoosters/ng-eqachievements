import { inject, Injectable, signal } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from '@angular/router';
import { AchievementData } from './achievement-data';
import { convertToEQStateEnum, EQState } from './eqstate.status';
import { AchievementState } from './achievement-state.data';
import { ParseState } from './parse-state.data';

export class EQCharacter {
  constructor(
    public name:string,
    public server:string,
  ){}
}

export class AchievementFile {
  constructor(
      public eqCharacter:EQCharacter,
      public text:string,
  ){}
}

interface EQBaseType {
  id: number;
  name: string;
}

interface EQAchievementComponent {
  name: string;
};

interface EQAchievement extends EQBaseType {
  text?: string;
  points?: number;
  count: number;
  components: EQAchievementComponent[];
};

interface EQAchievementData extends EQAchievement {
  state: EQState;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class AchievementDataService extends AchievementData implements CanActivate {
  private readonly router = inject(Router);
  isDataLoaded = signal(true);
  private readonly fileNameRe = /^(.*?)_(.*?)-Achievements.txt$/;
  private characters = new Set<EQCharacter>();

  data:any = {};

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {
    if (this.isDataLoaded()) {
      return true;
    } else {
      this.router.navigate([''], {skipLocationChange: true});
      return false;
    }
  }

  private files: File[] = [];

  loadFiles($event: Event) {
    if (this.files.length == 0) {
      return false;
    }
    console.log('loadFiles(): this.files.length > 0');

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

    console.log("watching for promises to resolve");
    const alldone = Promise.allSettled(promises).then((results) => {
      console.log('Clearing character list');
      this.characters.clear();
      this.data.length = 0;

      results.filter((result) => result.status === 'fulfilled').forEach(
        (result) => {
          console.log('result:',result);
          const lines = result.value.text.split(/[\r\n]+/).map((line) => line.trim());
          this.parseAchievements(result.value.eqCharacter, lines);
          this.characters.add(result.value.eqCharacter);
        }
      );
    }).finally(() => {
      console.log('loadFiles:characters:', this.characters);
      this.isDataLoaded.set(this.characters.size > 0);
    });

    this.router.navigate(['/category/10/achievement/11'], { skipLocationChange: true });
    return true;
  }

  onFileSelected($event: Event) {
    const element: HTMLInputElement = $event.target as HTMLInputElement;
    if (element.files === null) {
      console.log("element has no input type='file'?");
      this.files.length = 0;
      return false;
    }
    if (element.files.length == 0) {
      console.log("no files selected.");
      this.files.length = 0;
      return false;
    }

    let fileList: FileList = element.files;
    //console.log('fileList: %s', JSON.stringify(fileList));
    const fileArray = Array.from(fileList);

    const filteredFiles = fileArray.sort((a, b) => a.name.localeCompare(b.name)).filter(file => this.fileNameRe.test(file.name));
    console.log(filteredFiles);
    this.files.length = 0;
    this.files.push(...filteredFiles);
    console.log("onFileSelected files.length: %d", this.files.length);

    return true;
  }

  parseAchievements(character: EQCharacter, lines: string[]) {
    console.log('parseAchievements: character: ', character);

    // Locked / Completed / Incomplete
    const reAchievement = /^[LCI]\s/;
    const reUnfinished = new RegExp("^(.*?)\\t(\\d+)/(\\d+)$");
    var psState = {} as ParseState;
    console.log('(starting) psState:',psState);

    for (const line of lines) {
      if (line.length < 4) { continue; }
      const match = reAchievement.exec(line);
      if (!match) {
        // We have the category: sub-category
        const pos = line.indexOf(': ');
        if(pos < 0) {
          console.log("pos: %d, line: [%s]", pos, line);
          continue;
        }
        psState = {} as ParseState;
        psState.category = line.substring(0, pos);
        psState.achievement = line.substring(pos + 2);
        //console.log('psState: %s', JSON.stringify(psState));
        continue;
      }

      // We have an achievement!
      const state = AchievementState.fromParseState(psState);
      state.state = convertToEQStateEnum(line.charAt(0));

      if (line.charCodeAt(2) == 9) {
        // [LCI]\t\t
        var task = line.substring(3);
        var count = 0;
        var total = 0;

        //console.log('2: [' + achievement + ']');
        const match = reUnfinished.exec(task);

        if (match) {
          // console.log("match: " + match[2] + "/" + match[3]);
          task = match[1];
          count = parseInt(match[2]);
          total = parseInt(match[3]);
        }
        //console.log("task: " + task);
        psState.task = task;

      } else if (line.charCodeAt(1) == 9) {
        // [LCI]\t
        //console.log('1: [' + line.substring(2) + ']');
        psState.client = line.substring(2);

      }

      //console.log("psState: %s, state: %s, character: %s", JSON.stringify(psState), JSON.stringify(state), character);
      //this.setData(psState, el, character);

    }
  }

  private checkAchievementRename(state: ParseState, name: string):string {
    var k: any = this.nameReMap;
    if (this.nameReMap.has(state.category))
/*    
    for (let i = 0; i < argv.length - 2; i++) {
      k = k.get(argv[i]);
      if (typeof k === 'string') {
        return k;
      }
      if (!(k instanceof Map)) {
        break;
      }
    }
    */
    if (name.startsWith('Complete the achievement "')) {
      let l = 'Complete the achievement "'.length;
      if (name.endsWith('".')) {
        return name.substring(l, name.length - 2);
      }
      else if (name.endsWith('"')) {
        return name.substring(l, name.length - 1);
      }
    }
    else if (name.startsWith('Complete "')) {
      let l = 'Complete "'.length;
      if (name.endsWith('".')) {
        return name.substring(l, name.length - 2);
      }
      else if (name.endsWith('"')) {
        return name.substring(l, name.length - 1);
      }
    }

    return name;
  }

}
