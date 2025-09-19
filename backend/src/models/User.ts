import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
  accessToken?: string;
  refreshToken?: string;
  subscribed: boolean;
  reminderPreference: string;
  platforms?: string[];
  platformColors?: Record<string, string>;
  timeZone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  picture: {
    type: String
  },
  accessToken: {
    type: String
  },
  refreshToken: {
    type: String
  },
  subscribed: {
    type: Boolean,
    default: false
  },
  reminderPreference: {
    type: String,
    default: '1h'
  },
  platforms: {
    type: [String],
    default: ['Codeforces', 'AtCoder', 'LeetCode', 'CodeChef']
  },
  platformColors: {
    type: Object,
    default: {
      Codeforces: '1',
      AtCoder: '4',
      LeetCode: '2',
      CodeChef: '6'
    }
  },
  timeZone: {
    type: String,
    default: 'Asia/Kolkata'
  }
}, {
  timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);
