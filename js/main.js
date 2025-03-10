const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");

// Set canvas size programmatically
canvas.width = 350;
canvas.height = 350;

const gridSize = 20; // Doubled size
let width = gridSize;
let height = gridSize; // Changed from gridSize/2 to gridSize to create a square

// Change snake structure to an array of segments
let snake = [];
let snakeLength = 1; // Initial snake length
let score = 0; // Game score

// Initial position of snake head
let x = 20 + gridSize / 2 - width / 2;
let y = 20 + gridSize / 2 - height / 2;
let dir = "";

const tileCount = canvas.width / gridSize;

// Add snake head to the array
snake.push({ x: x, y: y });

let food = {
  x:
    Math.floor((Math.random() * (canvas.width - gridSize)) / gridSize) *
      gridSize +
    gridSize / 2 -
    gridSize / 2,
  y:
    Math.floor((Math.random() * (canvas.height - gridSize)) / gridSize) *
      gridSize +
    gridSize / 2 -
    gridSize / 2, // Changed from gridSize/4 to gridSize/2 for square center
  width: gridSize,
  height: gridSize, // Changed from gridSize/2 to gridSize to create a square
};

// Function to display the snake
const snakeDisplay = () => {
  // Snake head color different from body
  ctx.fillStyle = "#ff3300"; // Snake head color
  ctx.fillRect(snake[0].x, snake[0].y, width, height);

  // Snake body color
  ctx.fillStyle = "#ff6600";

  // Display the rest of snake segments
  for (let i = 1; i < snake.length; i++) {
    ctx.fillRect(snake[i].x, snake[i].y, width, height);
  }
};

// Function to display food
const foodDisplay = () => {
  // Use gradient for food
  const gradient = ctx.createRadialGradient(
    food.x + food.width / 2,
    food.y + food.height / 2,
    1,
    food.x + food.width / 2,
    food.y + food.height / 2,
    food.width / 2
  );
  gradient.addColorStop(0, "#00ffff");
  gradient.addColorStop(1, "#0000ff");

  ctx.fillStyle = gradient;
  ctx.fillRect(food.x, food.y, food.width, food.height);
};

// Function to update score
const updateScore = () => {
  scoreElement.textContent = score;
};

// Function to check collision between snake and food
const checkFoodCollision = () => {
  // Calculate distance between snake head center and food center
  const snakeX = snake[0].x + width / 2;
  const snakeY = snake[0].y + height / 2;
  const foodX = food.x + food.width / 2;
  const foodY = food.y + food.height / 2;

  // If distance is less than half the sum of widths and heights, collision occurred
  if (
    Math.abs(snakeX - foodX) < (width + food.width) / 2 &&
    Math.abs(snakeY - foodY) < (height + food.height) / 2
  ) {
    // Increase snake length
    snakeLength++;
    // Increase score
    score += 5;
    updateScore();
    console.log("Snake ate food! New length:", snakeLength, "Score:", score);
    // Create new food
    createFood();
    return true;
  }
  return false;
};

// Function to check collision between snake and wall
const checkWallCollision = () => {
  // Check collision with left and right walls
  if (snake[0].x < 0 || snake[0].x + width > canvas.width) {
    return true;
  }
  // Check collision with top and bottom walls
  if (snake[0].y < 0 || snake[0].y + height > canvas.height) {
    return true;
  }
  return false;
};

// New function to check collision between snake and its body
const checkSelfCollision = () => {
  // Check from second segment onwards (since first segment is the head)
  for (let i = 1; i < snake.length; i++) {
    // If snake head collides with any body segment
    if (snake[0].x === snake[i].x && snake[0].y === snake[i].y) {
      return true;
    }
  }
  return false;
};

// Function to restart the game
const resetGame = () => {
  // Reset snake to initial state
  snake = [];
  snakeLength = 1;
  x = 20 + gridSize / 2 - width / 2;
  y = 20 + gridSize / 2 - height / 2;
  dir = "";
  snake.push({ x: x, y: y });

  // Reset score to zero
  score = 0;
  updateScore();

  // Create new food
  createFood();

  // Restart game interval if it was cleared
  if (!gameInterval) {
    gameInterval = setInterval(gameLoop, 150);
  }
};

// Function to display game over message
const showGameOver = (reason) => {
  // Semi-transparent background
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Game over text
  ctx.fillStyle = "#fff";
  ctx.font = "30px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2 - 30);

  // Reason for game over
  ctx.font = "16px Arial";
  ctx.fillText(reason, canvas.width / 2, canvas.height / 2);

  // Final score
  ctx.fillText(
    `Final Score: ${score}`,
    canvas.width / 2,
    canvas.height / 2 + 30
  );

  // Restart guide
  ctx.font = "14px Arial";
  ctx.fillText(
    "Press any key to restart",
    canvas.width / 2,
    canvas.height / 2 + 60
  );

  // Set a flag to indicate game over state
  gameOver = true;
};

// Main game function that runs each frame
const gameLoop = () => {
  // Clear the entire screen before redrawing
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Display food
  foodDisplay();

  // Move snake only if direction is set
  if (dir !== "") {
    // Move snake body (from tail to head)
    for (let i = snake.length - 1; i > 0; i--) {
      snake[i].x = snake[i - 1].x;
      snake[i].y = snake[i - 1].y;
    }

    // Move snake head based on direction
    if (dir == "to-right") {
      snake[0].x += gridSize / 2; // Half gridSize for horizontal movement
    } else if (dir == "to-left") {
      snake[0].x -= gridSize / 2; // Half gridSize for horizontal movement
    } else if (dir == "to-bottom") {
      snake[0].y += gridSize / 2; // Half gridSize for vertical movement
    } else if (dir == "to-top") {
      snake[0].y -= gridSize / 2; // Half gridSize for vertical movement
    }

    // Check collision with wall
    if (checkWallCollision()) {
      showGameOver("You hit the wall! 💥");
      clearInterval(gameInterval);
      gameInterval = null;
      return;
    }

    // Check collision with own body
    if (checkSelfCollision()) {
      showGameOver("You hit yourself! 🤦‍♂️");
      clearInterval(gameInterval);
      gameInterval = null;
      return;
    }

    // Check collision with food
    const ateFood = checkFoodCollision();

    // If snake ate food or needs to grow
    if (ateFood && snake.length < snakeLength) {
      // Add a new segment to the end of the snake
      // Position it similar to the current last segment
      const lastSegment = snake[snake.length - 1];
      snake.push({ x: lastSegment.x, y: lastSegment.y });
    }
  }

  // Display snake
  snakeDisplay();
};

// Add a game over flag
let gameOver = false;

// Start game loop
let gameInterval = setInterval(gameLoop, 150);

const createFood = () => {
  // Calculate maximum allowed position for food
  const maxX = canvas.width - gridSize;
  const maxY = canvas.height - gridSize;

  // Calculate random position within allowed range
  const gridX = Math.floor(Math.random() * (maxX / gridSize)) * gridSize;
  const gridY = Math.floor(Math.random() * (maxY / gridSize)) * gridSize;

  // Calculate grid center
  const centerX = gridX + gridSize / 2 - gridSize / 2;
  const centerY = gridY + gridSize / 2 - gridSize / 2; // Changed from gridSize/4 to gridSize/2 for square center

  const newFood = {
    x: centerX,
    y: centerY,
    width: gridSize,
    height: gridSize, // Changed from gridSize/2 to gridSize to create a square
  };
  food = newFood;

  // Display food position in console for debugging
  console.log("New food position:", centerX, centerY);
};

window.addEventListener("load", (event) => {
  console.log("Canvas size:", canvas.width, canvas.height);
  // Initial display of food and snake
  foodDisplay();
  snakeDisplay();
  updateScore();
});

document.addEventListener("keydown", function (event) {
  // If game is over and a key is pressed, restart the game
  if (gameOver) {
    gameOver = false;
    resetGame();
    return;
  }

  if (event.keyCode == 37) {
    // Only if not moving right, can move left
    if (dir !== "to-right") dir = "to-left";
  }
  if (event.keyCode == 39) {
    // Only if not moving left, can move right
    if (dir !== "to-left") dir = "to-right";
  }
  if (event.keyCode == 40) {
    // Only if not moving up, can move down
    if (dir !== "to-top") dir = "to-bottom";
  }
  if (event.keyCode == 38) {
    // Only if not moving down, can move up
    if (dir !== "to-bottom") dir = "to-top";
  }
});
