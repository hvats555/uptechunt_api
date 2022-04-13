const express = require('express');
let router = express.Router();

const isSignedIn = require('@middleware/isSignedIn');

const setUploadOptions = require('@middleware/setUploadOptions');
const { uploadFiles } = require('@controllers/common/upload');

const { upload } = require('@middleware/upload');

const uploadOptions = {
    uploadFolderPath: 'images',
    uploadFileType: 'documents'
}

router.post('/', isSignedIn, setUploadOptions(uploadOptions), upload.array('files', 10), uploadFiles); 

module.exports = router;