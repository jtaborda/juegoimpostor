import { Injectable, signal } from '@angular/core';
import { Player } from '../models/player.model';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  public roomId = signal<string>('');
  public playerName = signal<string>('');
  public players = signal<Player[]>([]);
  public isHost = signal<boolean>(false);
  public word = signal<string | null>(null);
  public isImpostor = signal<boolean>(false);
  public currentTurnIndex = signal<number>(0);
  public impostorId = signal<string>('');
  public gameWord = signal<string>('');
  public votingInProgress = signal<boolean>(false);
  public hasVoted = signal<boolean>(false);
  public vote = signal<{voted: any[], impostorFound: boolean, votedOutPlayer?: string} | null>(null);

  public setRoomId(roomId: string): void {
    this.roomId.set(roomId);
  }

  public setPlayerName(playerName: string): void {
    this.playerName.set(playerName);
  }

  public setPlayers(players: Player[]): void {
    this.players.set(players);
  }

  public setIsHost(isHost: boolean): void {
    this.isHost.set(isHost);
  }

  public setGameData(data: Partial<{ word: string | null; isImpostor: boolean; impostorId: string; gameWord: string; turnIndex: number; }>): void {
    if (data.word !== undefined) this.word.set(data.word);
    if (data.isImpostor !== undefined) this.isImpostor.set(data.isImpostor);
    if (data.impostorId !== undefined) this.impostorId.set(data.impostorId);
    if (data.gameWord !== undefined) this.gameWord.set(data.gameWord);
    if (data.turnIndex !== undefined) this.currentTurnIndex.set(data.turnIndex);
  }

  public setCurrentTurnIndex(index: number): void {
    this.currentTurnIndex.set(index);
  }

  public setVotingInProgress(inProgress: boolean): void {
    this.votingInProgress.set(inProgress);
  }

  public setHasVoted(hasVoted: boolean): void {
    this.hasVoted.set(hasVoted);
  }

  public setVoteResults(results: {voted: any[], impostorFound: boolean, votedOutPlayer?: string}): void {
    this.vote.set(results);
  }

  public reset(): void {
    this.word.set(null);
    this.isImpostor.set(false);
    this.currentTurnIndex.set(0);
    this.impostorId.set('');
    this.gameWord.set('');
    this.votingInProgress.set(false);
    this.hasVoted.set(false);
    this.vote.set(null);
  }
}
