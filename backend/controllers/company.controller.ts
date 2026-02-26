import type { Request, Response } from "express";
import Company from "../models/company.model.js";
export const registerCompany = async (req: Request, res: Response): Promise<any> => {
    try {
        const { companyName } = req.body;
        if (!companyName) {
            return res.status(400).json({ msg: 'Company name is required' })
        }
        let company = await Company.findOne({ name: companyName });
        if (company) {
            return res.status(400).json({ msg: 'Company already exists' })
        }
        company = await Company.create({
            name: companyName,
            userId: req.id as string
        })
        return res.status(201).json({ msg: 'Company registered successfully', company })

    } catch (err: any) {
        return res.status(500).json({ msg: err.message })
    }
}

export const getCompany = async (req: Request, res: Response): Promise<any> => {
    try {
        const userId = req.id;
        const company = await Company.find({ userId: userId as string });
        if (!company) {
            return res.status(404).json({ msg: 'Company not found' })
        }
        return res.status(200).json(company)
    } catch (err: any) {
        return res.status(500).json({ msg: err.message })
    }
}

export const getCompanyById = async (req: Request, res: Response): Promise<any> => {
    try {
        const companyId = req.params.id;
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ msg: 'Company not found' })
        }
        return res.status(200).json(company)
    } catch (err: any) {
        return res.status(500).json({ msg: err.message })
    }
}

export const updateCompany = async (req: Request, res: Response): Promise<any> => {
    try {
        const { name, discription, website, location } = req.body;
        const file = (req as any).file;
        //cloudnary will be added here for logo
        const updateData = { name, discription, website, location };
        const update = await Company.findByIdAndUpdate(req.params.id, updateData, { new: true })
        if (!update) {
            return res.status(404).json({ msg: 'Company not found' })
        }
        return res.status(200).json({ msg: 'Company updated successfully', company: update })

    } catch (err: any) {
        return res.status(500).json({ msg: err.message, success: false })
    }
}