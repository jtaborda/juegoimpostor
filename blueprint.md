# Impostor - Blueprint de la Aplicación

## Visión General

Impostor es un juego de deducción social multijugador en tiempo real. Los jugadores se unen a una sala, y a uno de ellos se le asigna en secreto el rol de "Impostor". El objetivo de los demás jugadores es identificar al impostor a través de una votación, mientras que el impostor intenta evitar ser descubierto.

## Diseño y Estilo

La aplicación sigue un diseño moderno y oscuro con una estética de "neón futurista".

- **Paleta de Colores**: Un fondo oscuro (gradiente radial de `#1a1a2e` a `#16213e`) con acentos de neón, como cian (`#00ffcc`) y magenta (`#ff00cc`), para los elementos interactivos y títulos.
- **Tipografía**: Se utiliza la fuente 'Inter' para una apariencia limpia y moderna.
- **UI**: La interfaz se basa en tarjetas con fondos semitransparentes y un efecto de desenfoque (`backdrop-filter`), dándoles una apariencia "elevada".
- **Iconografía**: Se utilizan emojis para añadir un toque visual (ej. `📋` para copiar, `👁️` para visitas).

## Características Implementadas

- **Creación y Unión a Salas**: Los jugadores pueden crear una nueva sala de juego o unirse a una existente mediante un código de sala.
- **Lobby (Sala de Espera)**:
    - Muestra el código de la sala, que se puede copiar al portapapeles con un clic.
    - Lista los jugadores que se han unido a la sala en tiempo real.
    - El anfitrión de la sala tiene un botón para "Empezar el Juego", que solo se activa cuando hay 2 o más jugadores.
- **Mecánica del Juego**:
    - Cuando el juego empieza, a cada jugador se le asigna un rol (Impostor o No) y una palabra (los no impostores reciben la palabra secreta, el impostor recibe una palabra ligeramente diferente o una genérica).
    - Los jugadores describen su palabra con una sola palabra para ayudar a los demás a adivinar quién es el impostor.
- **Sistema de Votación**:
    - Después de la fase de descripción, los jugadores votan por quién creen que es el impostor.
    - La pantalla de votación muestra los resultados en tiempo real.
- **Comunicación en Tiempo Real**: Toda la comunicación entre clientes se gestiona a través de WebSockets (`socket.io`), garantizando actualizaciones instantáneas.

## Plan de Refactorización Completado

Se ha llevado a cabo una refactorización importante para modernizar la base del código de Angular y centralizar la lógica.

1.  **Eliminación del `LobbyComponent`**: La funcionalidad del `LobbyComponent` (sala de espera) se ha fusionado con el `HomeComponent`.
2.  **Lógica Condicional en `HomeComponent`**: El `HomeComponent` ahora muestra condicionalmente la vista del lobby si el jugador está en una sala, o el formulario de creación/unión si no lo está.
3.  **Centralización del Estado de la Interfaz**: Se ha eliminado el estado local `isJoining` en favor de una única fuente de verdad: `gameState.roomId()`.
4.  **Limpieza de Rutas**: Se ha eliminado la ruta `/lobby` de `app.routes.ts`, ya que `AppComponent` gestiona la navegación a través de `RouterOutlet`.
5.  **Adopción de Prácticas Modernas de Angular**:
    - Se ha actualizado `AppComponent` para usar `ChangeDetectionStrategy.OnPush`.
    - Se ha convertido `visitCount` a un `signal`.
    - Se ha reemplazado `*ngIf` por la sintaxis de control de flujo nativo (`@if`).
