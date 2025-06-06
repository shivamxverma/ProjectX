import mongoose from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const videoSchema = new mongoose.Schema({
    videoFile : {
        type: String,
        required: true,
        trim: true
    },
    thumbnail : {
        type: String,
        required: true,
        trim: true
    },
    title : {
        type: String,
        required: true,
        trim: true
    },
    description : {
        type: String,
        required: true,
        trim: true
    },
    duration : {
        type: Number,
        required: true,
        min: 0
    },
    views : {
        type: Number,
        default: 0,
        min: 0
    },
    likes : {
        type: Number,
        default: 0,
        min: 0
    },
    isPulished : {
        type: Boolean,
        default: true
    },
    owner : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
},{timestamps: true});

videoSchema.plugin(mongooseAggregatePaginate);

const Video = mongoose.model('Video', videoSchema);

export default Video; 