var number = document.querySelector("#number");
var score = document.querySelector("#score");
var playerOneButton = document.querySelector("#addPlayerOne");
var playerTwoButton = document.querySelector("#addPlayerTwo");
var reset = document.querySelector("#reset");
var p1 = document.querySelector("#playerOne");
var p2 = document.querySelector("#playerTwo");
var p1Score = 0;
var p2Score = 0;
var gameOver = false;
var winningScore =5;
var nickOne = document.querySelector("#nickOne");
var nickTwo = document.querySelector("#nickTwo");
var nickOneButton = document.querySelector("#setNickOne");
var nickTwoButton = document.querySelector("#setNickTwo"); 
var nickOneVal = document.querySelector("#playerOneNick");
var nickTwoVal = document.querySelector("#playerTwoNick");

nickOneButton.addEventListener("click", function() {
 nickOneVal.textContent = nickOne.value;
 playerOneButton.textContent = nickOne.value;
});

nickTwoButton.addEventListener("click", function() {
    nickTwoVal.textContent = nickTwo.value;
    playerTwoButton.textContent = nickTwo.value;
});



playerOneButton.addEventListener("click", function() {
 
if(!gameOver) {
    p1Score++;
    if(p1Score === winningScore) {
        gameOver = true;
         p1.classList.add("text-success");
         
     }
       p1.textContent =p1Score;
 }
 
 
});

playerTwoButton.addEventListener("click", function() {
   
    if(!gameOver) {
        p2Score++;
        if(p2Score === winningScore) {
            gameOver = true;
            p2.classList.add("text-success");
             
         }
           p2.textContent =p2Score;
     }
});

reset.addEventListener("click", function() {
    p1Score = 0;
    p2Score = 0;
    gameOver = false;
    p2.textContent = p2Score;
    p1.classList.remove("text-success");
    p1.textContent = p1Score;
    p2.classList.remove("text-success");
    playerOneButton.textContent="Player One";
    playerTwoButton.textContent="Player Two";
    nickOneVal.textContent="Player One";
    nickTwoVal.textContent="Player Two";
   
});


number.addEventListener("change", function() {
    score.textContent = number.value;
 winningScore = Number(number.value);
});