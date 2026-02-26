import type { Request, Response } from "express";
import Job from '../models/job.model.js';

export const postJob = async (req: Request, res: Response): Promise<any> => {
    try {
        const { title, description, requirements, salary, location, jobType, position, experience, companyId } = req.body;
        const userId = req.id;
        if (!title || !description || !requirements || !salary || !location || !jobType || !position || !experience || !companyId) {
            return res.status(400).json({ msg: 'All fields are required', success: false })
        }
        const job = await Job.create({
            title,
            description,
            requirements: requirements.split(','),
            salary: Number(salary),
            location,
            jobType,
            position,
            experienceYear: experience,
            company: companyId,
            createdBy: userId as string
        })
        return res.status(201).json({ msg: 'Job posted successfully', job })

    } catch (err: any) {
        return res.status(500).json({ msg: err.message, success: false })
    }
}

//for student to view all jobs
export const getAllJobs = async (req: Request, res: Response): Promise<any> => {
    try {
        const keyword = req.query.keyword || '';
        const query: any = {
            $or: [
                { title: { $regex: keyword, $options: 'i' } },       //Match if title matches the keyword or description matches the keyword
                { description: { $regex: keyword, $options: 'i' } },
            ]
        };
        const jobs = await Job.find(query).populate({
            path: 'company',
        }).sort({ createdAt: -1 }).populate('createdBy', 'fullname email');
        if (!jobs || jobs.length === 0) {
            return res.status(404).json({ msg: 'No jobs found', success: false })
        }
        return res.status(200).json({ jobs, success: true })

    } catch (err: any) {
        return res.status(500).json({ msg: err.message, success: false })
    }
}

//student
export const getJobById = async (req: Request, res: Response): Promise<any> => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ msg: 'Job not found', success: false })
        }
        return res.status(200).json({ job, success: true })
    } catch (err: any) {
        return res.status(500).json({ msg: err.message, success: false })
    }
}

//all jobs posted by a admin
export const getAdminJobs = async (req: Request, res: Response): Promise<any> => {
    try {
        const userId = req.id;
        const jobs = await Job.find({ createdBy: userId as string }).populate({ path: 'company' }).sort({ createdAt: -1 } as any);
        if (!jobs || jobs.length === 0) {
            return res.status(404).json({ msg: 'No jobs found', success: false })
        }
        return res.status(200).json({ jobs, success: true })
    } catch (err: any) {
        return res.status(500).json({ msg: err.message, success: false })
    }
}