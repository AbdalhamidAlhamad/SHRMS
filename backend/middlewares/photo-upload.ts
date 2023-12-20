import multer from 'multer';
import path from 'path';

const photoStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/images'));
    },
    filename: function (req, file, cb) {
        if (file) {
            cb(null, `${new Date().toISOString().replace(/:/,"-")}-${file.originalname}`);
        } else {
            cb(new Error("File is not found"),"");
        }
    },


});


 const photoUpload = multer({
    storage: photoStorage,
    fileFilter(req, file, callback) {
        if(file.mimetype.startsWith('image')) {
            callback(null, true);
        } else {
            callback(new Error("Only images are allowed"));
        }
    },
    limits: {
        fileSize: 1024 * 1024 *2,
    }
 });

 export default photoUpload;