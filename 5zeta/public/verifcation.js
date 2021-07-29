let username = document.getElementById("username");
let email = document.getElementById("email");
let usernameMessage = document.getElementById("usernameMessage");
let emailMesssage = document.getElementById("emailMessage");

username.addEventListener("keyup", function(event) {
    axios
        .get(`/api/username/verification?username=${event.target.value}`)
        .then((response) => {
            console.log(response.data)
            if(response.data){
               
                event.target.style.borderColor = "red";
                usernameMessage.innerText = "Już ktoś inny ma tą nazwę użytkownika";
                usernameMessage.style.color = "red"
            } else {
                event.target.style.borderColor = "green";
                usernameMessage.innerText = "Ta nazwa użytkownika jest wolna";
                usernameMessage.style.color = "green"
            }
        })
        .catch((err) => {
            const alert = document.createElement("div");
            alert.setAttribute("class", "alert alert-info");
            alert.innerText = err.message;
            event.target.appendChild(alert);
        })
})

email.addEventListener("keyup", function(event) {
    axios
        .get(`/api/email/verification?email=${event.target.value}`)
        .then((response) => {
            console.log(response.data)
            if(response.data){
                
                event.target.style.borderColor = "red";
                emailMessage.innerText = "Istnieje konto z tym emailem";
                emailMessage.style.color = "red"
            } else {
                event.target.style.borderColor = "green";
                emailMessage.innerText = "Ten email jest wolny";
                emailMessage.style.color = "green"
            }
        })
        .catch((err) => {
            const alert = document.createElement("div");
            alert.setAttribute("class", "alert alert-info");
            alert.innerText = err.message;
            event.target.value.appendChild(alert);
        })
})