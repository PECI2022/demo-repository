const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)
const projectID = urlParams.get('id')

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
  data.append('description', JSON.stringify({ pid: projectID }))
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
  data.append('description', JSON.stringify({ pid: project_id }))
  let response = await fetch('http://127.0.0.1:5001/delete_project/' + projectID, {
    method: "POST",
    body: data
  })
  let a = await response.json()

  alert("Project Deleted! You will be redirected to MyProjects page!");
  window.location.href = '../../MyProjects'
}

async function updateCharacteristics() {
  // let data = new FormData()
  // data.append("id", JSON.stringify({ 'id': projectID }))
  // const response = await fetch('http://127.0.0.1:5001/average_characteristics', {
  //   method: "POST",
  //   body: data
  // });
  // let list = await response.json()
  // if (!list) return;


  let table = document.getElementById("tableCharacteristics");
  table.innerHTML = "";

  let i = {
    "contrast": 0,
    "brightness": 0,
    "sharpness": 0,
    "saturation": 0,
    "hue": 0,
  };

  let s = `
  <tr>
    <td class="characteristicName">Contrast:</td>
    <td>${i.contrast}</td>
    <td class="characteristicName">Brightness:</td>
    <td>${i.brightness}</td>
    <td class="characteristicName">Sharpness:</td>
    <td>${i.sharpness}</td>
    <td class="characteristicName">Saturation:</td>
    <td>${i.saturation}</td>
    <td class="characteristicName">Hue:</td>
    <td>${i.hue}</td>
  </tr>   
  `
  table.innerHTML = s;
}
updateCharacteristics();
