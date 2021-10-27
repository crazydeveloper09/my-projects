$(".form-control").on('click', function(){
    $(".form-control").css({
        
        "box-shadow": "none"
    });
});
function changeInputs() {
    if(document.getElementById("employee").value === ''){
        document.getElementById("lastPdiv").style.display="block";
        document.getElementById("takenDiv").style.display="none";
        document.getElementById("taken").required = false;
        document.getElementById("lastP").required = true;
    } else {
        document.getElementById("lastPdiv").style.display="none";
        document.getElementById("takenDiv").style.display="block";
        document.getElementById("taken").required = true;
        document.getElementById("lastP").required = false;
    }
}

changeInputs();

document.getElementById("employee").addEventListener("change", () => {
    changeInputs();
})