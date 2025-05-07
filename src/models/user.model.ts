import { Document, Schema, model } from "mongoose";

export interface IUser extends Document {
    avatar?: string;
    fullName: string;
    email?: string;
    password: string;
    mobileNumber: string;
    role: 'user' | 'admin' | 'work';
    isVerified: boolean;
    isDocumentVerified: boolean;
    verifyCode?: string;
    verifyCodeExpiry?: Date;
}

const userSchema = new Schema<IUser>({
    avatar: { 
        type: String, 
        required: false 
    },
    fullName: { 
        type: String, 
        required: false, 
        index: true 
    }, 
    email: { 
        type: String, 
        unique: true, 
        sparse: true 
    },
    password: { 
        type: String, 
        required: false 
    },
    mobileNumber: { 
        type: String, 
        required: true, 
        unique: true 
    },
    role: { 
        type: String, 
        enum: ['user', 'admin', 'work'], 
        index: true 
    },
    isVerified: { 
        type: Boolean, 
        default: false 
    },
    isDocumentVerified: { 
        type: Boolean, 
        default: false 
    },
    verifyCode: String,
    verifyCodeExpiry: Date
}, { timestamps: true });

const User = model<IUser>("User", userSchema);
export default User; 