document.getElementById("kit-form").addEventListener("submit", async (e) =>{
    e.preventDefault();
    const id = document.getElementById("necesidades").value;
    const formData = new FormData(e.target);
    const huList = formData.getAll('patata[]');
    const prueba = JSON.parse(JSON.stringify(huList));
    const res = await fetch("http://localhost:8000/kits/api/add",{
        method:"POST",
        headers:{
        "Content-Type":"application/json"
        },
        body: JSON.stringify({
            adminCode: "patata",
            necesidades: id,
            HUList: prueba
            })
            });
    if(res.ok){
        window.location.href = "/home";
    }
})