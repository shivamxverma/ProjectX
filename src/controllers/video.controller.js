import { Video } from '../models/video.model.js';
import { User } from '../models/user.model.js';
import asyncHandler from 'express-async-handler';

const getVideos = asyncHandler(async (req, res) => {
    const videos = await Video.find({});
    res.status(200).json(videos);
});

const getVideoById = asyncHandler(async (req, res) => {
    const video = await Video.findById(req.params.id).populate('owner', 'username avatar');
    if (!video) {
        res.status(404);
        throw new Error('Video not found');
    }
    res.status(200).json(video);
});