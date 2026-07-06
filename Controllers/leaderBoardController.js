const Leaderboard = require('../Models/leaderBoard');
const User = require('../Models/user');

async function recalculateRanks() {
    const allEntries = await Leaderboard.find({}).sort({ score: -1, updatedAt: 1 }).lean();
    const bulkOps = allEntries.map((entry, index) => ({
        updateOne: {
            filter: { _id: entry._id },
            update: { $set: { rank: index + 1 } }
        }
    }));
    if (bulkOps.length > 0) {
        await Leaderboard.bulkWrite(bulkOps);
    }
}

async function getTop5RankedUsers(req, res) {
    try {
        await recalculateRanks();
        const top5 = await Leaderboard.find({}).sort({ rank: 1 }).limit(5);
        res.status(200).json({ success: true, data: top5 });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch leaderboard top 5', details: error.message });
    }
}

async function getAllRankedUsers(req, res) {
    try {
        await recalculateRanks();
        const all = await Leaderboard.find({}).sort({ rank: 1 });
        res.status(200).json({ success: true, data: all });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch full leaderboard', details: error.message });
    }
}

async function addScoreToUser(req, res) {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        let entry = await Leaderboard.findOne({ userId: user._id });
        if (!entry) {
            entry = new Leaderboard({
                userId: user._id,
                userEmail: user.email,
                userName: user.username,
                score: 0,
                rank: 0
            });
        }

        entry.score = (entry.score || 0) + 15;
        await entry.save();

        await recalculateRanks();

        const updated = await Leaderboard.findOne({ userId: user._id });
        res.status(200).json({ success: true, message: 'Score added', data: updated });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add score', details: error.message });
    }
}

module.exports = {
    getTop5RankedUsers,
    getAllRankedUsers,
    addScoreToUser
};


