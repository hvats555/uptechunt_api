const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { Schema } = mongoose;
const { ObjectId } = mongoose.Schema;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minLength: 1,
      maxLength: 32,
    },

    lastName: {
      type: String,
      trim: true,
      minLength: 1,
      maxLength: 32,
    },

    country: {
      type: String,
      trim: true,
      minLength: 1,
      maxLength: 200,
      default: null,
    },

    address: {
      type: String,
      trim: true,
      minLength: 1,
      default: null,
    },

    city: {
      type: String,
      trim: true,
      minLength: 1,
      maxLength: 200,
      default: null,
    },

    pinCode: {
      type: String,
      trim: true,
      minLength: 1,
      default: null,
    },

    profilePicture: {
      // will store the profile picture URL
      type: String,
      trim: true,
      maxLength: 1000,
      default: " ", // TODO placeholder image URL will be here
    },

    email: {
      type: String,
      trim: true,
      maxLength: 100,
      required: true,
      unique: true,
    },

    isEmailVerified: {
      type: Boolean,
      trim: true,
      default: false,
    },

    isBanned: {
      type: Boolean,
      trim: true,
      default: false,
    },

    isPhoneVerified: {
      type: Boolean,
      trim: true,
      default: false,
    },

    isAdmin: {
      type: Boolean,
      trim: true,
      default: false,
    },

    phone: {
      type: String,
      trim: true,
      maxLength: 10,
      minLength: 10,
      sparse: true,
      default: null,
    },

    countryCode: {
      type: String,
      default: null,
    },

    password: {
      type: String,
      trim: true,
      maxLength: 100,
      required: true,
    },

    stripeId: {
      type: String,
    },
    
    fcmRegistrationToken: new Schema(
      {
        token: {
          type: String,
        },
      },
      { timestamps: true }
    ),

    signInHistory: [
      new Schema(
        {
          ip: {
            type: Object,
            required: true,
          },

          os: {
            type: String,
            required: true,
          },

          device: {
            type: String,
            required: true,
          },

          agent: {
            type: String,
            required: true,
          },
        },
        { timestamps: true }
      ),
    ],

    roles: {
      client: {
        type: ObjectId,
        ref: "Client",
      },

      freelancer: {
        type: ObjectId,
        ref: "Freelancer",
      },
    },

    signUpMethod: {
      type: String,
      enum: ["custom", "google", "facebook", "linkedin"],
    },

    pubnubUUID: {
      type: String,
      default: null
    },

    passwordResetToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.methods.generateAuthToken = function () {
  const payload = {
    _id: this._id,
    name: this.name,
    country: this.country,
    profilePicture: this.profilePicture,
    email: this.email,
    phone: this.phone,
    isEmailVerified: this.isEmailVerified,
    isPhoneVerified: this.isPhoneVerified,
    isAdmin: this.isAdmin,
    freelancer: this.roles.freelancer._id,
    client: this.roles.client._id,
  };
  // ! replace secret with secured random token
  const token = jwt.sign(payload, "Secret", { expiresIn: "7d" });
  return token;
};

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
