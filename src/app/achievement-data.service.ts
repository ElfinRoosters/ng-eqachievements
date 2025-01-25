import { Injectable, signal } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AchievementDataService implements CanActivate {
  isDataLoaded = signal(true);

  constructor(private router: Router) { }
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

    const fileNameRe = /^(.*?)_(.*?)-Achievements.txt$/;

    this.isDataLoaded.set(true);
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
    console.log('fileList: %s', JSON.stringify(fileList));
    const fileArray = Array.from(fileList);
    const fileNameRe = /^(.*?)_(.*?)-Achievements.txt$/;

    const filteredFiles = fileArray.sort((a, b) => a.name.localeCompare(b.name)).filter(file => fileNameRe.test(file.name));
    console.log(filteredFiles);
    this.files.length = 0;
    this.files.push(...filteredFiles);
    console.log("onFileSelected files.length: %d", this.files.length);

    return true;
  }

}
