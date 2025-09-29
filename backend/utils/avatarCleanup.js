const fs = require('fs');
const path = require('path');
const User = require('../models/User');

// Function to clean up unused avatar files
const cleanupUnusedAvatars = async () => {
    try {
        console.log('🧹 Starting avatar cleanup...');
        
        const avatarsDir = path.join(__dirname, '../uploads/avatars');
        if (!fs.existsSync(avatarsDir)) {
            console.log('No avatars directory found');
            return;
        }

        // Get all files in avatars directory
        const files = fs.readdirSync(avatarsDir);
        console.log(`Found ${files.length} files in avatars directory`);

        // Get all users and their avatar paths
        const users = await User.find({ avatar: { $exists: true, $ne: null } });
        const usedAvatars = users.map(user => {
            if (user.avatar && user.avatar.startsWith('/uploads/avatars/')) {
                return path.basename(user.avatar);
            }
            return null;
        }).filter(Boolean);

        console.log(`Found ${usedAvatars.length} used avatars`);

        // Check for orphaned database references (files that don't exist)
        const orphanedReferences = [];
        for (const user of users) {
            if (user.avatar && user.avatar.startsWith('/uploads/avatars/')) {
                const filename = path.basename(user.avatar);
                const filePath = path.join(avatarsDir, filename);
                if (!fs.existsSync(filePath)) {
                    orphanedReferences.push({ userId: user._id, filename });
                }
            }
        }

        if (orphanedReferences.length > 0) {
            console.log(`⚠️  Found ${orphanedReferences.length} orphaned avatar references in database:`);
            orphanedReferences.forEach(ref => {
                console.log(`   - User ${ref.userId}: ${ref.filename}`);
            });
        }

        // Find unused files
        const unusedFiles = files.filter(file => !usedAvatars.includes(file));
        console.log(`Found ${unusedFiles.length} unused files`);

        // Delete unused files
        let deletedCount = 0;
        for (const file of unusedFiles) {
            try {
                const filePath = path.join(avatarsDir, file);
                fs.unlinkSync(filePath);
                console.log(`Deleted unused avatar: ${file}`);
                deletedCount++;
            } catch (error) {
                console.error(`Error deleting ${file}:`, error.message);
            }
        }

        console.log(`✅ Cleanup complete! Deleted ${deletedCount} unused avatar files`);
        
        // Return cleanup stats
        return {
            totalFiles: files.length,
            usedFiles: usedAvatars.length,
            unusedFiles: unusedFiles.length,
            deletedFiles: deletedCount,
            orphanedReferences: orphanedReferences.length
        };
        
    } catch (error) {
        console.error('Error during avatar cleanup:', error);
        throw error;
    }
};

// Function to get avatar storage stats
const getAvatarStats = async () => {
    try {
        const avatarsDir = path.join(__dirname, '../uploads/avatars');
        if (!fs.existsSync(avatarsDir)) {
            return { totalFiles: 0, totalSize: 0, usedFiles: 0 };
        }

        const files = fs.readdirSync(avatarsDir);
        let totalSize = 0;
        
        for (const file of files) {
            const filePath = path.join(avatarsDir, file);
            const stats = fs.statSync(filePath);
            totalSize += stats.size;
        }

        const users = await User.find({ avatar: { $exists: true, $ne: null } });
        const usedAvatars = users.filter(user => 
            user.avatar && user.avatar.startsWith('/uploads/avatars/')
        );

        return {
            totalFiles: files.length,
            totalSize: totalSize,
            usedFiles: usedAvatars.length,
            unusedFiles: files.length - usedAvatars.length
        };
    } catch (error) {
        console.error('Error getting avatar stats:', error);
        return { error: error.message };
    }
};

module.exports = {
    cleanupUnusedAvatars,
    getAvatarStats
};
