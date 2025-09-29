import {Schema,Document,model, Model, Types} from 'mongoose';

export interface IConnectionRequest extends Document {
    fromUser: Types.ObjectId; // Seeker
    toUser: Types.ObjectId;   // Guide
    status: 'pending' | 'accepted' | 'rejected'|'cancelled';

    message?: string;
    sharedSymptoms?: string[];  //auto-populated from matching algorithm
    matchScore: number;       //calculated match percentage 

    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date; //  auto-reject after 7 days 

}

const ConnectionRequestSchema: Schema = new Schema({
    fromUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    toUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected','cancelled'], default: 'pending' },
    message: { type: String, maxlengh:500 },
    sharedSymptoms: [{ type: String }],
    matchScore: { type: Number, min:0, max:1},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 7*24*60*60*1000) } // 7 days from creation
},{
    timestamps: true
});

ConnectionRequestSchema.index({ fromUser: 1, toUser:1},{
    unique:true , 
    partialFilterExpression : {status:'pending'} 
})

const ConnectionRequest: Model<IConnectionRequest> = model<IConnectionRequest>('ConnectionRequest', ConnectionRequestSchema);

export default ConnectionRequest;