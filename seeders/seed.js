require("dotenv").config();

const mongoose = require("mongoose");
const faker = require("faker");
const _ = require("lodash");
const Skill = require("../models/Skill");
const User = require("../models/User");
const SkillCategory = require("../models/SkillCategory");
const skillsList = require("./skills");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Client = require("../models/Client");
const Freelancer = require("../models/Freelancer");
const ClientReview = require("../models/ClientReview");
const FreelancerReview = require("../models/FreelancerReview");
const bcrypt = require("bcrypt");
const Job = require("../models/Job");
var { DateTime } = require("luxon");

const DATABASE_URI = "mongodb://127.0.0.1:27017/GetIndiaWork";
// const DATABASE_URI="mongodb+srv://himalayavats:hvats555@get-india-work.qnbkg.mongodb.net/getIndiaWork?retryWrites=true&w=majority"

const database = async () => {
  await mongoose.connect(DATABASE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });
};

const seedSkills = async () => {
  // create skills and skill category
  console.log("Seeding skills... 🚀");

  skillsList.forEach(async (el) => {
    console.log(`Seeding parent category ${el.category}... 👪`);

    let skillCategory = new SkillCategory({
      title: el.category,
      description: faker.lorem.sentence(),
      image: faker.image.imageUrl(),
    });

    skillCategory = await skillCategory.save();

    el.skills.forEach(async (skill) => {
      console.log(`Skill created ${skill}... 🤹`);

      let s = new Skill({
        title: skill,
        description: faker.lorem.sentence(),
        skillCategory: skillCategory._id,
      });

      s.save();
    });
  });

  console.log("Skill seeding completed ✅");

  return new Promise((resolve, reject) => {
    resolve();
  });
};

const seedUsers = async (numberOfUsers) => {
  console.log("Seeding users...");
  let skills = [];
  const skill = await Skill.find({});

  skill.forEach((s) => {
    skills.push({
      skillId: s._id,
      skillCategoryId: s.skillCategory,
    });
  });

  for (let i = 0; i < numberOfUsers; i++) {
    let selectedSkills = [];
    let selectedSkillCategoryIds = [];
    let selectedSkillIds = [];

    for (let i = 0; i < Math.floor(Math.random() * 15) + 5; i++) {
      selectedSkills.push(_.sample(skills));
    }

    selectedSkills.forEach((s) => {
      selectedSkillCategoryIds.push(s.skillCategoryId.toString());
      selectedSkillIds.push(s.skillId.toString());
    });

    let firstName = faker.name.firstName();
    let lastName = faker.name.lastName();
    let email = faker.internet.email(firstName, lastName).toLowerCase();

    let user = new User({
      profilePicture: faker.image.avatar(),
      firstName: firstName,
      lastName: lastName,
      country: faker.address.country(),
      email: email,
      phone: "7668831421",
      countryCode: "91",
      password: "12345",
      isEmailVerified: true,
      isPhoneVerified: true,
      isAdmin: true,
    });

    try {
      user = await user.save();
    } catch (err) {
      console.log("❗ Duplicate email found, continueing...");
      continue;
    }

    console.log(user._id);

    let freelancer = new Freelancer({
      user: user._id,
      language: ["English"],
      skills: selectedSkillIds,
      headline: faker.lorem.sentence(50),
      profileDescription: faker.lorem.sentence(50),
      isProfileApproved: true,
      mainSkillCategory: _.sample(selectedSkillCategoryIds),
      skillCategories: _.uniq(selectedSkillCategoryIds),
    });

    freelancer.subscription = {
      plan: "starter",
      remainingProposalCount: 25,
      nextFreeProposalCredit: DateTime.now()
        .plus({ months: 1 })
        .toFormat("dd-MM-yyyy"),
    };

    freelancer = await freelancer.save().catch((err) => {
      if (err) {
        console.log("error");
      }
    });

    let client = new Client({ user: user._id });
    client = await client.save();

    user.roles.client = client._id;
    user.roles.freelancer = freelancer._id;

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash("12345", salt);

    await stripe.customers
      .create({
        name: `${user.firstName} ${user.lastName}`,
        phone: user.phone,
        email: user.email,
        metadata: {
          user: user._id.toString(),
        },
        description: `${user.firstName} ${user.lastName} SEEDED customer:- automaticallu created using seeding`,

        address: {
          country: user.country,
        },
      })
      .then((customer) => {
        user.stripeId = customer.id;
      })
      .catch((err) => {
        console.log(err);
      });

    await user.save();

    console.log(`User created: ${firstName} ${lastName} : ${email} 🧒`);
  }

  console.log("User seeding completed ✅");
  return new Promise((resolve, reject) => {
    resolve();
  });
};

// job post from client

const seedJobs = async (numberOfJobs) => {
  console.log("Seeding jobs...");
  const skill = await Skill.find({});
  const client = await Client.find({});

  const expertiseLevel = ["entrylevel", "intermediate", "expert"];

  let skills = [];

  skill.forEach((s) => {
    skills.push({
      skillId: s._id,
      skillCategoryId: s.skillCategory,
    });
  });

  for (let i = 0; i < numberOfJobs; i++) {
    let selectedSkills = [];
    let selectedSkillCategoryIds = [];
    let selectedSkillIds = [];
    let attachments = [];

    for (let i = 0; i < Math.floor(Math.random() * 10) + 1; i++) {
      selectedSkills.push(_.sample(skills));
    }

    selectedSkills.forEach((s) => {
      selectedSkillCategoryIds.push(s.skillCategoryId.toString());
      selectedSkillIds.push(s.skillId.toString());
    });

    for (let i = 0; i < Math.floor(Math.random() * 5) + 1; i++) {
      attachments.push(faker.image.business());
    }

    let title = faker.hacker.phrase();

    let job = new Job({
      client: _.sample(client)._id,
      title: title,
      description: faker.lorem.sentences(35),
      status: "open",
      amount: faker.datatype.number(500),
      duration: faker.datatype.number(12),
      expertiseLevel: _.sample(expertiseLevel),
      skills: selectedSkillIds,
      skillCategories: _.uniq(selectedSkillCategoryIds),
      attachments: attachments,
    });

    job = await job.save();

    await Client.findByIdAndUpdate(_.sample(client)._id, {
      $push: { jobs: job._id },
    });
    console.log(`Job created: ${title} 💼`);
  }
  console.log("Jobs seeding completed ✅");

  return new Promise((resolve, reject) => {
    resolve();
  });
};

const seedClientReviews = async () => {
  const client = await Client.find({});
  const freelancer = await Freelancer.find({});

  client.forEach(async (c) => {
    let sampledFreelancer = _.sample(freelancer);
    let user = await User.findById(sampledFreelancer.user);

    const reviewBody = {
      client: c._id,

      author: {
        id: sampledFreelancer._id,
        name: user.firstName,
      },

      body: faker.lorem.sentences(35),
      rating: faker.datatype.number(5),
    };

    let clientReview = new ClientReview(reviewBody);
    await clientReview.save();
    console.log("Client review saved 📝");
  });

  return new Promise((resolve, reject) => {
    resolve();
  });
};

const seedFreelancerReviews = async () => {
  const client = await Client.find({});
  const freelancer = await Freelancer.find({});

  client.forEach(async (f) => {
    let sampledClient = _.sample(client);
    let user = await User.findById(sampledClient.user);

    const reviewBody = {
      freelancer: f._id,

      author: {
        id: sampledClient._id,
        name: user.firstName,
      },

      body: faker.lorem.sentences(35),
      rating: faker.datatype.number(5),
    };

    let freelancerReview = new FreelancerReview(reviewBody);
    await freelancerReview.save();
    console.log("Freelancer review saved 📝");
  });

  return new Promise((resolve, reject) => {
    resolve();
  });
};

const main = async () => {
  database();

  // await seedSkills()
  await seedUsers(1000);
  // await seedJobs(10000);
  // await seedFreelancerReviews();
  // await seedClientReviews();
  // Other data like contracts, proposals can be added from the application itself.
};

main();
