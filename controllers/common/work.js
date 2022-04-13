const mongoose = require('mongoose');
const Freelancer = require('@models/Freelancer');
const Contract = require('@models/Contract');
const User = require('@models/User');
const Wallet = require('@models/Wallet');
const _ = require('lodash');
const error = require('@utils/error');

// get milestone id while submitting the work 

exports.submitWork = async (req, res) => {
    const { contractId, milestoneId, description, attachments } = req.body;

    if(!mongoose.Types.ObjectId.isValid(contractId)) return res.status(400).json(error(["invalid contract id"]));

    if(!mongoose.Types.ObjectId.isValid(milestoneId)) return res.status(400).json(error(["invalid milestone id"]));

    const checkContract = await Contract.findOne({milestones: {$elemMatch : {_id: milestoneId}}});
    if(!checkContract) return res.status(404).json(error(["no contract found with given milestone id"]));

    const freelancer = await Freelancer.findById(req.user.freelancer);
    
    if(!(freelancer._id.equals(checkContract.freelancer))) return res.status(401).json(error(["you are not authorized to perform this action"]));

    if(checkContract.status != 'active') return res.status(405).json("work can only be submitted on active contracts");

    // if(!checkContract.client.equals(req.user.client)) return res.status(401).json(error(["not authorized"]));

    let milestone = checkContract.milestones.find(milestone => milestone._id == milestoneId);

    if(milestone.status != 'active') return res.status(405).json(error(["work can only be submitted on active milestones"]));

    if(milestone.submittedWorkValue == milestone.amount) return res.status(405).json(error(["work is already submitted"]));

    const workBody = {
        amount: milestone.amount,
        description: description
    }

    if(attachments) workBody.attachments = attachments;

    const contract = await Contract.findOneAndUpdate(
        { _id: contractId, "milestones._id": milestoneId },
        {
            $set: { "milestones.$.submittedWork": workBody },
            $inc: { "milestones.$.submittedWorkValue": milestone.amount }
        }, {new: true}
    );

    const updatedMilestone = contract.milestones.find(milestone => milestone._id == milestoneId);


    res.json({
        message: "Work succesfully submitted",
        response: updatedMilestone.submittedWork
    });
}

exports.setWorkStatus = async (req, res) => {
    const user = await User.findById(req.user._id);
    if(!user) return res.status(404).json({"error": "user not available"});

    const checkContract = await Contract.findOne({
        milestones: {
            $elemMatch : {
                "submittedWork._id": req.params.id
            }
        }
    });

    if(!checkContract) return res.status(404).json(error(["no contract found with given milestone id"]));

    if(!(checkContract.client.equals(req.user.client))) return res.status(401).json(error(["unauthorised"]));

    let milestone = checkContract.milestones.find(milestone => milestone.submittedWork._id == req.params.id);

    let work = milestone.submittedWork;

    // if(work.status === 'approved') return res.status(405).json(error(["work is already approved, cannot change the status"]));

    if(req.params.action == 'approved') {
        work.status = 'approved';
    } else if(req.params.action == 'rejected') {
        work.status = 'rejected';
    } else {
        return res.status(400).json(error(["invalid work action, action can be either accept or reject"]));
    }

    let query = {
        $set: {
            "milestones.$.submittedWork": work
        }
    };

    
    if(work.status == "approved") {
        Object.assign(query.$set, {
            "milestones.$.fundReleasedAt": new Date().toISOString(),
            "milestones.$.status": "completed"
        });
    }

    const contract = await Contract.updateOne(
        { _id: checkContract._id, "milestones._id": milestone._id }, query
    );

    if(contract) {
        const wallet = await Wallet.updateOne({freelancer: checkContract.freelancer}, {
            $inc: { amount: milestone.amount },
            $push: {
                transaction: {
                    amount: milestone.amount,
                    type: 'credit', 
                    contract: checkContract._id,
                    milestone: milestone._id
                }
            }
        });

        if(!wallet) return res.status(500).json(error(["freelancer wallet update failed"]));
    }

    res.json({
        message:`Work ${work.status}`,
        response: work
    });
}

exports.updateWork = async (req, res) => {
    const user = await User.findById(req.user._id);
    if(!user) return res.status(404).json({"error": "user not available"});

    const contract = await Contract.findById({'submittedWork._id': req.params.id});

    // client cannot edit the submitted work
    if((user.roles.client.equals(contract.client))) return res.status(401).json(error(["current client id does not match with client id in contract, you are not authorized to perform this action"]));

    contract.submittedWork.find(work => {
        if(work._id.equals(req.params.id)) {
            if(work.status === 'approved' || work.status === 'paid') return res.status(405).json(error(["paid or approved work cannot be updated"]));

            if(req.body.message) {
                work.message = req.body.message
            }

            if(req.body.attachments) {
                // make sure to clean up the attachments upload.
                work.attachments = req.body.attachments        
            }

            work.status = 'pending'
        }
    });

    let response = {};
    response.response = contract.submittedWork;
    response.message = `Changed work status to ${req.params.action}`;
    res.json({
        response: contract.submittedWork,
        message: 'Work is updated, amount transferred to freelancer wallet'
    });
}