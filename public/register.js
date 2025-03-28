document.getElementById("register-form").addEventListener("submit",async (e)=>{
    e.preventDefault();

    const email = document.getElementById('email').value;
    const username = document.getElementById('username').value;
    const name = document.getElementById('name').value;
    const role = document.getElementById('role').value;
    const password = document.getElementById('password').value;
    const res = await fetch("http://localhost:8000/users/api/register",{
        method:"POST",
        headers:{
        "Content-Type":"application/json"
        },
        body: JSON.stringify({
            username,
            name,
            email,
            password,
            role
        })
    });
if(res.ok){
window.location.href = "/users/login";  }
});