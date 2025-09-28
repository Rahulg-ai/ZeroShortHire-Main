// functions/index.js
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp();

// Import individual function modules
const hackathonFunctions = require('./src/hackathonFunctions');
const registrationFunctions = require('./src/registrationFunctions');
const scheduledFunctions = require('./src/scheduledFunctions');
const profileFunctions = require('./src/profileFunctions');

// Export Hackathon Functions
exports.onHackathonCreated = hackathonFunctions.onHackathonCreated;
exports.onHackathonDeleted = hackathonFunctions.onHackathonDeleted; // New cleanup function
exports.getHackathonStats = hackathonFunctions.getHackathonStats;
exports.updateHackathon = hackathonFunctions.updateHackathon;
exports.deleteHackathon = hackathonFunctions.deleteHackathon; // Updated with new delete function

// Export Registration Functions
exports.onRegistrationCreated = registrationFunctions.onRegistrationCreated;
exports.exportRegistrations = registrationFunctions.exportRegistrations;
exports.validateRegistration = registrationFunctions.validateRegistration;
exports.getRegistrationDetails = registrationFunctions.getRegistrationDetails;

// Export Scheduled Functions
exports.sendDailyReminders = scheduledFunctions.sendDailyReminders;
exports.sendWeeklyDigest = scheduledFunctions.sendWeeklyDigest;
exports.cleanupExpiredHackathons = scheduledFunctions.cleanupExpiredHackathons;
exports.sendMonthlyAnalytics = scheduledFunctions.sendMonthlyAnalytics;

// Export Profile Functions (New)
exports.saveUserProfile = profileFunctions.saveUserProfile;
exports.getUserProfile = profileFunctions.getUserProfile;
exports.uploadResume = profileFunctions.uploadResume;
exports.uploadAvatar = profileFunctions.uploadAvatar;
exports.searchColleges = profileFunctions.searchColleges;
exports.deleteUserProfile = profileFunctions.deleteUserProfile;

// Health check function for API monitoring
const functions = require('firebase-functions');

exports.healthCheck = functions.https.onRequest((req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'ZeroShotHire Firebase Functions are running!',
    availableEndpoints: {
      hackathon: [
        'onHackathonCreated',
        'onHackathonDeleted',
        'getHackathonStats',
        'updateHackathon',
        'deleteHackathon'
      ],
      registration: [
        'onRegistrationCreated',
        'exportRegistrations',
        'validateRegistration',
        'getRegistrationDetails'
      ],
      scheduled: [
        'sendDailyReminders',
        'sendWeeklyDigest',
        'cleanupExpiredHackathons',
        'sendMonthlyAnalytics'
      ],
      profile: [
        'saveUserProfile',
        'getUserProfile',
        'uploadResume',
        'uploadAvatar',
        'searchColleges',
        'deleteUserProfile'
      ]
    }
  });
});