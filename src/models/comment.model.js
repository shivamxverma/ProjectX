import mongoose,{Schema} from "mongoose";

const commentSchema = new Schema({
    content : {
        type : String,
        reqruired : true,
        trim : true
    },
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
        required: true
    },
    owner : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
},{timestamps: true});

const Comment = mongoose.model("Comment",commentSchema);

export default Comment;