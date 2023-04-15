const featuresList = document.querySelector("#features_list")
let category = "Feature"
var project_id = localStorage.getItem("project_id");




function newFeatureGo(pid) {
    // TODO, make an API request to delete the account from the backend
    // console.log(pid)
    localStorage.setItem("project_id", pid);
    window.location.href = "features?id=" + pid;
    // console.log(pid)
}



const create_feature = async () => {
    let data = new FormData()
    data.append('description', JSON.stringify({name: document.querySelector("#name").value, subject: document.querySelector("#description").value, model: document.querySelector("#model").value, category: category}))
    let response = await fetch('http://127.0.0.1:5001/new_feature', {
        method: "POST",
        body: data
    })
    let a = await response.json()
    // pid = a['result']
    alert("Feature Created! You will be redirected to the Features page!");
    newFeatureGo(a['result'])
}

const load_feature = async (pid) =>{
    newFeatureGo(pid)
    console.log("HERE")
}

function get_category(val){
    category = val
}

window.onload = function(){
    category = "Feature"
    load_content()
}

const load_content = async () => {
    const response = await fetch('http://127.0.0.1:5001/list_features')
    let features = await response.json()
    console.log(features)
    for(let feature of features){
        let list = `<div class="col">
                        <div class="card h-100" onclick="newFeatureGo('${feature._id}')">
                            <div class="card-body">
                                <h3 class="card-title">${feature.name}</h3>
                                <p class="card-text">${feature.description}</p>
                            </div>
                            <div class="card-footer">
                                <small class="text-muted">Last updated: ${feature.update}</td>
                            </div>
                        </div>
                    </div>` 
        
        let newElem = document.createElement('div')
        newElem.innerHTML = list
        featuresList.appendChild(newElem)
    }
}

