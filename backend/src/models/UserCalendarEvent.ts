import mongoose, { Document, Schema } from 'mongoose';

export interface IUserCalendarEvent extends Document {
  userId: mongoose.Types.ObjectId;
  contestId: mongoose.Types.ObjectId;
  contestKey: string; // stable contest.id for easier lookups
  googleEventId: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserCalendarEventSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  contestId: {
    type: Schema.Types.ObjectId,
    ref: 'Contest',
    required: true,
    index: true
  },
  contestKey: {
    type: String,
    required: true,
    index: true
  },
  googleEventId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Prevent duplicates per user per contest
UserCalendarEventSchema.index({ userId: 1, contestKey: 1 }, { unique: true });

export default mongoose.model<IUserCalendarEvent>('UserCalendarEvent', UserCalendarEventSchema);



