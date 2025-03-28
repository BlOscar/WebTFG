document.getElementById("login-form").addEventListener("submit",async (e)=>{
    e.preventDefault();

    const email = document.getElementById('email').value;
    debugger;

    const password = document.getElementById('password').value;
    const res = await fetch("http://localhost:8000/users/api/login",{
        method:"POST",
        headers:{
        "Content-Type":"application/json"
        },
        body: JSON.stringify({
            email,
            password
        })
    });
if(res.ok){
window.location.href = "/home";  }
})

