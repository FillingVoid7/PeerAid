import {Schema,model,models} from 'mongoose';

const UserSchema = new Schema({
    email:{type:String, unique:true , required:true},
    alias:{type:String, unique:true, required:true},
});

export default models.User || model("User",UserSchema);