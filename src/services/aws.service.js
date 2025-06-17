import { S3Client , GetObjectCommand ,PutObjectCommand} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from 'dotenv';
dotenv.config();

const s3Client = new S3Client({
    region: process.env.AWS_REGION || "ap-south-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
})

async function getObjectURL(key){
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME || "codesm-cf",
        Key: key    
    })
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return url;
}

async function putObject(filename,contentType){
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME || "codesm-cf",
        Key: `/uploads/user/${filename}`,
        ContentType: contentType,

    })
    const url = await getSignedUrl(s3Client, command);
    return url;
}

const value = await putObject("profile/1.jpeg","image/jpeg");

console.log(value);