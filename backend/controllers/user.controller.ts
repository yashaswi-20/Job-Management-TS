
import Users from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Request, Response } from 'express';
import getDataUri from '../utils/datauri.js';
import cloudinary from '../utils/cloudinary.js';

export const register = async (req: Request, res: Response): Promise<any> => {
    try {
        const { fullname, email, password, phoneNumber, role } = req.body;
        if (!fullname || !email || !password || !phoneNumber || !role) {
            return res.status(400).json({ msg: 'All fields are required' })
        }
        const user = await Users.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' })
        }

        const file = (req as any).file;
        if (!file) {
            return res.status(400).json({ msg: 'Profile picture is required' })
        }
        const fileUri = getDataUri(file);
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content as string);

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await Users.create({
            fullname,
            email,
            password: hashedPassword,
            phoneNumber,
            role,
            profile: {
                profilePhoto: cloudResponse.secure_url
            }
        })
        return res.status(201).json({ msg: 'User registered successfully' })

    } catch (err: any) {
        return res.status(500).json({ msg: err.message })
    }
}

export const login = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, password, role } = req.body;
        if (!email || !password || !role) {
            return res.status(400).json({ msg: 'All fields are required' })
        }
        let user = await Users.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'User does not exist' })
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' })
        }
        if (user.role !== role) {
            return res.status(400).json({ msg: "Account doesn't exist with this role" })
        }

        const tokenData = {
            userId: user._id,
            role: user.role
        }

        const token = jwt.sign(tokenData, process.env.SECRET_KEY as string, { expiresIn: '1d' });

        const resUser = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        }

        return res.status(200).cookie("token", token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'strict' }).json({
            msg: "Welcome back " + user.fullname,
            user: resUser,
            success: true
        })


    } catch (err: any) {
        return res.status(500).json({ msg: err.message })
    }

}

export const logout = async (req: Request, res: Response): Promise<any> => {

    try {
        return res.status(200).cookie("token", "", { maxAge: 0 }).json({
            msg: "Logged out successfully"
        })
    } catch (err: any) {
        return res.status(500).json({ msg: err.message })
    }
}

export const updateProfile = async (req: Request, res: Response): Promise<any> => {
    try {
        const { fullname, email, phoneNumber, bio, skills } = req.body;
        const file = (req as any).file;

        //cloudnary will be added here 
        let skillsArray;
        if (skills) {
            skillsArray = skills.split(',');
        }
        const userId = req.id;
        let user = await Users.findById(userId);
        if (!user) {
            return res.status(400).json({ msg: 'User does not exist' })
        }
        //updating data
        if (fullname) user.fullname = fullname;
        if (email) user.email = email;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (bio && user.profile) user.profile.bio = bio;
        if (skills && user.profile) user.profile.skills = skillsArray as any;

        if (file) {
            const fileUri = getDataUri(file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content as string);

            // update resume in profile
            if (cloudResponse && user.profile) {
                user.profile.resume = cloudResponse.secure_url;
                user.profile.resumeOriginalName = file.originalname;
            }
        }

        await user.save();
        const resUser = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        }

        return res.status(200).json({
            message: "Profile updated successfully.",
            user: resUser,
            success: true
        })

    } catch (err: any) {
        return res.status(500).json({ msg: err.message })

    }
}