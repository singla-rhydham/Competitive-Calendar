import mongoose, { Document, Schema } from 'mongoose';

export interface IContest extends Document {
  id: string;        // unique contest id (platform + contest id)
  platform: string;  // Codeforces, LeetCode, AtCoder, CodeChef
  name: string;
  startTime: Date;
  endTime: Date;
  url: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContestSchema: Schema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['Codeforces', 'LeetCode', 'AtCoder', 'CodeChef']
  },
  name: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  url: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
ContestSchema.index({ startTime: 1 });
ContestSchema.index({ platform: 1 });

export default mongoose.model<IContest>('Contest', ContestSchema);
