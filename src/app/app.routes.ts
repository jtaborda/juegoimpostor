import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { GameComponent } from './components/game/game.component';
import { VoteComponent } from './components/vote/vote.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'game', component: GameComponent },
    { path: 'vote', component: VoteComponent },
    { path: '**', redirectTo: '' }
];
