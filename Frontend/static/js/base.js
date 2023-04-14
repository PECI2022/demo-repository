// login page


document.getElementById("formSignin").addEventListener("click", async function(event){
    event.preventDefault();

    // password check

    data = {
        username: document.querySelector("#formSigninUsername").value,
        password: document.querySelector("#formSigninPassword").value,
    }

    console.log(data)
    // make checks

    makeLogin(data.username, data.password)
});

document.getElementById("formSignup").addEventListener("click", async function(event){
    event.preventDefault()

    // password check
    password1 = document.querySelector("#formSignupPassword1").value
    password2 = document.querySelector("#formSignupPassword2").value
    console.log(password1, password2)
    if (password1!=password2) {
        alert("Passwords dont match");
        return;
    }

    data = {
        username: document.querySelector("#formSignupUsername").value,
        email: document.querySelector("#formSignupEmail").value,
        password: password1,
        roles: ["user"]
    }

    console.log(data)

    // TODO... Create tests to check values
    apiURL = window.location.origin.split(":")
    apiURL = apiURL[0] + ":" + apiURL[1] + ":8081/api/auth/signup"
    const response = await fetch(apiURL,{
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)
    })
    resData = await response.json()
    if (resData.message != 'User was registered successfully!') {
        alert(resData.message);
        return;
    }

    // login to get token
    makeLogin(data.username, data.password)
});

const makeLogin = async (username, password) => {
    data = {username, password}

    apiURL = window.location.origin.split(":")
    apiURL = apiURL[0] + ":" + apiURL[1] + ":8081/api/auth/signin"
    const response = await fetch(apiURL,{
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)
    })
    resData = await response.json();
    console.log(resData)
    if (resData.accessToken) {
        localStorage.setItem('x-access-token', resData.accessToken);
        window.location.href = "/html" // TODO change when implementing the static server
    } else {
        alert(resData.message)
    }
}

document.getElementById("registerBtn").addEventListener("click", function(){
    document.getElementById("tab-register").click();
});

// profile
window.onscroll = function() {scrollFunction()};

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

function deleteAccount() {
    // TODO, make an API request to delete the account from the backend
    window.location.href = "/";
    alert("Your account has been deleted.");
}