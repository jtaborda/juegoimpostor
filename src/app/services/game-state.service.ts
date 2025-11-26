import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  roomId: string = '';
  playerName: string = '';
  players: any[] = [];
  isHost: boolean = false;

  // Game Info
  word: string | null = null;
  isImpostor: boolean = false;
  currentTurnIndex: number = 0;
  impostorId: string = '';
  gameWord: string = ''; // La palabra del juego (para mostrar al final)

  constructor() { }

  reset() {
    this.roomId = '';
    this.players = [];
    this.isHost = false;
    this.word = null;
    this.isImpostor = false;
    this.currentTurnIndex = 0;
    this.impostorId = '';
    this.gameWord = '';
  }
}
