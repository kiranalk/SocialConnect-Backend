import mongoose from "mongoose"; 

const mongoConnection = async()=>{
    try {
        const mongo_url = process.env.mongoUrl;
        await mongoose.connect(mongo_url, {
            tls: true,
            tlsAllowInvalidCertificates: true
        });
        console.log("Database connected!");
    } catch (error) {
        console.log("error in connection");
        console.log(error)
    }
}

export default mongoConnection;
