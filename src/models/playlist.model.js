import mongoose,{Schema} from "mongoose";

const playlistSchema = new Schema({
    name : {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: false,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    videos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    }]
},{timestamps: true});

const Playlist = mongoose.model("Playlist", playlistSchema);

export default Playlist;