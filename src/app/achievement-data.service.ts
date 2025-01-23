import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AchievementDataService implements CanActivate {
  constructor(private router: Router) { }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {
    if (this.isDataLoaded()) {
      return true;
    } else {
      this.router.navigate([''], {skipLocationChange: true});
      return false;
    }
  }

  isDataLoaded() {
    return false;
  }
}
