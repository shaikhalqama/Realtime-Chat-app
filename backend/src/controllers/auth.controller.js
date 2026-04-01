import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const findUserByEmail = async (email) => {
    return User.findOne({
        email: {
            $regex: `^${escapeRegex(email)}$`,
            $options: "i",
        },
    });
};

export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;

    try {
        const normalizedFullName = fullName?.trim();
        const normalizedEmail = email?.trim().toLowerCase();

        if (!normalizedFullName || !normalizedEmail || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        const user = await findUserByEmail(normalizedEmail);
        if (user) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName: normalizedFullName,
            email: normalizedEmail,
            password: hashedPassword,
        });

        generateToken(newUser._id, res);
        await newUser.save();

        return res.status(201).json({
            _id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
            profilePic: newUser.profilePic,
        });
    } catch (error) {
        console.log("Error in signup controller", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const normalizedEmail = email?.trim().toLowerCase();
        const user = await findUserByEmail(normalizedEmail);

        if (!user || !password) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        if (user.email !== normalizedEmail) {
            user.email = normalizedEmail;
            await user.save();
        }

        const isHashedPassword = /^\$2[aby]\$\d{2}\$/.test(user.password);
        const isPasswordCorrect = isHashedPassword
            ? await bcrypt.compare(password, user.password)
            : password === user.password;

        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        if (!isHashedPassword) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();
        }

        generateToken(user._id, res);

        return res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        });
    } catch (error) {
        console.log("Error in login controller", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", {
            maxAge: 0,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("Error in logout controller", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id;

        if (!profilePic) {
            return res.status(400).json({ message: "Profile picture URL is required" });
        }

        const uploadedResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: uploadedResponse.secure_url },
            { new: true }
        ).select("-password");

        return res.status(200).json(updatedUser);
    } catch (error) {
        console.log("Error in update Profile:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const checkAuth = (req, res) => {
    try {
        return res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
