window.addEventListener('load', () => {
    const queryString2 = window.location.search
    const urlParams2 = new URLSearchParams(queryString2)
    const projectID2 = urlParams2.get('id')
    load_info(projectID2)
})
  
const load_info = async () => {
  console.log("EOEOEO")
  let data = new FormData()
  let projectTitle = document.querySelector("#project_title")
  let projectDescription = document.querySelector("#projectDescription")
  data.append('description', JSON.stringify({pid: projectID}))
  let response = await fetch('http://127.0.0.1:5001/load_info', {
    method: "POST",
    body: data
  })
  let info = await response.json()
  console.log(info)
  projectTitle.innerHTML = info["name"]
  projectDescription.innerHTML = info["description"]
}

function addTag(event) {
  event.preventDefault();
  var tagInput = document.getElementById("newTagInput");
  var tags = document.getElementById("tags");
  var tag = tagInput.value;
  if (tag) {
    tags.innerHTML += "#" + tag + "<br>";
    tagInput.value = "";
  }
}

var project_id = localStorage.getItem("project_id");
console.log(project_id);
// get project id
const delete_project = async () => {
  let data = new FormData()
  // send project id
  data.append('description', JSON.stringify({pid: project_id}))   
  let response = await fetch('http://127.0.0.1:5001/delete_project/' + projectID, {
      method: "POST",
      body: data
  })
  let a = await response.json()

  alert("Project Deleted! You will be redirected to MyProjects page!");
  window.location.href = '../../MyProjects'
}