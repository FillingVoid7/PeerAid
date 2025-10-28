import {Schema, model} from 'mongoose';

const UserSchema = new Schema({
    email: {type: String, unique: true, required: true},
    alias: {type: String, unique: true, required: true},
}, {
    timestamps: true
});

export const User = model("User", UserSchema);