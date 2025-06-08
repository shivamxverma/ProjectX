import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadFileToCloudinary = async (LocalfilePath) => {
    try {
        if(!LocalfilePath){
            return null;
        } 

        const response = await cloudinary.uploader.upload(LocalfilePath,{
            resource_type : 'auto'
        });

        console.log("File uploaded successfully to Cloudinary", response.url);
        fs.unlinkSync(LocalfilePath); 
        return response;
    } catch(error){
        fs.unlinkSync(LocalfilePath);
        return null;
    }
}

export { uploadFileToCloudinary };
    