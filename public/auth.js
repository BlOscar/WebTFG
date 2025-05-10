async function verify() {
    const token = localStorage.getItem('tokenId');
const res = await fetch("http://localhost:8000/api/verify-token",{
    method:"POST",
    headers:{
    "Content-Type":"application/json"
    },
    body: JSON.stringify({
        tokenId: token
        })
        });
if(!res.ok){
    window.location.href = "/login";
}
}
verify();
