import { Component, OnInit, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { GameStateService } from './services/game-state.service';
import { SocketService } from './services/socket.service';
import { HomeComponent } from './components/home/home.component';
import { GameComponent } from './components/game/game.component';
import { VoteComponent } from './components/vote/vote.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [CommonModule, HomeComponent, GameComponent, VoteComponent, FormsModule],
})
export class AppComponent implements OnInit, OnDestroy {
  private gameState = inject(GameStateService);
  private socketService = inject(SocketService);
  currentYear: number = new Date().getFullYear();
  public currentView = signal('home');

  private subscriptions = new Subscription();

  ngOnInit() {
    this.subscriptions.add(
      this.socketService.onGameStarted().subscribe((gameData: any) => {
        if (gameData && gameData.status === 'playing') {
          // The component now only updates the player list, it does not interfere with isHost state.
          this.gameState.setPlayers(gameData.players);

          this.gameState.setGameData({
            word: gameData.word,
            isImpostor: gameData.isImpostor,
            impostorId: gameData.impostorId,
            gameWord: gameData.gameWord,
            turnIndex: gameData.turnIndex,
          });
          this.gameState.setGameStarted(true);
          this.gameState.setStatus('playing');
          this.currentView.set('game');
        }
      })
    );

    this.subscriptions.add(
      this.socketService.onGameReset().subscribe((room: any) => {
        this.gameState.resetForNewRound();
        // The component now only updates the player list, it does not interfere with isHost state.
        this.gameState.setPlayers(room.players);
        this.currentView.set('home');
      })
    );

    this.subscriptions.add(
      this.socketService.onVotingStarted().subscribe((votingData: any) => {
        if (votingData && votingData.status === 'voting') {
          this.gameState.setStatus('voting');
          this.currentView.set('vote');
        }
      })
    );

    this.subscriptions.add(
      this.socketService.onVoteCompleted().subscribe((results: any) => {
        if (results) {
            this.gameState.setVote(results);
            this.gameState.setImpostorFound(results.impostorFound);
            this.currentView.set('vote');
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
