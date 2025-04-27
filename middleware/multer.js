const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination : 'uploads/',
    filename: (req,file,cb)=>{
        const format = file.originalname.replaceAll(' ', '');
        cb(null,Date.now() + format);
    }
    
})
const upload = multer({
    storage,limits: {
        fileSize: 20 * 1024 * 1024 //20MBytes * 1024MB/1B * 1024bits/1B
    }
});
module.exports = upload;