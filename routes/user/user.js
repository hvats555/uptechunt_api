const express = require('express');
let router = express.Router();

const {isUserOwner} = require('@middleware/ownership');
const isSignedIn = require('@middleware/isSignedIn');
let isAdmin = require('@middleware/isAdmin');

const validateObjectId = require('@middleware/validation/objectId');
const {validateUserUpdate, validateEmailUpdate, validatePhoneUpdate} = require('@middleware/validation/user');

const {allUsers, userInfo, updateUser, deleteUserById, userInfoById, getClientByUserId, getFreelancerByUserId, uploadProfilePicture, deleteProfilePicture, updateEmail, updatePhone} = require('@controllers/user/user');

const setUploadOptions = require('@middleware/setUploadOptions');
const {upload} = require('@middleware/upload');

const uploadOptions = {
    uploadFolderPath: 'images',
    uploadFileType: 'image'
}

router.get('/', isSignedIn, userInfo);
router.get('/all', isSignedIn, isAdmin, allUsers); 

router.put('/profile-picture', isSignedIn, setUploadOptions(uploadOptions), upload.single('image'), uploadProfilePicture);

// router.delete('/profile-picture', isSignedIn, deleteProfilePicture);
router.delete('/profile-picture', deleteProfilePicture);

router.get('/:id', validateObjectId, isSignedIn, userInfoById); 
router.put('/', isSignedIn, validateUserUpdate, updateUser);
router.put('/email', validateEmailUpdate, isSignedIn, updateEmail);
router.put('/phone', validatePhoneUpdate, isSignedIn, updatePhone);

router.delete('/:id', validateObjectId, isSignedIn, isUserOwner, deleteUserById);

// Get Client by User Id
router.get('/:id/client', validateObjectId, isSignedIn, getClientByUserId);
// Get Freelancer by User Id
router.get('/:id/freelancer', validateObjectId, isSignedIn, getFreelancerByUserId);

module.exports = router;