import { Injectable } from '@angular/core';
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, ref, set, onValue, update, get, runTransaction } from 'firebase/database';
import { Observable, BehaviorSubject } from 'rxjs';
import { firebaseConfig } from '../firebase-config';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private app: any;
  private db: any;
  private currentPlayerId: string;

  // Subjects to mimic socket events
  private playerJoinedSubject = new BehaviorSubject<any[]>([]);
  private gameStartedSubject = new BehaviorSubject<any>(null);
  private turnChangedSubject = new BehaviorSubject<number>(0);
  private gameResetSubject = new BehaviorSubject<any>(null);
  private playerLeftSubject = new BehaviorSubject<any[]>([]);
  private impostorGuessingSubject = new BehaviorSubject<void>(undefined);
  private votingStartedSubject = new BehaviorSubject<any>(null);
  private voteCompletedSubject = new BehaviorSubject<any>(null);
  private playerVotedSubject = new BehaviorSubject<any>(null);

  // Word List
  private words = ["Manzana", "Guitarra", "Playa", "Computadora", "Pizza", "Avión", "Fútbol", "Reloj", "Gato", "Libro", "Montaña", "Coche", "Zapato", "Sol", "Luna", "Casa", "Trabajo", "Amigo", "Familia", "Escuela", "Agua", "Café", "Pan", "Ciudad", "Río", "Shakira", "Canción", "Batería", "Micrófono", "Concierto", "Rock", "Pop", "Reguetón", "Salsa", "Trompeta", "Piano", "Violín", "DJ", "Disco", "Melodía", "PlayStation", "Xbox", "Nintendo", "Mario Bros", "Estrategia", "Servidor", "Teléfono", "Tablet", "Internet", "Router", "Cable", "Pantalla", "Teclado", "Mouse", "Auriculares", "Red", "Software", "Hardware", "Base De Datos", "API", "Hamburguesa", "Taco", "Helado", "Chocolate", "Cereal", "Arroz", "Pollo", "Sopa", "Ensalada", "Parque de diversiones", "Museo", "Cine", "Teatro", "Hotel", "Restaurante", "CentroComercial", "Estadio", "Aeropuerto", "Iglesia", "Perro", "Bicicleta", "Camino", "Cielo", "Nube", "Colombia", "Rosa", "Flor", "Llave", "Puerta", "Ventana", "Venezuela","Bosque","Desierto","Volcán","Lago","Selva","Isla","Cascada","Océano","Valle","Glaciar", "Pradera","Acantilado","Cueva","Pantano","Arrecife","Cordillera","Sabana","Manglar","Profesor","Estudiante","Vecino","Jefe","Compañero","Artista","Cantante","Escritor","Actor","Turista", "Pintura","Escultura","Fotografía","Danza","Ópera","Poema","Novela","TeatroMusical","Cineasta","Galería", "Satélite","Robot","InteligenciaArtificial","Dron","Microscopio","Laboratorio","Energía","Astronauta","Cohete", "Queso","Vino","Jugo","Empanada","Arepa","Frijoles","Pescado","Mariscos","Galleta","Té", "Cartas","Ajedrez","Dados","Puzzle","Carrera","Arcade","Realidad Virtual","Simulación","Rol","Trivia", "Tren","Barco","Moto","Metro","Camión","Submarino","Patineta","Autobús","Tractor","Tranvía", "Libertad","Paz","Amor","Esperanza","Sueño","Conocimiento","Misterio","Imaginación","Sabiduría","Fuerza", "BosquesTropicales","Arena","Roca","Mineral","Diamante","Oro","Plata","Hierro","Cobre","Cristal", "Planeta","Galaxia","Universo","Nebulosa","Constelación","Asteroide","Cometa","Meteorito","Eclipse","Órbita", "Cultura","Historia","Tradición","Leyenda","Mito","Ritual","Ceremonia","Festival","Costumbre","Patrimonio", "Matemáticas","Física","Química","Biología","Geología","Astronomía","Genética","Ecología","Psicología","Sociología", "Economía","Política","Derecho","Medicina","Ingeniería","Arquitectura","Filosofía","Lingüística","Antropología","Arqueología", "Carne","Verdura","Fruta","Mandarina","Sandía","Melón","Kiwi","Pera","Durazno","Ciruela", "Mango","Papaya","Coco","Piña","Limón","Naranja","Fresa","Uva","Granada","Guayaba", "Heladería","Panadería","Carnicería","Verdulería","Mercado","Supermercado","Tienda","Farmacia","Kiosco","Bodega", "Plaza","Avenida","Calle","Carretera","Puente","Túnel","Edificio","Rascacielos","Monumento","Fuente", "Estrella De Mar","Coral","Medusa","Tiburón","Ballena","Delfín","Pulpo","Calamar","CaballitoDeMar","Pingüino", "León","Tigre","Elefante","Jirafa","Cebra","Hipopótamo","Rinoceronte","Mono","Koala","Canguro", "Águila","Cóndor","Halcón","Búho","Colibrí","PavoReal","Gallo","Gallina","Pato","Ganso", "Perico","Loro","Canario","Paloma","Flamenco","Pelícano","Cisne","Cuervo","Golondrina","Avestruz", "Montañismo","Escalada","Senderismo","Camping","Pesca","Surf","Buceo","Esquí","Snowboard", "Baloncesto","Tenis","Voleibol","Natación","Atletismo","Boxeo","Karate","Judo","Taekwondo","Yoga", "Ciclismo","Patinaje","Esgrima","Rugby","Hockey","Golf","Béisbol","Softbol","Ping Pong", "Radio","Televisión","Podcast","Serie","Película","Documental","Noticia","Revista","Periódico","Blog", "Correo","Mensaje","Chat","Foro","Red Social","Aplicación","Programa","Juego","Plataforma","Canal", "Cámara","Fotógrafo","Vídeo","Imagen","Retrato","Selfie","Paisaje","Panorámica","Collage","Animación", "Color","Forma","Tamaño","Diseño","Estilo","Moda","Tendencia","Accesorio","Ropa","Sombrero", "Bufanda","Guante","Abrigo","Camisa","Pantalón","Falda","Vestido","Chaqueta","Corbata","Cinturón", "Zapatería","Joyería","Perfumería","Óptica","Relojería","Boutique","Sastrería","Mercería","Papelería","Librería", "CienciaFicción","Fantasía","Terror","Suspenso","Drama","Comedia","Acción","Aventura","Romance","Musical", "Idioma","Palabra","Frase","Texto","Libro Digital","Diccionario","Enciclopedia","Ensayo","Artículo","Guion", "Plan","Proyecto","Meta","Objetivo","Idea","Propuesta","Tarea","Investigación","Experimento", "Clima","Temperatura","Estación","Primavera","Verano","Otoño","Invierno","Tormenta","Huracán","Tornado", "Nieve","Granizo","Lluvia","Viento","Relámpago","Trueno","Sequía","Inundación","Terremoto","Sismo","Algoritmo","Código", "Navegador","Buscador","Archivo","Documento","Carpeta","Intérprete", "Anime","Manga","Comic","Super héroe","Villano","Saga","Trilogía","Franquicia","Personaje", "Instrumento","Sonido","Ritmo","Armonía","Compás","Escala","Acorde","Nota",,"Director", "Playlist","Álbum","Dueto","Banda","Orquesta","Coral", "Carpintería","Cerámica","Artesanía","Manualidad","Diseño Gráfico","Ilustración","Graffiti","Murales","Escenografía","Decoración", "Jardín","Huerto","Maceta","Planta","Árbol","Arbusto","Semilla","Raíz","Hoja","Fruto", "Planificación","Organización","Gestión","Administración","Producción","Distribución","Comercialización","Marketing","Publicidad","Ventas", "Banco","Dinero","Moneda","Billete","Tarjeta","Crédito","Débito","Inversión","Ahorro","Interés","Sostenibilidad","Reciclaje","Reutilización","Energía Solar","Biocombustible","Eficiencia", "Salud","Bienestar","Ejercicio","Nutrición","Higiene","Vacuna","Medicamento","Hospital","Clínica","Doctor", "Paciente","Enfermera","Cirugía","Tratamiento","Diagnóstico","Síntoma","Prevención","Rehabilitación","Terapia","Psicólogo" ];

  constructor() {
    if (!getApps().length) {
        this.app = initializeApp(firebaseConfig);
    } else {
        this.app = getApps()[0]; // Use existing app
    }
    this.db = getDatabase(this.app);
    this.currentPlayerId = Math.random().toString(36).substring(2, 15);
  }

  private normalizeString(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  getSocketId() {
    return this.currentPlayerId;
  }

  resetSubjects() {
    this.playerJoinedSubject.next([]);
    this.gameStartedSubject.next(null);
    this.turnChangedSubject.next(0);
    this.gameResetSubject.next(null);
    this.playerLeftSubject.next([]);
    this.impostorGuessingSubject.next(undefined);
    this.votingStartedSubject.next(null);
    this.voteCompletedSubject.next(null);
    this.playerVotedSubject.next(null);
  }

  createRoom(playerName: string, callback: any) {
    this.resetSubjects();
    const roomId = Math.random().toString(36).substring(2, 7).toUpperCase();
    const roomRef = ref(this.db, 'rooms/' + roomId);
    const newPlayer = { id: this.currentPlayerId, name: playerName, isHost: true, score: 0 };
    const roomData = { id: roomId, players: [newPlayer], status: 'lobby', word: '', impostorId: '', turnIndex: 0, votes: {}, voteResults: null };
    set(roomRef, roomData).then(() => {
      this.listenToRoom(roomId);
      callback({ success: true, roomId, room: roomData });
    }).catch(err => callback({ success: false, message: err.message }));
  }

  joinRoom(roomId: string, playerName: string, callback: any) {
    this.resetSubjects();
    const roomRef = ref(this.db, 'rooms/' + roomId);
    get(roomRef).then((snapshot) => {
      if (snapshot.exists()) {
        const room = snapshot.val();
        if (room.status !== 'lobby') {
          callback({ success: false, message: 'El juego ya ha comenzado' });
          return;
        }
        if (room.players && room.players.some((p: any) => p.name === playerName)) {
          callback({ success: false, message: 'Nombre ya en uso' });
          return;
        }
        const newPlayer = { id: this.currentPlayerId, name: playerName, isHost: false, score: 0 };
        const updatedPlayers = [...(room.players || []), newPlayer];
        update(roomRef, { players: updatedPlayers }).then(() => {
          this.listenToRoom(roomId);
          callback({ success: true, room: { ...room, players: updatedPlayers } });
        });
      } else {
        callback({ success: false, message: 'Sala no encontrada' });
      }
    }).catch((error) => {
      callback({ success: false, message: error.message });
    });
  }

  startGame(roomId: string) {
    const roomRef = ref(this.db, 'rooms/' + roomId);
    runTransaction(roomRef, (room) => {
        if (room) {
            if (room.status === 'playing') {
                return;
            }
            const shuffledPlayers = [...room.players];
            for (let i = shuffledPlayers.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledPlayers[i], shuffledPlayers[j]] = [shuffledPlayers[j], shuffledPlayers[i]];
            }
            const word = this.words[Math.floor(Math.random() * this.words.length)];
            const playerIds = shuffledPlayers.map((p: any) => p.id);
            const impostorId = playerIds[Math.floor(Math.random() * playerIds.length)];
            const turnIndex = Math.floor(Math.random() * shuffledPlayers.length);
            room.status = 'playing';
            room.players = shuffledPlayers;
            room.word = word;
            room.impostorId = impostorId;
            room.turnIndex = turnIndex;
            room.votes = {};
            room.voteResults = null;
            return room;
        }
        return room;
    }).catch((error) => {
        console.error("Transaction failed: ", error);
    });
  }

  sendVote(roomId: string, playerId: string) {
    const roomRef = ref(this.db, 'rooms/' + roomId);
    get(roomRef).then(snapshot => {
      if (snapshot.exists()) {
        const room = snapshot.val();
        const voterId = this.getSocketId();
        const currentVotes = room.votes || {};
        currentVotes[voterId] = playerId;
        update(roomRef, { votes: currentVotes }).then(() => {
          if (Object.keys(currentVotes).length === room.players.length) {
            this.calculateVoteResults(roomId);
          }
        });
      }
    });
  }

  calculateVoteResults(roomId: string) {
    const roomRef = ref(this.db, 'rooms/' + roomId);
    get(roomRef).then(snapshot => {
      if (snapshot.exists()) {
        const room = snapshot.val();
        const votes = room.votes;
        const voteCounts = (Object.values(votes) as string[]).reduce((acc: { [key: string]: number }, playerId: string) => {
            acc[playerId] = (acc[playerId] || 0) + 1;
            return acc;
        }, {});
        const sortedVotes = Object.entries(voteCounts).sort((a, b) => b[1] - a[1]);
        const maxVotes = sortedVotes.length > 0 ? sortedVotes[0][1] : 0;
        const mostVoted = sortedVotes.filter(entry => entry[1] === maxVotes);
        let voteResults;
        if (mostVoted.length > 1) { // Tie
            voteResults = { isTie: true, votedOutPlayer: null, impostorFound: false };
        } else {
            const votedOutPlayerId = mostVoted[0][0];
            const impostorFound = votedOutPlayerId === room.impostorId;
            voteResults = { isTie: false, votedOutPlayer: votedOutPlayerId, impostorFound };
        }
        update(roomRef, { status: 'results', voteResults });
      }
    });
  }

  startNewRound(roomId: string) {
    const roomRef = ref(this.db, 'rooms/' + roomId);
    update(roomRef, { status: 'lobby', word: '', impostorId: '', turnIndex: 0, votes: {}, voteResults: null });
  }

  impostorGuess(roomId: string, guess: string) {
    const roomRef = ref(this.db, 'rooms/' + roomId);
    get(roomRef).then(snapshot => {
      if (snapshot.exists()) {
        const room = snapshot.val();
        const normalizedWord = this.normalizeString(room.word);
        const normalizedGuess = this.normalizeString(guess);
        const impostorWin = normalizedWord === normalizedGuess;
        update(roomRef, { status: 'results', voteResults: { impostorWin, isTie: false, votedOutPlayer: null, impostorFound: false } });
      }
    });
  }

  endTurn(roomId: string) {
    const roomRef = ref(this.db, 'rooms/' + roomId);
    get(roomRef).then(snapshot => {
      if (snapshot.exists()) {
        const room = snapshot.val();
        const nextTurn = (room.turnIndex + 1) % room.players.length;
        update(roomRef, { turnIndex: nextTurn });
      }
    });
  }

  startVoting(roomId: string) {
    const roomRef = ref(this.db, 'rooms/' + roomId);
    update(roomRef, { status: 'voting', voteResults: null });
  }

  private listenToRoom(roomId: string) {
    const roomRef = ref(this.db, 'rooms/' + roomId);
    onValue(roomRef, (snapshot) => {
      const room = snapshot.val();
      if (!room) return;

      this.playerJoinedSubject.next(room.players || []);
      this.playerLeftSubject.next(room.players || []);

      if (room.status === 'playing' && this.gameStartedSubject.value?.status !== 'playing') {
        const isImpostor = this.currentPlayerId === room.impostorId;
        const gameData = {
          status: 'playing',
          players: room.players,
          turnIndex: room.turnIndex,
          impostorId: room.impostorId,
          gameWord: room.word,
          isImpostor: isImpostor,
          word: isImpostor ? null : room.word
        };
        this.gameStartedSubject.next(gameData);
      }

      if (room.status === 'voting' && this.votingStartedSubject.value?.status !== 'voting') {
        this.votingStartedSubject.next({ status: 'voting' });
      }

      if (room.status === 'results' && (!this.voteCompletedSubject.value || JSON.stringify(this.voteCompletedSubject.value) !== JSON.stringify(room.voteResults))) {
        this.voteCompletedSubject.next(room.voteResults);
      }

      if (room.votes && Object.keys(room.votes).length > (this.playerVotedSubject.value ? Object.keys(this.playerVotedSubject.value).length : 0)) {
        this.playerVotedSubject.next(room.votes);
      }

      if (room.turnIndex !== this.turnChangedSubject.value) {
        this.turnChangedSubject.next(room.turnIndex);
      }

      if (room.status === 'lobby' && this.gameStartedSubject.value?.status === 'playing') {
        this.gameResetSubject.next(room);
        this.gameStartedSubject.next(null);
        this.votingStartedSubject.next(null); // THE FIX
        this.voteCompletedSubject.next(null);
      }

      if (room.impostorIsGuessing) {
        this.impostorGuessingSubject.next();
      }
    });
  }

  onPlayerJoined(): Observable<any> { return this.playerJoinedSubject.asObservable(); }
  onGameStarted(): Observable<any> { return this.gameStartedSubject.asObservable(); }
  onTurnChanged(): Observable<any> { return this.turnChangedSubject.asObservable(); }
  onGameReset(): Observable<any> { return this.gameResetSubject.asObservable(); }
  onPlayerLeft(): Observable<any> { return this.playerLeftSubject.asObservable(); }
  onImpostorGuessing(): Observable<void> { return this.impostorGuessingSubject.asObservable(); }
  onVotingStarted(): Observable<any> { return this.votingStartedSubject.asObservable(); }
  onVoteCompleted(): Observable<any> { return this.voteCompletedSubject.asObservable(); }
  onPlayerVoted(): Observable<any> { return this.playerVotedSubject.asObservable(); }
}
