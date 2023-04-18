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