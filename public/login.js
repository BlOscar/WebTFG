document.getElementById("login-form").addEventListener("submit",async (e)=>{
    e.preventDefault();

    const email = document.getElementById('email').value;
    debugger;

    const password = document.getElementById('password').value;
    const res = await fetch("http://localhost:8000/api/login",{
        method:"POST",
        headers:{
        "Content-Type":"application/json"
        },
        body: JSON.stringify({
            email,
            password
        })
    }).then(res => res.json())
    .then(jsonContent =>{
        if(jsonContent.tokenId){
            localStorage.setItem('tokenId',jsonContent.tokenId);
            console.log(jsonContent.message);
            window.location.href = "/home";
        }

    });
})

