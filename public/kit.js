document.getElementById("kit-form").addEventListener("submit", async (e) =>{
    e.preventDefault();
    const objetive = document.getElementById("necesidades").files[0];
    const name = document.getElementById("name").value;
    const quantity = document.getElementById("quantity").value;
    const formData = new FormData();
    formData.append("name", name);
    formData.append("objetive", objetive);
    formData.append("quantity", quantity); 
    debugger;

    const res = await fetch("http://localhost:8000/kit/api/add",{
        method:"POST",
        headers:{
        },
        body: formData
            });
    if(res.ok){
        
        window.location.href = "/menu";
    }else{
        const favIcon = document.getElementById('dialog-error');
        debugger;
        const response = await res.json();
        favIcon.textContent = `There was an error during the creation: ${ response.error}`;
        favIcon.showModal();
    }
});

document.getElementById("HU-form").addEventListener("submit", async(e) =>{
    e.preventDefault();
    const nameHU = document.getElementById("nameHU").value;
    debugger;
    const description = document.getElementById("description").value;
    const imageUrl = document.getElementById("imageUrl").value;
    const res = await fetch("/kit/api/addHU",{
        method:"POST",
        headers:{
        "Content-Type":"application/json"
        },
        body: JSON.stringify({
            name: nameHU,
            description: description,
            imageUrl: imageUrl
        })
    });
    if(res.ok){
        location.reload();
    }else{

    }
})
    
