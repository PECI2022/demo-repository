const projectList = document.querySelector("#public_project_list");
console.log("EK")
// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function () { scrollFunction() };

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    document.getElementById("scrollBtn").style.display = "block";
  } else {
    document.getElementById("scrollBtn").style.display = "none";
  }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

//  function generateLink(element) {
//      const projectName = 'editor';
//      const formattedTitle = element.textContent.toLowerCase().replace(/\\s+/g, '-');
//      return `${projectName}?project=${formattedTitle}`;
//  }


//  function generateLinkAudio(element) {
//      const projectName = 'voice';
//      const formattedTitle = element.textContent.toLowerCase().replace(/\\s+/g, '-');
//      return `${projectName}?project=${formattedTitle}`;
//  }


//  const searchInput = document.querySelector('#ProjectsSearch input[type="search"]');

//  searchInput.addEventListener('input', function() {
//  const searchQuery = this.value.toLowerCase();

//  const projectCards = document.querySelectorAll('#ProjectsSearch .card');

//  projectCards.forEach(function(projectCard) {
//      const projectName = projectCard.querySelector('.card-title').textContent.toLowerCase();
//      const projectText = projectCard.querySelector('.card-text').textContent.toLowerCase();

//      if (projectName.includes(searchQuery) || projectText.includes(searchQuery)) {
//      projectCard.style.display = 'block';
//      } else {
//      projectCard.style.display = 'none';
//      }
//  });
//  });

function newProjectGo(pid) {
  // TODO, make an API request to delete the account from the backend
  localStorage.setItem("project_id", pid);
  window.location.href = "project/about/projectAbout?id=" + pid;

  const projectElem = document.getElementById(`project_${pid}`);
  if (projectElem) {
    projectElem.remove();
  }
}



console.log("WWW")
const list_projects = async () => {
  console.log("PROJECT LIST")
  const response = await fetch("http://127.0.0.1:5001/get_public_projects");
  let projects = await response.json()
  console.log(projects)


  for (let project of projects) {

    let list = `<div class="col" id="project_${project._id}">
                      <div class="card h-100" >
                        <div class="card-body" onclick="newProjectGo('${project._id}')">
                          <h3 class="card-title">${project.name}</h3>
                          <p class="card-text">${project.subject}</p>
                        </div>
                        <div class="card-footer">
                          <small class="text-muted">Last updated: ${project.update}</td>
                        </div>
                      </div>
                    </div>`;

    let newElem = document.createElement("div");
    newElem.innerHTML = list;
    projectList.appendChild(newElem);

    const searchInput = document.querySelector('[community-search]');

    searchInput.addEventListener('input', e => {
      inputValue = e.target.value.toLowerCase(); // assign the value inside the listener

      projectList.querySelectorAll('.card').forEach(card => {
        const title = card.querySelector('.card-title').textContent.toLowerCase();
        const text = card.querySelector('.card-text').textContent.toLowerCase();

        if (inputValue !== '') {
          if (title.includes(inputValue) || text.includes(inputValue)) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        } else {
          card.style.display = '';
        }
      }
      );
    });
  }
}; list_projects()