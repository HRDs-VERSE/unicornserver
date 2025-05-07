import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import expressAsyncHandler from "express-async-handler";
import { sendVerificationCodeWhatsApp } from "../lib/notification.service";
import CarDocument from "../models/carDocument.model";

const generateVerificationCode = (length = 4) => {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
};

export const initiateRegistration = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { mobileNumber, pass } = req.body;
    // const isValidMobile = /^\d{10}$/.test(mobileNumber);
    // if (!isValidMobile) {
    //     res.status(400).json({
    //         success: false,
    //         message: "Invalid mobile number format. It should be 10 digits.",
    //     });
    //     return;
    // }

    let existingUser = await User.findOne({ mobileNumber });
    const verifyCode = generateVerificationCode(4);
    const verifyCodeExpiry = new Date(Date.now() + 3 * 60 * 1000);

    if (existingUser) {
        if (existingUser.isVerified) {
            const isMatch = await bcrypt.compare(pass, existingUser.password);
            if (!isMatch) {
                res.status(400).json({ success: false, message: "Invalid credentials" });
                return;
            }
    
            // Generate JWT token
            const token = jwt.sign(
                { userId: existingUser._id, role: existingUser.role },
                process.env.TOKEN_SECRET as string,
                { expiresIn: "1d" }
            );
    
            // Remove password from response
            const { password, ...userInfo } = existingUser.toObject();
            res.status(200).json({
                success: true,
                message: "Login successful",
                token,
                user: userInfo
            });
            return;
        }

        existingUser.verifyCode = verifyCode;
        existingUser.verifyCodeExpiry = verifyCodeExpiry;
        await existingUser.save();
        const messageSent = await sendVerificationCodeWhatsApp(mobileNumber, verifyCode);
        if (!messageSent) {
            res.status(500).json({
                success: false,
                message: "Failed to send verification code.",
            });
            return
        }

        res.status(200).json({
            success: true,
            message: "Verification code re-sent to existing unverified user.",
        });
        return
    }

    // New user
    const messageSent = await sendVerificationCodeWhatsApp(mobileNumber, verifyCode);
    if (!messageSent) {
        res.status(500).json({
            success: false,
            message: "Failed to send verification code.",
        });
        return
    }

    await User.create({
        mobileNumber,
        verifyCode,
        verifyCodeExpiry,
        isVerified: false,
    });

    res.status(200).json({
        success: true,
        message: "Verification code sent successfully.",
    });
    return
});

// Helper function

export const auth = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { formData, userId, documents } = req.body;

    if (!userId) {
        res.status(400).json({ success: false, message: "User Id is required" });
        return;
    }

    // Check if user exists in database
    const existingUser = await User.findById(userId);

    if (!existingUser) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
    }

    // If user doesn't exist, handle as registration
    if (existingUser && existingUser.password) {
        // Registration requires additional fields
        if (!formData.fullName || !formData.role || !documents) {
            res.status(400).json({ success: false, message: "Full name, role and docs are required for registration" });
            return;
        }

        // Validate password length
        if (formData.password.length < 2) {
            res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
            return;
        }

        // Validate role
        const validRoles = ["user", "admin", "work"];
        if (!validRoles.includes(formData.role)) {
            res.status(400).json({ success: false, message: "Invalid role" });
            return;
        }

        // Hash password and create verification code
        const hashedPassword = await bcrypt.hash(formData.password, 10);

        // Create and save new user
        const newUser = await User.findByIdAndUpdate(
            existingUser?._id,
            {
                fullName: formData.fullName,
                email: formData.email,
                password: hashedPassword,
                role: formData.role,
            },
            { new: true, select: "-password" }
        );

        if (!newUser) {
            res.status(400).json({ success: false, message: "Something went wrong while updating details" });
            return;
        }

        const newUserDocs = await CarDocument.create(
            documents
        )

        if (!newUserDocs) {
            res.status(400).json({ success: false, message: "Something went wrong while updating details" });
            return;
        }

        const token = jwt.sign(
            { userId: existingUser._id, role: existingUser.role },
            process.env.TOKEN_SECRET as string,
            { expiresIn: "1d" }
        );

        res.status(201).json({ success: true, message: "User registered successfully", user: newUser, token });
        return;
    }
    // If user exists, handle as login
    else {
        // Check if user is verified
        if (!existingUser.isVerified) {
            res.status(403).json({ success: false, message: "User not verified" });
            return;
        }

        // Verify password
        const isMatch = await bcrypt.compare(formData.password, existingUser.password);
        if (!isMatch) {
            res.status(400).json({ success: false, message: "Invalid credentials" });
            return;
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: existingUser._id, role: existingUser.role },
            process.env.TOKEN_SECRET as string,
            { expiresIn: "1d" }
        );

        // Remove password from response
        const { password, ...userInfo } = existingUser.toObject();

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: userInfo
        });
        return;
    }
});

// Get User Profile
export const getUserProfile = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.id;

    // Find user by ID
    const user = await User.findById(userId).select("-password"); // Exclude password
    if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
    }

    res.status(200).json({ success: true, message: "User fetched", user });
    return;
});

// Update User Profile
export const updateUserProfile = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.id;
    const { fullName, mobileNumber } = req.body;

    if (mobileNumber) {
        const existingUser = await User.findOne({ mobileNumber });
        if (String(existingUser?._id) !== userId) {
            res.status(400).json({ success: false, message: "Mobile number already in use" });
            return;
        }
    }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { fullName, mobileNumber },
        { new: true, select: "-password" } // Exclude password from response
    );

    if (!updatedUser) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
    }

    res.status(200).json({ success: true, message: "Profile updated", updatedUser });
    return;
});

// Verify User (using verification code)
export const verifyUser = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { number, verifyCode } = req.body;


    if (!number) {
        res.status(400).json({ success: false, message: "Mobile number is required" });
        return;
    }

    const user = await User.findOne({ mobileNumber: number.trim() });
    if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
    }

    if (!number || !verifyCode) {
        res.status(400).json({ success: false, message: "Mobile number and verification code are required" });
        return;
    }

    if (user.verifyCodeExpiry && user.verifyCodeExpiry < new Date()) {
        res.status(400).json({ success: false, message: "Verification code has expired" });
        return;
    }

    if (user.verifyCode !== verifyCode) {
        res.status(400).json({ success: false, message: "Invalid verification code" });
        return;
    }

    user.isVerified = true;
    user.verifyCode = undefined;
    user.verifyCodeExpiry = undefined;
    await user.save();

    const userObj = user.toObject();
    const { password, mobileNumber, ...restData } = userObj;

    res.status(200).json({
        success: true,
        message: "User verified successfully",
        user: restData,
    });
    return;
}); 