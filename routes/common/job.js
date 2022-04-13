const express = require('express');
const router = express.Router();

let isSignedIn = require('@middleware/isSignedIn');
const {isJobOwner} = require('@middleware/ownership');
const isUserVerified = require('@middleware/isUserVerified');

const {newJob, getJobById, getJobs, updateJob, deleteJob, completeJob, getProposalsByJobId, jobFeed} = require('@controllers/common/job');

const {validateNewJob, validateJobUpdate} = require('@middleware/validation/jobs');
const validateObjectId = require('@middleware/validation/objectId');


router.get('/', isSignedIn, getJobs);
// router.get('/feed', isSignedIn, jobFeed);
router.get('/:id', validateObjectId, getJobById);
router.post('/', isSignedIn, isUserVerified, validateNewJob, newJob);
router.put('/:id', validateObjectId, isSignedIn, isJobOwner, validateJobUpdate, updateJob);
router.put('/:id/completed', validateObjectId, isSignedIn, isJobOwner, completeJob);


router.delete('/:id', validateObjectId, isSignedIn, deleteJob);

// extended routes
router.get('/:id/proposals', validateObjectId, getProposalsByJobId);


module.exports = router;