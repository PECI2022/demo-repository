// login page

document.getElementById("formSignin").addEventListener("click", async function(event){
    event.preventDefault();

    // password check

    password = document.querySelector("#formSigninPassword").value

    if (password.length < 6 && password.length > 0) {
        alert("Password must be at least 6 characters");
        return;
    }

    data = {
        username: document.querySelector("#formSigninUsername").value,
        password: document.querySelector("#formSigninPassword").value,
    }

    // if inputs are empty
    if (document.querySelector("#formSigninUsername").value.length == 0 || document.querySelector("#formSigninPassword").value.length == 0) {
        alert("Please fill in all the fields");
        return;
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
        alert("Passwords do not match!");
        return;
    }

    
    if (password1.length < 6 && password1.length > 0 || password2.length < 6 && password2.length > 0) {
        alert("Password must be at least 6 digits long!");
        return;
    }

    // if the input fields are empty
    if (document.querySelector("#formSignupUsername").value.length == 0 || document.querySelector("#formSignupEmail").value.length == 0 || document.querySelector("#formSignupPassword1").value.length == 0 || document.querySelector("#formSignupPassword2").value.length == 0) {
        alert("Please fill in all the fields!");
        return;
    }

  
    // TODO... Create tests to check values
    // apiURL = window.location.origin.split(":")
    // apiURL = apiURL[0] + ":" + apiURL[1] + ":5001/api/auth/signup"
    // const response = await fetch(apiURL,{
    //     method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)
    // })
    // resData = await response.json()
    // if (resData.message != 'User was registered successfully!') {
    //     alert(resData.message);
    //     return;
    // }

    const data = {
        username: document.querySelector("#formSignupUsername").value,
        email: document.querySelector("#formSignupEmail").value,
        password: password1,
        roles: ["user"]
    };

    console.log(data)
    
    fetch('/api/auth/signup', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        document.getElementById("tab-signin").click();
    })
    .catch(error => {
        console.error('Error registering user:', error);
    });
    

    // login to get token
   // makeLogin(data.username, data.password)
});

const makeLogin = async (username, password) => {
    data = {username, password}

    apiURL = window.location.origin.split(":")
    apiURL = apiURL[0] + ":" + apiURL[1] + "/api/auth/signin"

    const response = await fetch(apiURL,{
        method: 'POST', 
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify(data)
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

