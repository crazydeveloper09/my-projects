var squares = document.querySelectorAll(".square");
var numSquares = 6;
var colors = makeAnArray(numSquares);
var pickedColor;
var colorDisplay = document.getElementById("colorDisplay");
var bodyStyle = document.body.style.backgroundColor;
var score = document.getElementById("score");
colorDisplay.textContent = pickedColor;

var newColors = document.getElementById("new");
var header = document.getElementById("header");
var navButtons = document.querySelectorAll(".nav");


reset();

for(var i = 0; i < squares.length; i++) {
  squares[i].style.backgroundColor = colors[i];

    squares[i].addEventListener("click", function() {
        var clickedColor = this.style.backgroundColor;
  
      if(clickedColor===pickedColor) {
        changeColors(pickedColor);
          score.textContent = "Gratulacje! Zgadłeś jaki to kolor"; 
          header.style.backgroundColor = pickedColor;
          newColors.textContent = "Jeszcze raz?";
          
      } else {
          this.style.backgroundColor = bodyStyle;
          score.textContent = "Spróbuj ponownie";
      }
    });
}

function changeColors(color) {
    for(var i=0; i < squares.length; i++) {
        squares[i].style.backgroundColor = color;
    }
}
function reset() {
    

        colors = makeAnArray(numSquares);
        header.style.backgroundColor = "#007bff";
        pickedColor = pickColor();
        colorDisplay.textContent = pickedColor;
        newColors.textContent = "Nowe kolory";
        score.textContent = "";
        for(var i = 0; i < squares.length; i++){
            if(colors[i]){
                squares[i].style.display = "block"
                squares[i].style.background = colors[i];
            } else {
                squares[i].style.display = "none";
            }
        }

     
}

newColors.addEventListener("click", function() {
    reset();
});
    

function pickColor(){
	var random = Math.floor(Math.random() * colors.length);
	return colors[random];
}

for(var j = 0; j < navButtons.length; j++) {
    navButtons[j].addEventListener("mouseover", function() {
        this.style.backgroundColor = "#007bff";
        this.style.color = "white";
    });
    navButtons[j].addEventListener("mouseout", function() {
        this.style.backgroundColor = "white";
        this.style.color = "black";
    });
    navButtons[j].addEventListener("click", function() {
        this.textContent === "Łatwe" ? numSquares = 3: numSquares = 6;
		reset();
    });

}   

function makeAnArray(num) {
    var arr = [];
    for(var i=0; i< num; i++) {
        arr.push(randomColor());
    }
    return arr;
    
}

function randomColor() {
    var x = Math.floor(Math.random() *256);
    var y = Math.floor(Math.random() *256);
    var z = Math.floor(Math.random() *256);
    return "rgb(" + x + ", " + y + ", " + z + ")";
}