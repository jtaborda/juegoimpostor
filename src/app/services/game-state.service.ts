import { Injectable, signal } from '@angular/core';
import { Player } from '../models/player.model';

interface VoteState {
  voted?: any[];
  isTie: boolean;
  votedOutPlayer: string | null;
  impostorFound: boolean;
  impostorWin?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  private state = {
    players: signal<Player[]>([]),
    gameStarted: signal(false),
    word: signal<string | null>(''),
    isImpostor: signal(false),
    impostorId: signal(''),
    gameWord: signal(''),
    turn: signal(''),
    currentTurnIndex: signal(0),
    roomId: signal(''),
    playerName: signal(''),
    impostorFound: signal(false),
    vote: signal<VoteState | null>(null),
    hasVoted: signal(false),
    impostorIsGuessing: signal(false),
    gameOver: signal(false),
    status: signal('lobby'),
    isHost: signal(false),
  };

  public players = this.state.players.asReadonly();
  public gameStarted = this.state.gameStarted.asReadonly();
  public word = this.state.word.asReadonly();
  public isImpostor = this.state.isImpostor.asReadonly();
  public impostorId = this.state.impostorId.asReadonly();
  public gameWord = this.state.gameWord.asReadonly();
  public turn = this.state.turn.asReadonly();
  public currentTurnIndex = this.state.currentTurnIndex.asReadonly();
  public roomId = this.state.roomId.asReadonly();
  public playerName = this.state.playerName.asReadonly();
  public impostorFound = this.state.impostorFound.asReadonly();
  public vote = this.state.vote.asReadonly();
  public hasVoted = this.state.hasVoted.asReadonly();
  public impostorIsGuessing = this.state.impostorIsGuessing.asReadonly();
  public gameOver = this.state.gameOver.asReadonly();
  public status = this.state.status.asReadonly();
  public isHost = this.state.isHost.asReadonly();

  setPlayers(players: Player[]) {
    this.state.players.set(players);
  }

  setHost(isHost: boolean) {
    this.state.isHost.set(isHost);
  }

  setGameStarted(gameStarted: boolean) {
    this.state.gameStarted.set(gameStarted);
  }

  setWord(word: string | null) {
    this.state.word.set(word);
  }

  setIsImpostor(isImpostor: boolean) {
    this.state.isImpostor.set(isImpostor);
  }

  setImpostorId(impostorId: string) {
    this.state.impostorId.set(impostorId);
  }

  setGameWord(gameWord: string) {
    this.state.gameWord.set(gameWord);
  }

  setTurn(turn: string) {
    this.state.turn.set(turn);
  }

  setCurrentTurnIndex(turnIndex: number) {
    this.state.currentTurnIndex.set(turnIndex);
  }

  setRoomId(roomId: string) {
    this.state.roomId.set(roomId);
  }

  setPlayerName(playerName: string) {
    this.state.playerName.set(playerName);
  }

  setImpostorFound(impostorFound: boolean) {
    this.state.impostorFound.set(impostorFound);
  }

  setVote(vote: VoteState | null) {
    this.state.vote.set(vote);
  }

  setHasVoted(hasVoted: boolean) {
    this.state.hasVoted.set(hasVoted);
  }

  setImpostorIsGuessing(impostorIsGuessing: boolean) {
    this.state.impostorIsGuessing.set(impostorIsGuessing);
  }

  setGameOver(gameOver: boolean) {
    this.state.gameOver.set(gameOver);
  }

  setStatus(status: 'lobby' | 'playing' | 'voting' | 'results') {
    this.state.status.set(status);
  }

  setGameData(gameData: any) {
    if ('word' in gameData) this.setWord(gameData.word);
    if ('isImpostor' in gameData) this.setIsImpostor(gameData.isImpostor);
    if ('impostorId' in gameData) this.setImpostorId(gameData.impostorId);
    if ('gameWord' in gameData) this.setGameWord(gameData.gameWord);
    if ('turnIndex' in gameData) this.setCurrentTurnIndex(gameData.turnIndex);
  }

  resetForNewRound() {
    this.state.word.set('');
    this.state.isImpostor.set(false);
    this.state.impostorId.set('');
    this.state.gameWord.set('');
    this.state.turn.set('');
    this.state.currentTurnIndex.set(0);
    this.state.impostorFound.set(false);
    this.state.vote.set(null);
    this.state.hasVoted.set(false);
    this.state.impostorIsGuessing.set(false);
    this.state.gameOver.set(false);
    this.state.status.set('lobby');
    this.state.gameStarted.set(false);
  }

  reset() {
    this.state.players.set([]);
    this.state.gameStarted.set(false);
    this.state.word.set('');
    this.state.isImpostor.set(false);
    this.state.impostorId.set('');
    this.state.gameWord.set('');
    this.state.turn.set('');
    this.state.currentTurnIndex.set(0);
    this.state.roomId.set('');
    this.state.playerName.set('');
    this.state.impostorFound.set(false);
    this.state.vote.set(null);
    this.state.hasVoted.set(false);
    this.state.impostorIsGuessing.set(false);
    this.state.gameOver.set(false);
    this.state.isHost.set(false);
  }
}
