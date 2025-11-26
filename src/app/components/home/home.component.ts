import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SocketService } from '../../services/socket.service';
import { GameStateService } from '../../services/game-state.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  playerName: string = '';
  roomCode: string = '';
  isJoining: boolean = false;
  error: string = '';

  constructor(
    private socketService: SocketService,
    private gameState: GameStateService,
    private router: Router
  ) { }

  ngOnInit() {
    // Limpiar el estado cuando se vuelve al inicio
    this.gameState.reset();
    this.error = '';
  }

  createRoom() {
    if (!this.playerName) return;

    this.socketService.createRoom(this.playerName, (response: any) => {
      if (response.success) {
        this.gameState.roomId = response.roomId;
        this.gameState.playerName = this.playerName;
        this.gameState.players = response.room.players;
        this.gameState.isHost = true;
        this.router.navigate(['/lobby']);
      } else {
        this.error = 'Error creating room';
      }
    });
  }

  joinRoom() {
    if (!this.playerName || !this.roomCode) return;

    this.socketService.joinRoom(this.roomCode.toUpperCase(), this.playerName, (response: any) => {
      if (response.success) {
        this.gameState.roomId = this.roomCode.toUpperCase();
        this.gameState.playerName = this.playerName;
        this.gameState.players = response.room.players;
        this.gameState.isHost = false;
        this.router.navigate(['/lobby']);
      } else {
        this.error = response.message;
      }
    });
  }
}
