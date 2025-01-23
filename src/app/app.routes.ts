import { Routes } from '@angular/router';
import { AchievementDataService } from './achievement-data.service';
import { MainComponent } from './main/main.component';
import { ClientComponent } from './client/client.component';
import { NoDataComponent } from './no-data/no-data.component';

export const routes: Routes = [
    { path: '', component: NoDataComponent, pathMatch: 'full' },
    { path: '', component: MainComponent, canActivate: [AchievementDataService],
        children: [
            { path:'category/:category/achievement/:achievement', component: ClientComponent }
        ]
    },
    { path: 'notfound', loadChildren: () => import('./not-found/routes')},
    { path: '**', redirectTo: '/notfound'}

];
