document.getElementById("kit-form").addEventListener("submit", async (e) =>{
    e.preventDefault();
    const id = document.getElementById("necesidades").value;
    const formData = new FormData(e.target);
    const huList = formData.getAll('huList[]');
    const nameCaja = document.getElementById("nameCaja").value;
    const idProduct = document.getElementById("idProduct").value;
    const name = document.getElementById("name").value;
    const prueba = JSON.parse(JSON.stringify(huList));
    const res = await fetch("http://localhost:8000/kits/api/add",{
        method:"POST",
        headers:{
        "Content-Type":"application/json"
        },
        body: JSON.stringify({
            name: name,
            teacherName: "patata",
            objetive: id,
            HUList: prueba,
            nameBox: nameCaja,
            idProduct: idProduct
            })
            });
    if(res.ok){
        
        window.location.href = "/home";
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
    const res = await fetch("/kits/api/addHU",{
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
    
