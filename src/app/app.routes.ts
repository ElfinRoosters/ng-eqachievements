import { Routes, BaseRouteReuseStrategy, ActivatedRouteSnapshot } from '@angular/router';
import { AchievementDataService } from './achievement-data.service';
import { MainComponent } from './main/main.component';
import { ClientComponent } from './client/client.component';
import { NoDataComponent } from './no-data/no-data.component';
import { HeroicComponent } from './heroic/heroic.component';

export const routes: Routes = [
    { path: '', component: NoDataComponent, pathMatch: 'full' },
    { path: 'category', component: MainComponent, canActivate: [AchievementDataService],
        children: [
            { path:':category/achievement/:achievement', component: ClientComponent },
            { path:':category/heroic', component: HeroicComponent }
        ]
    },
    { path: 'notfound', loadChildren: () => import('./not-found/routes')},
    { path: '**', redirectTo: '/notfound'}

];
