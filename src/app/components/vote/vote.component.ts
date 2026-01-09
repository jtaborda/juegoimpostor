import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { GameStateService } from '../../services/game-state.service';
import { SocketService } from '../../services/socket.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vote',
  templateUrl: './vote.component.html',
  styleUrls: ['./vote.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, CommonModule],
})
export class VoteComponent {
  private gameState = inject(GameStateService);
  private socketService = inject(SocketService);

  public players = this.gameState.players;
  public currentPlayerId = this.socketService.getSocketId();
  public hasVoted = this.gameState.hasVoted;
  public voteResults = this.gameState.vote;
  public showResults = computed(() => !!this.voteResults());
  public gameWord = this.gameState.gameWord;
  public impostorId = this.gameState.impostorId;
  public isHost = this.gameState.isHost;
  public impostorFound = this.gameState.impostorFound;
  public isImpostor = this.gameState.isImpostor;
  public impostorIsGuessing = this.gameState.impostorIsGuessing;
  public impostorGuessedWord = signal('');
  public votablePlayers = computed(() => this.players().filter(p => p.id !== this.currentPlayerId));
  public impostorName = computed(() => this.players().find(p => p.id === this.impostorId())?.name);
  public votedOutPlayerName = computed(() => this.players().find(p => p.id === this.voteResults()?.votedOutPlayer)?.name);

  constructor() {
    this.socketService.onImpostorGuessing().subscribe(() => {
      this.gameState.setImpostorIsGuessing(true);
    });

    this.socketService.onVoteCompleted().subscribe(results => {
      this.gameState.setVote(results);
    });

    this.socketService.onPlayerVoted().subscribe(votes => {
      // Optional: Update UI to show who has voted
    });
  }

  voteForPlayer(player: { id: string, name: string }) {
    this.socketService.sendVote(this.gameState.roomId(), player.id);
    this.gameState.setHasVoted(true);
  }

  startNewRound() {
    this.socketService.startNewRound(this.gameState.roomId());
    this.gameState.setVote(null);
    this.gameState.setHasVoted(false);
  }

  submitGuess() {
    this.socketService.impostorGuess(this.gameState.roomId(), this.impostorGuessedWord());
    this.gameState.setImpostorIsGuessing(false);
  }

}
