import mongoose from 'mongoose'

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string)
        console.log("mongoose connected...")

    } catch (err: any) {
        console.log(err)
    }

}

export default connectDb