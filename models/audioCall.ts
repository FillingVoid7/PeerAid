import {Schema, Model, model, Types, Document} from 'mongoose';

export type CallStatus = 'initiated' | 'ringing' | 'ongoing' | 'completed' | 'rejected' | 'missed' | 'failed' ; 

export interface IAudioCall extends Document {
    callId: string; 
    conversationId: Types.ObjectId;
    initiator: Types.ObjectId;
    receiver: Types.ObjectId;
    status: CallStatus;
    startedAt?: Date;
    endedAt?: Date;
    duration?: number;
    initiatorSignal?: any ; //webRTC offer
    receiverSignal?: any ; //webRTC answer
    iceCandidates: any[]; //webRTC ICE candidates exchange
    createdAt: Date;
    updatedAt: Date;
}

const audioCallSchema = new Schema<IAudioCall>({
    callId: { type: String, required: true, unique: true },
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    initiator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['initiated', 'ringing', 'ongoing', 'completed', 'rejected', 'missed', 'failed'], default: 'initiated' },
    startedAt: { type: Date , default: Date.now },
    endedAt: { type: Date },
    duration: { type: Number },
    initiatorSignal: { type: Schema.Types.Mixed },
    receiverSignal: { type: Schema.Types.Mixed },
    iceCandidates: [{ 
        candidate: Schema.Types.Mixed,
        sdpMid: String,
        sdpMLineIndex: Number,
        usernameFragment: String
    }],
}, { timestamps: true });

export const AudioCall: Model<IAudioCall> = model<IAudioCall>('AudioCall', audioCallSchema);
