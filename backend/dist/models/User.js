import mongoose, { Schema } from 'mongoose';
const UserSchema = new Schema({
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
    }
}, {
    timestamps: true
});
export default mongoose.model('User', UserSchema);
//# sourceMappingURL=User.js.map