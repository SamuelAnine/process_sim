import mongoose from 'mongoose';

let isConnected = false // to track the connection

export const connectToDB = async () => {
    mongoose.set(`strictQuery`, true); // to avoid errors in our console

    if(isConnected) {
        console.log(`MongoDB is already connected`);
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: 'testaug',
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })

        isConnected = true;

        console.log('MongoDB is connected')
    } catch (error) {
        console.log(error)
    }
}