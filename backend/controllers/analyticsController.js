const Idea = require('../models/Idea');
const Comment = require('../models/Comment');
const Vote = require('../models/vote');
const User = require('../models/User');

module.exports = {
    // ไอเดียยอดนิยม
    getPopularIdeas: async (req, res) => {
        try {
            // ดึง top 10 ไอเดีย ตาม totalScore
            const ideas = await Idea.find()
                .sort({ totalScore: -1 })
                .limit(10)
                .populate('author', 'username firstName lastName avatar');

            res.json(ideas);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    // สถิติการใช้งาน
    getStatistics: async (req, res) => {
        try {
            const totalUsers = await User.countDocuments();
            const totalIdeas = await Idea.countDocuments();
            const totalComments = await Comment.countDocuments();
            const totalVotes = await Vote.countDocuments();

            res.json({ totalUsers, totalIdeas, totalComments, totalVotes });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    // แนวโน้มไอเดีย (trend)
    getTrends: async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 5;  // default top 5
            const periodDays = parseInt(req.query.period) || 7; // default last 7 days
            const sinceDate = new Date();
            sinceDate.setDate(sinceDate.getDate() - periodDays);

            // ดึงไอเดียที่มี comment หรือ vote ในช่วง period
            const ideas = await Idea.aggregate([
                {
                    $lookup: {
                        from: 'comments',
                        localField: '_id',
                        foreignField: 'idea',
                        as: 'comments'
                    }
                },
                {
                    $lookup: {
                        from: 'votes',
                        localField: '_id',
                        foreignField: 'idea',
                        as: 'votes'
                    }
                },
                {
                    $project: {
                        title: 1,
                        votesLastPeriod: {
                            $size: {
                                $filter: {
                                    input: '$votes',
                                    cond: { $gte: ['$$this.createdAt', sinceDate] }
                                }
                            }
                        },
                        commentsLastPeriod: {
                            $size: {
                                $filter: {
                                    input: '$comments',
                                    cond: { $gte: ['$$this.createdAt', sinceDate] }
                                }
                            }
                        }
                    }
                },
                { $sort: { votesLastPeriod: -1, commentsLastPeriod: -1 } },
                { $limit: limit }
            ]);

            res.json(ideas);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
};
