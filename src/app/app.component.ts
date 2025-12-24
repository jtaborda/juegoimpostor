import { Component, OnInit, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { GameStateService } from './services/game-state.service';
import { SocketService } from './services/socket.service';
import { HomeComponent } from './components/home/home.component';
import { GameComponent } from './components/game/game.component';
import { VoteComponent } from './components/vote/vote.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [CommonModule, HomeComponent, GameComponent, VoteComponent],
})
export class AppComponent implements OnInit, OnDestroy {
  private gameState = inject(GameStateService);
  private socketService = inject(SocketService);
  currentYear: number = new Date().getFullYear();
  public currentView = signal('home');

  private subscriptions = new Subscription();

  ngOnInit() {
    this.subscriptions.add(
      this.socketService.onGameStarted().subscribe((gameData) => {
        if (gameData && gameData.status === 'playing') {
          this.gameState.setGameData({
            word: gameData.word,
            isImpostor: gameData.isImpostor,
            impostorId: gameData.impostorId,
            gameWord: gameData.gameWord,
            turnIndex: gameData.turnIndex,
          });
          this.currentView.set('game');
        }
      })
    );

    this.subscriptions.add(
      this.socketService.onGameReset().subscribe((room) => {
        this.gameState.reset();
        this.gameState.setPlayers(room.players);
        this.currentView.set('home');
      })
    );

    this.subscriptions.add(
      this.socketService.onVotingStarted().subscribe((room) => {
        this.gameState.setPlayers(room.players);
        this.currentView.set('vote');
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
