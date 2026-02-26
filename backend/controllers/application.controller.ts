import type { Request, Response } from "express";
import Application from "../models/application.model.js";
import Job from "../models/job.model.js";

export const applyJob = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id: jobId } = req.params;
        const userId = req.id;
        if (!jobId) {
            return res.status(400).json({ msg: 'Job id is required' })
        }
        const existingApplication = await Application.findOne({ job: jobId as string, applicant: userId as string });

        if (existingApplication) {
            return res.status(400).json({ msg: 'You have already applied for this job' })
        }
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ msg: 'Job not found' })
        }
        const application: any = await Application.create({
            job: jobId as string,
            applicant: userId as string
        })
        await Job.findByIdAndUpdate(
            jobId,
            { $push: { applications: application._id } });
        return res.status(201).json({ msg: 'Applied successfully', application })

    } catch (err: any) {
        return res.status(500).json({ msg: err.message })
    }
}

export const getAppliedJobs = async (req: Request, res: Response): Promise<any> => {
    try {
        const userId = req.id;
        const applications = await Application.find({ applicant: userId as string }).sort({ createdAt: -1 }).
            populate({
                path: 'job',
                options: { sort: { createdAt: -1 } },
                populate: ({
                    path: 'company',
                    options: { sort: { createdAt: -1 } }
                })
            })
        if (!applications) {
            return res.status(404).json({
                message: 'No Application',
                success: false
            })
        }
        return res.status(200).json({
            applications,
            success: true
        })

    } catch (err: any) {
        return res.status(500).json({ msg: err.message })
    }
}