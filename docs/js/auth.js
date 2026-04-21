const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const roleSelect = document.getElementById("role");
const loginBtn = document.getElementById("login-btn");


const endpoints = {
    admin: 'https://management-boxers-faho.onrender.com/api/auth/admin/login',
    coach: 'https://management-boxers-faho.onrender.com/api/auth/coach/login',
    athlete: 'https://management-boxers-faho.onrender.com/api/auth/athlete/login'
};


loginBtn.addEventListener("click", async function() {
    
    const email = emailInput.value;
    const password = passwordInput.value;
    const role = roleSelect.value; 

    if(email === "" || password === "" || role === "") {
        alert("Please fill in all fields")
        return
    }

    const url = endpoints[role];

    try {
        console.log(url);
        const response = await fetch(url, {
            method : "POST",
            headers : {"Content-Type": "application/json"},
            body : JSON.stringify({email: email, password: password})
    });
    console.log('status is:', response.status);

    // case1 : wrong credentials
    if (response.status === 401) {
        alert("Invalid email or password");
        return;
    }

    
    // case 2: successful login
    if (response.status === 200) {
        const data = await response.json();
        localStorage.setItem('token', data.data.access_token);
        localStorage.setItem('role', role);

        if (role === 'admin') {
            window.location.href = 'admin/dashboard.html';
        } else if (role === 'coach') {
            window.location.href = 'coach/dashboard.html';
        } else if (role === 'athlete') {
            window.location.href = 'athlete/sessions.html';
        }
    }

    } catch (error) {
            alert('Something went wrong, please try again');
            console.log(error);
        }
});
