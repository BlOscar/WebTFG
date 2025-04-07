document.getElementById("kit-form").addEventListener("submit", async (e) =>{
    e.preventDefault();
    const id = document.getElementById("necesidades").value;
    const formData = new FormData(e.target);
    const huList = formData.getAll('patata[]');
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
            adminCode: "patata",
            necesidades: id,
            HUList: prueba,
            nameCaja: nameCaja,
            idProduct: idProduct
            })
            });
    if(res.ok){
        
        window.location.href = "/home";
    }
});
