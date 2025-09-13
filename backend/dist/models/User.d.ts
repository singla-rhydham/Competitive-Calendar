import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    googleId: string;
    email: string;
    name: string;
    picture?: string;
    accessToken?: string;
    refreshToken?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=User.d.ts.map