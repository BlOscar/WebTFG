const { Team } = require("../Models/Team");
const { Turn } = require("../Models/Turn");
const { User } = require("../Models/User");

let connectedUsers = [];

exports.setUpIo = function(io){
    io.on('connection', (socket)=>{
        console.log('Se ha conectado un usuario', socket.id);

        socket.on('login', (data)=>{
            socket.idUser = data.id;
            socket.role = data.role;
            let temp = connectedUsers.find(i=>i.idUser === socket.idUser);
            if(temp){
                const index = connectedUsers.indexOf(temp);
                connectedUsers.splice(index,1);
                connectedUsers.push(socket);

            }else{
            if(data.role === 'alumno' || data.role === 'profesor'){
                connectedUsers.push(socket);
                socket.emit('logged', {id: socket.id});
            }else{
                console.log('Intento de acceso: ', socket.id);
            }
        }
        });
            socket.on('disconnect', ()=>{
            console.log('Socket desconectado:', socket.id);
            let socketDisconnect = connectedUsers.find(i=>i.id === socket.id);
            if(socketDisconnect){
            const index = connectedUsers.indexOf(socketDisconnect);
            connectedUsers.splice(index,1);
            socketDisconnect.id = '';
            connectedUsers.push(socketDisconnect);
            }

        });
        
    });
}

exports.startActivityIO = async function(idTurn){
    const turn = await Turn.findOne({where: {id: idTurn}, include: {model: Team, required: true, include: {model: User, require: true}}});
    const teams = turn.teams;
    
    for(let i = 0; i<teams.length; i++){
        const users = teams[i].users;
        const roomName = `room-${turn.name}-${teams[i].name}`;
        users.forEach(user =>{
            const userConnected = connectedUsers.find(j=>j.idUser === user.id);
            userConnected.join(roomName);
            userConnected.emit('startActivity', {room: roomName, turnid: turn.id});
        })
    }
}

exports.continueActivity = async function(idTurn){
    const turn = await Turn.findOne({where: {id: idTurn}, include: {model: Team, required: true, include: {model: User, require: true}}});
    const teams = turn.teams;
    
    for(let i = 0; i<teams.length; i++){
        const users = teams[i].users;
        users.forEach(user =>{
            const userConnected = connectedUsers.find(j=>j.idUser === user.id);
            userConnected.emit('continueActivity', {turnid: turn.id});
        })
    }
}