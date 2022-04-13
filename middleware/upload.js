const multerS3 = require('multer-s3')
const aws = require("aws-sdk")
const multer = require("multer")
require('dotenv').config()

// aws credentials 
aws.config.update({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// s3 instance
const s3 = new aws.S3(); 

// upload function
exports.upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.AWS_BUCKETNAME,
      acl : "public-read",
      metadata: function (req, file, cb) {
        cb(null, {fieldName: file.fieldname});
      },
      key: function (req, file, cb) {
        const fileName = `${req.uploadOptions.uploadFolderPath}/${Date.now().toString()}.${file.originalname.split('.')[1]}`;
        cb(null, fileName);
      }
    }),

    fileFilter: (req, file, cb) => {
      if(req.uploadOptions.uploadFileType === 'image') {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
          cb(null, true);
        } else {
          cb(null, false);
          return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
      } else if(req.uploadOptions.uploadFileType === 'documents'){
          if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype == "application/pdf") {
            cb(null, true);
          } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg and .pdf format allowed!'));
          }
      }
    }
  });

exports.deleteFile = (key, callback) => {
  const params = {Bucket: process.env.AWS_BUCKETNAME, Key: key};
  s3.deleteObject(params, function (err, data) {
    if(err) {
      return callback({'status': false});
    } else {
      return callback({'status': true});
    }
  });
}
