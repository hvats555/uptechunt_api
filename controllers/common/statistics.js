const Proposal = require('@models/Proposal');
const Job = require('@models/Job');
const FreelancerReview = require('@models/FreelancerReview');
const error = require('@utils/error');

exports.freelancerStatistics = async (req, res) => {
    if(!req.params.id) return res.status(400).json(error(["freelancer id not provided"]));

    // proposal stats
    let openProposals = await Proposal.find({'freelancer': req.params.id, 'status': 'open'}).countDocuments().exec()
    let interviewingProposals = await Proposal.find({'freelancer': req.params.id, 'status': 'interviewing'}).countDocuments().exec()

    let activeJobs = await Job.find({freelancer: req.params.id, status: 'ongoing'}).countDocuments().exec();
    let completedJobs = await Job.find({freelancer: req.params.id, status: 'completed'}).countDocuments().exec();

    let freelancerReview = await FreelancerReview.find({freelancer: req.params.id}).countDocuments().exec();

    let response = {
        proposals: {
            open: openProposals,
            interviewing: interviewingProposals
        },

        jobs: {
            activeJobs: activeJobs,
            completedJobs: completedJobs
        },

        review: {
            totalReviews: freelancerReview
        }
    }

    res.json({
        message: `statistics for freelancer ${req.params.id}`,
        response: response
    })
}

exports.clientStatistics = async (req, res) => {
    if(!req.params.id) return res.status(400).json(error(["client id not provided"]));

    // proposal stats
    let openJobs = await Job.find({client: req.params.id}).countDocuments().exec();
    let activeJobs = await Job.find({client: req.params.id, status: 'ongoing'}).countDocuments().exec();
    let completedJobs = await Job.find({client: req.params.id, status: 'completed'}).countDocuments().exec();

    let response = {
        jobs: {
            openJobs: openJobs,
            activeJobs: activeJobs,
            completedJobs: completedJobs
        }
    }

    res.json({
        message: `statistics for client ${req.params.id}`,
        response: response
    })
}