const Gameboard = (() => {
  let board = ["", "", "", "", "", "", "", "", ""];

  const getBoard = () => board;

  const placeMarker = (index, marker) => {
    if (index >= 0 && index < board.length && board[index] === "") {
      board[index] = marker;
      return true; 
    }
    return false;
  };

  const reset = () => {
    board = ["", "", "", "", "", "", "", "", ""];
  };

  // Publicly expose only the methods we want other parts of the app to use.
  return { getBoard, placeMarker, reset };
})();


/**
 * A simple factory function to create player objects.
 * @param {string} name - The name of the player.
 * @param {string} marker - The player's marker ('X' or 'O').
 * @returns {object} A player object with a name and marker.
 */
const Player = (name, marker) => {
  return { name, marker };
};


/**
 * DisplayController module to handle all DOM manipulation.
 * Encapsulates all code that interacts with the HTML page.
 */
const DisplayController = (() => {
  // Get references to DOM elements once to be used by the functions below.
  const boardDiv = document.querySelector('#gameboard');
  const messageDiv = document.querySelector('#message-display');
  
  /**
   * Renders the current game board to the webpage.
   * It clears the existing board and rebuilds it from the Gameboard module's state.
   */
  const renderBoard = () => {
    const board = Gameboard.getBoard();
    boardDiv.innerHTML = ""; // Clear existing board to prevent duplicates.
    board.forEach((cell, index) => {
      const cellDiv = document.createElement('div');
      cellDiv.classList.add('cell');
      cellDiv.dataset.index = index; // Add index as a data-attribute for click handling.
      cellDiv.textContent = cell;
      
      // Add specific classes for 'X' and 'O' for styling purposes.
      if (cell === 'X') {
        cellDiv.classList.add('x');
      } else if (cell === 'O') {
        cellDiv.classList.add('o');
      }
      boardDiv.appendChild(cellDiv);
    });
  };
  
  const updateMessage = (message) => {
      messageDiv.textContent = message;
  };

  // Expose the public methods.
  return { renderBoard, updateMessage };
})();


/**
 * GameController module to control the overall flow and logic of the game.
 */
const GameController = (() => {
  let players = [];
  let activePlayer;
  let gameOver;

  // All possible winning combinations of board indices.
  const winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]  // Diagonals
  ];

  /**
   * Starts or restarts the game.
   * It initializes player objects, resets the board, and sets up the initial state.
   */
  const start = () => {
    const player1Name = document.querySelector('#player1-name').value || 'Player 1';
    const player2Name = document.querySelector('#player2-name').value || 'Player 2';
    
    players = [
      Player(player1Name, 'X'),
      Player(player2Name, 'O')
    ];
    
    activePlayer = players[0];
    gameOver = false;
    
    Gameboard.reset();
    DisplayController.renderBoard();
    DisplayController.updateMessage(`${activePlayer.name}'s turn`);
    
    addCellListeners();
  };

  const addCellListeners = () => {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
      // Using { once: true } is a clean way to handle a one-time event.
      cell.addEventListener('click', handleCellClick, { once: true });
    });
  };

  const handleCellClick = (e) => {
    if (gameOver) return; // Stop the game if it has already ended.

    const index = e.target.dataset.index;
    if (Gameboard.placeMarker(index, activePlayer.marker)) {
        DisplayController.renderBoard(); // Re-render to show the new marker.
        
        // Check for a win or tie condition.
      if (checkForWin(activePlayer.marker)) {
        endGame(`${activePlayer.name} wins!`);
      } else if (checkForTie()) {
        endGame("It's a tie!");
      } else {
        // If the game is not over, switch to the other player.
        switchPlayerTurn();
        DisplayController.updateMessage(`${activePlayer.name}'s turn`);
        addCellListeners(); // Re-add listeners to the newly rendered cells.
      }
    }
  };
  
  /**
   * Switches the active player from player 1 to player 2, or vice versa.
   */
  const switchPlayerTurn = () => {
    activePlayer = (activePlayer === players[0]) ? players[1] : players[0];
  };

  /**
   * Checks if the current player has won the game.
   * @param {string} marker - The marker ('X' or 'O') to check for a win.
   * @returns {boolean} - True if the player has won, otherwise false.
   */
  const checkForWin = (marker) => {
    const board = Gameboard.getBoard();
    // The .some() method checks if at least one winning combo is fully populated by the player's marker.
    return winningCombos.some(combo => {
      // The .every() method checks if all cells in a combo have the player's marker.
      return combo.every(index => board[index] === marker);
    });
  };

  /**
   * Checks if the game is a tie (i.e., all cells are filled).
   * @returns {boolean} - True if it's a tie, otherwise false.
   */
  const checkForTie = () => {
    // The .every() method checks if every cell on the board is not an empty string.
    return Gameboard.getBoard().every(cell => cell !== "");
  };
  
  /**
   * Ends the game and displays a final message.
   * @param {string} message - The end-game message to display (e.g., "Player 1 wins!").
   */
  const endGame = (message) => {
    gameOver = true;
    DisplayController.updateMessage(message);
  };

  // Add event listener to the restart button to kick off the game.
  document.querySelector('#restart-btn').addEventListener('click', start);
  
  // No methods need to be returned here as this controller manages itself via event listeners.
  return {};
})();
