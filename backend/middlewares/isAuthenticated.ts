import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

const isAuthenticated = (req: Request, res: Response, next: NextFunction): any => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ msg: 'Unauthorized' })
        }
        const decoded = jwt.verify(token, process.env.SECRET_KEY as string);
        if (!decoded) {
            return res.status(401).json({
                msg: 'Invalid Token',
                success: false
            })
        }
        req.id = (decoded as any).userId;
        next();

    } catch (err: any) {
        return res.status(500).json({ msg: err.message })
    }
}

export default isAuthenticated;