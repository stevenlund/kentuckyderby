const baseUrl = "http://localhost:4567";
let sessionId;
let gameId;
let players = [];
let time;

//javascript
// var gameform = document.getElementById("gameform"), button = document.getElementById("newgamebtn");
// gameform.onsubmit = function() {
//     return false;
// }

// button.onclick = function() {
//  setTimeout(function() {
//     gameform.submit();
//  }, 5000);
//    return false;
// }

// DOM ELEMENTS
// Screens
const screens = document.querySelectorAll('.screen');

const newSessionScreen = document.getElementById('new-session-screen');
const newGameScreen = document.getElementById('new-game-screen');
const playScreen = document.getElementById('play-screen');
const finishScreen = document.getElementById('finish-screen');


// Buttons
const newSessionBtn = document.getElementById('new-session-btn');
const newGameBtn = document.getElementById('new-game-btn');
const restartBtn = document.getElementById('restart-btn');

// Inputs
const player1Name = document.getElementById('player-1-name');
const player2Name = document.getElementById('player-2-name');

// Score board
const versus = document.getElementById('versus');
const message = document.getElementById('message');
const seconds = document.getElementById('seconds');


// DISPLAY SCREENS
const displayScreen = (currentScreen) => {
  screens.forEach((screen) => {
    screen.classList.add('d-none');
  });
  currentScreen.classList.remove('d-none');
};


// GAME SEQUENCE
let newSession; let newGame; let play; let finish; let restart;

// Step 1: new session
newSession = () => {
  const url = `${baseUrl}/sessions`;

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  })
    .then(response => response.json())
    .then((data) => {
      sessionId = data.id;
      displayScreen(newGameScreen);
    });
};


// Step 2: new game
newGame = (event) => {
  event.preventDefault();

  const url = `${baseUrl}/sessions/${sessionId}/games`;
  const playerNames = { player1: player1Name.value, player2: player2Name.value };

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(playerNames)
  })
    .then(response => response.json())
    .then((data) => {
      gameId = data.game.id;
      players = data.game.players;
      play();
    });
};


// Step 3: play
const moveForward = (player) => {
  const wagon = document.querySelector(`#player${player}_race .active`);
  if (wagon.nextElementSibling) {
    wagon.nextElementSibling.classList.add('active');
    wagon.classList.remove('active');
  } else {
    const winner = players[player - 1];
    finish(winner);
  }
};

const moveWagons = (event) => {
  if (event.key === 'q') {
    moveForward(1);
  } else if (event.key === 'p') {
    moveForward(2);
  }
};

play = () => {
  displayScreen(playScreen);
  time = new Date();
  document.addEventListener('keyup', moveWagons);
};


// Step 4: finish, display winner
const scoreBoard = (game) => {
  displayScreen(finishScreen);

  const winner = game.players.find(player => player.id === game.winner);
  versus.innerText = `${game.players[0].name} vs. ${game.players[1].name}`;
  message.innerText = `${winner.name} wins!`;
  seconds.innerText = `(${game.elapsed_time} sec.)`;
};

finish = (winner) => {
  document.removeEventListener('keyup', moveWagons);

  const url = `${baseUrl}/games/${gameId}/finish`;
  const elapsedTime = (new Date() - time) / 1000;
  const informations = { winner: winner.id, elapsed_time: elapsedTime };

  fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(informations)
  })
    .then(response => response.json())
    .then((data) => {
      scoreBoard(data.game);
    });
};


// Step 5: restart
const resetRace = (player) => {
  const race = document.querySelector(`#player${player}_race .active`);
  race.classList.remove('active');

  const start = document.querySelector(`#player${player}_race td`);
  start.classList.add('active');
};

restart = (event) => {
  resetRace(1);
  resetRace(2);
  player1Name.value = "";
  player2Name.value = "";
  displayScreen(newGameScreen);
};


// EventListeners on buttons
newSessionBtn.addEventListener('click', newSession);
newGameBtn.addEventListener('click', newGame);
restartBtn.addEventListener('click', restart);


