const projectList = document.querySelector("#project_list");
let category = "Gestures";
let tags = [];
var project_id = localStorage.getItem("project_id");

function newProjectGo(pid) {
  // TODO, make an API request to delete the account from the backend
  localStorage.setItem("project_id", pid);
  window.location.href = "project/about/projectAbout?id=" + pid;

  const projectElem = document.getElementById(`project_${pid}`);
  if (projectElem) {
    projectElem.remove();
  }
}

const create_project = async () => {
  let data = new FormData();
  console.log(category);
  data.append(
    "description",
    JSON.stringify({
      name: document.querySelector("#name").value,
      subject: document.querySelector("#description").value,
      model: document.querySelector("#model").value,
      category: category,
      tags: tags,
    })
  );
  console.log(document.querySelector("#Category").value);
  let response = await fetch("http://127.0.0.1:5001/new_project", {
    method: "POST",
    body: data,
  });
  let a = await response.json();
  alert("Project Created! You will be redirected to the project page!");
  newProjectGo(a["result"]);
};

const load_project = async (pid) => {
  newProjectGo(pid);
  console.log("HERE");
};


const delete_project = async (project_id) => {
    let data = new FormData()
    // send project id
    data.append('description', JSON.stringify({pid: project_id}))   
    let response = await fetch('http://127.0.0.1:5001/delete_project/' + project_id, {
        method: "POST",
        body: data
    })
    let a = await response.json()
  
    alert("Project Deleted! You will be redirected to MyProjects page!");
    window.location.href = '/myProjects'
  }

window.onload = function () {
    category = "Gestures";
    addTag();
    load_content();
};

const load_content = async () => {
    const response = await fetch("http://127.0.0.1:5001/list_projects");
    let projects = await response.json();
    console.log(projects);
    for (let project of projects) {
      let list = `<div class="col" id="project_${project._id}">
                    <div class="card h-100" >
                      <div class="card-body" onclick="newProjectGo('${project._id}')">
                        <h3 class="card-title">${project.name}</h3>
                        <p class="card-text">${project.subject}</p>
                      </div>
                      <div class="card-footer">
                        <small class="text-muted">Last updated: ${
                          project.update
                        }</td>
                        <button type="button" onclick="delete_project('${project._id}')" class="btn btn-danger btn-sm float-end">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>`;
                  
      let newElem = document.createElement("div");
      newElem.innerHTML = list;
      projectList.appendChild(newElem);
    }
  };

  function addTag() {
    var tagInput = document.getElementById("newTagInput");
    var tags = document.getElementById("tags");
    var tag = tagInput.value;
    if (tag) {
      tags.innerHTML += "#" + tag + "<br>";
      tagInput.value = "";
    }
  }
