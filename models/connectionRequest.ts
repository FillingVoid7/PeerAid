import {Schema,Document,model, Model, Types} from 'mongoose';

export interface IConnectionRequest extends Document {
    fromUser: Types.ObjectId; 
    toUser: Types.ObjectId;   
    status: 'pending' | 'accepted' | 'rejected'|'cancelled';
    message?: string;
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date; 
}

const ConnectionRequestSchema: Schema = new Schema({
    fromUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    toUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected','cancelled'], default: 'pending' },
    message: { type: String, maxlengh:500 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 7*24*60*60*1000) }     //7 days  
},{
    timestamps: true
});

ConnectionRequestSchema.index({ fromUser: 1, toUser:1},{
    unique:true , 
    partialFilterExpression : {status:'pending'} 
})

const ConnectionRequest: Model<IConnectionRequest> = model<IConnectionRequest>('ConnectionRequest', ConnectionRequestSchema);

export default ConnectionRequest;