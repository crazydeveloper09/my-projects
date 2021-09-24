


function changeCategory(categoryName){
    axios
    .get(`/api/category/${categoryName}`)
    .then((response) => {
        let categoriesBtns = document.getElementsByTagName("button");
        console.log(response.data.projects.length === 0)
        document.getElementById("cat_bigger").innerText = response.data.important;
        document.getElementById("cat_normal").innerText = response.data.info;
       
        if(response.data.projects.length === 0){
            const alert = document.createElement("div");
            alert.setAttribute("class", "alert alert-info");
            alert.innerText = `Nie posiadamy projektów w kategorii ${response.data.name}`;
            document.getElementById("projectsDiv").innerText = "";
            document.getElementById("projectsDiv").appendChild(alert);
        } else {
            document.getElementById("projectsDiv").innerText = "";
           
            response.data.projects.forEach((project) => {
                console.log(project)
                let imgWrap = document.createElement("div");
                let img = document.createElement("img");
                let imgDesc = document.createElement("div");
                let imgText = document.createElement("a");
                imgWrap.setAttribute("class", "col-lg-3 col-md-6 col-sm-12 img__wrap");
                img.setAttribute("src", project.brickPhoto);
                img.setAttribute("alt", project.title)
                img.setAttribute("class", "img-thumbnail");
                imgDesc.setAttribute("class", "img__description");
                imgText.setAttribute("href", `/projects/${project.subpageLink}`);
                imgText.innerText = project.title;
                imgText.style.color = "black";
                imgDesc.appendChild(imgText)
                imgWrap.appendChild(img)
                imgWrap.appendChild(imgDesc);
                document.getElementById("projectsDiv").appendChild(imgWrap);
                
            })
        }
        for( let i=0; i < categoriesBtns.length;i++) {
            if(categoriesBtns[i].innerText === categoryName.toUpperCase()){
                categoriesBtns[i].setAttribute("class", "here");
            } else {
                categoriesBtns[i].removeAttribute("class", "here");
            }
            console.log(categoriesBtns[i].innerText)
        }
        
        
        document.getElementById("cat_edit").setAttribute("href", `/projects/category/${response.data._id}/edit`); 
        document.getElementById("cat_delete").setAttribute("href", `/projects/category/${response.data._id}/delete`);
    })
    .catch((err) => {

    })
}

axios
    .get("/api/categories")
    .then((response) => {
        response.data.forEach((category) => {
            let btn = document.createElement("button");
            let br = document.createElement("br");
            btn.setAttribute("id", category._id);
            btn.innerText = category.name;
            btn.onclick = function change() {
                changeCategory(category.name);
                this.style.outline = "none";
            };
            
            document.getElementById("categoriesBtns").appendChild(btn);
            document.getElementById("categoriesBtns").appendChild(br);
        })
        document.getElementById("cat_bigger").innerText = response.data[0].important;
        document.getElementById("cat_normal").innerText = response.data[0].info;
        document.getElementById(response.data[0]._id).setAttribute("class", "here");
      
        if(response.data[0].projects.length === 0){
            const alert = document.createElement("div");
            alert.setAttribute("class", "alert alert-info");
            alert.innerText = `Nie posiadamy projektów w kategorii ${response.data[0].name}`;
            document.getElementById("projectsDiv").innerText = "";
            document.getElementById("projectsDiv").appendChild(alert);
        } else {
            document.getElementById("projectsDiv").innerText = "";
            response.data[0].projects.forEach((project) => {
                let imgWrap = document.createElement("div");
                let img = document.createElement("img");
                let imgDesc = document.createElement("div");
                let imgText = document.createElement("a");
                imgWrap.setAttribute("class", "col-lg-3 col-md-6 col-sm-12 img__wrap");
                img.setAttribute("src", project.brickPhoto);
                img.setAttribute("alt", project.title)
                img.setAttribute("class", "img-thumbnail");
                imgDesc.setAttribute("class", "img__description");
                imgText.setAttribute("href", `/projects/${project.subpageLink}`);
                imgText.innerText = project.title;
                imgText.style.color = "black";
                imgDesc.appendChild(imgText)
                imgWrap.appendChild(img)
                imgWrap.appendChild(imgDesc);
                document.getElementById("projectsDiv").appendChild(imgWrap);
                
            })
        }
        document.getElementById("cat_edit").setAttribute("href", `/projects/category/${response.data[0]._id}/edit`); 
        document.getElementById("cat_delete").setAttribute("href", `/projects/category/${response.data[0]._id}/delete`);
    })
    .catch((err) => {

    })

    