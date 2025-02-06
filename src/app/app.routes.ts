import { Routes } from '@angular/router';
import { AchievementDataService } from './achievement-data.service';
import { MainComponent } from './main/main.component';
import { ClientComponent } from './client/client.component';
import { NoDataComponent } from './no-data/no-data.component';
import { HeroicComponent } from './heroic/heroic.component';
import { ClientTaskComponent } from './client-task/client-task.component';
import { ClientCollectsComponent } from './client-collects/client-collects.component';

export const routes: Routes = [
    { path: '', component: NoDataComponent, pathMatch: 'full' },
    { path: 'category', component: MainComponent, canActivate: [AchievementDataService],
        children: [
            { path:':category/task/:task/achievement/:achievement', component: ClientTaskComponent },
            { path:':category/collect/:achievement', component: ClientCollectsComponent },
            { path:':category/achievement/:achievement', component: ClientComponent },
            { path:':category/heroic', component: HeroicComponent }
        ]
    },
    { path: 'notfound', loadChildren: () => import('./not-found/routes')},
    { path: '**', redirectTo: '/notfound'}
];
