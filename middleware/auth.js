const jwt = require('jsonwebtoken');

const validateToken = (req,res,next)=>{
    const token = req.cookies?.token;
    if(!token){
        return res.status(403).send();
    }
    const decoded = jwt.verify(token.split(' ')[1], 'secret');
    req.user = decoded;
    next();
};
module.exports = validateToken;
