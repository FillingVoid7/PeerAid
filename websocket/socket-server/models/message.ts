import {Schema,Model, model, Types, Document} from 'mongoose';

export type MessageType = 'text'| 'image'| 'audio'| 'system' | 'audio_invite' | 'audio_accept' | 'audio_reject' ; 
export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface IMessage extends Document {
    conversationId: Types.ObjectId;
    sender: Types.ObjectId;
    type: MessageType; 
    content : string; 
    fileUrl? : string; 
    duration?: number; 
    status: MessageStatus;
    readBy: Types.ObjectId[];
    audioCallId?: string; 
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['text', 'image', 'audio', 'system', 'audio_invite', 'audio_accept', 'audio_reject'], required: true },
    content: { type:String, required:true },
    fileUrl: { type: String },
    duration: { type: Number },
    status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    audioCallId: { type: String },
}, { timestamps: true });

MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ sender: 1 });
MessageSchema.index({ 'readBy': 1 });

export const Message: Model<IMessage> = model<IMessage>('Message', MessageSchema);
