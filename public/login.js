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
        if(jsonContent.isTeacher){
            window.location.href = "/menu";
        }else{
            window.location.href = "/menuS";

        }

    });
})

