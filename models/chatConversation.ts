import {Schema, Model , model, Types} from 'mongoose';

export interface IConversation extends Document {
    participants: {
        seeker: Types.ObjectId;
        guide: Types.ObjectId;
    };
    status: 'active' | 'inactive';
    lastMessage: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>({
    participants: {
        seeker: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        guide: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
}, { timestamps: true });


conversationSchema.index({ 'participants.seeker': 1, 'participants.guide': 1 }, { unique: true });
export const Conversation: Model<IConversation> = model<IConversation>('Conversation', conversationSchema);