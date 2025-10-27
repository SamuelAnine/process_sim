import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
    {
        username: {
            type: String,
            unique: [true, 'This username is already taken'],
            required: [true, 'Username is required'],
            trim: true,
            max: 32,
            lowercase: true,
        },
        name: {
            type: String,
            trim: true,
            max: 32,
        },
        email: {
            type: String,
            unique: [true, 'This email is already taken'],
            required: [true, 'Email is required'],
            trim: true,
            lowercase: true,
            index: true
        },
        profile: {
            type: String,
            required: true,
        },
        xurl: {
            type: String,
            default: ''
        },
        role: {
            type: Number,
            default: 0,
        },
        roledesc: {
            type: String
        },
        opone: {
            type: Number,
            default: 0,
        },
        optwo: {
            type: Number,
            default: 0,
        },
        opthree: {
            type: Number,
            default: 0,
        },
        opfour: {
            type: Number,
            default: 0,
        },
        opfive: {
            type: String,
            default: '',
        },
        opsix: {
            type: String,
            default: '',
        },
        opseven: {
            type: String,
            default: '',
        },
        opeight: {
            type: String,
            default: '',
        },
        about: {
            type: String,
        },
        remark: {
            type: String,
        },
        photo: {
            data: Buffer,
            contentType: String,
        },
        salt: String,
        hashed_password: {
            type: String,
            required: true,
        },
        resetPasswordLink: {
            data: String,
        },
    },
    {timestamps: true},
);

const User = models.User || model('User', UserSchema);

export default User;