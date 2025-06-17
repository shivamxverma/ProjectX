import asyncHandler from '../utils/asyncHandler.js';
import { Subscription } from '../models/subscription.model.js';
// import { User } from '../models/user.model.js'; 

const subscribeToChannel = asyncHandler(async (req, res) => {
    const { subscriber } = req.body;

    if (!subscriber) {
        throw new ApiError(400,"Channel ID is required");
    }

    const channel = req.user._id;

    const existingSubscription = await Subscription.findOne({ subscriber, channel });
    if (existingSubscription) {
        throw new ApiError(400, 'Already subscribed to this channel');
    }

    const subscription = await Subscription.create({
        subscriber,
        channel
    });

    res.status(201).json(apiResponse(201, 'Subscribed successfully', subscription));
});

const unsubscriberToChannel = asyncHandler(async (req, res) => {
    const { subscriber } = req.body;

    if (!subscriber) {
        throw new ApiError(400, "Channel ID is required");
    }

    const channel = req.user._id;

    const existingSubscription = await Subscription.findOne({ subscriber, channel });
    if (!existingSubscription) {
        throw new ApiError(404, 'Subscription not found');
    }

    await existingSubscription.remove();

    res.status(200).json(apiResponse(200, 'Unsubscribed successfully'));
});

const SubscriberCount = asyncHandler(async (req, res) => {
    const channel = req.user._id;
    const count = await Subscription.countDocuments({ channel });
    
    res.status(200).json(apiResponse(200, 'Subscriber count retrieved successfully', { count }));
});





export {
    subscribeToChannel,
    unsubscriberToChannel,
    SubscriberCount
}