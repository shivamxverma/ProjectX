import mongoose,{Schema} from "mongoose";

const likeSchema = new Schema({
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        required: true
    },
    likedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",        
        required: true
    },
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
        required: true
    },
    tweet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tweet",
        required: false
    }
},{timestamps: true});

const Like = mongoose.model("Like",likeSchema);

export default Like;