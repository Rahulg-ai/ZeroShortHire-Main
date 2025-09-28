// functions/src/scheduledFunctions.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { sendEmail, sendBulkEmail, emailTemplates } = require('./utils/emailService');

const db = admin.firestore();

// Send daily reminder emails (runs at 9 AM UTC daily)
exports.sendDailyReminders = functions.pubsub
  .schedule('0 9 * * *')
  .timeZone('UTC')
  .onRun(async (context) => {
    try {
      console.log('Starting daily reminder job...');
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowString = tomorrow.toISOString().split('T')[0];

      // Get hackathons happening tomorrow
      const hackathonsSnapshot = await db
        .collection('hackathons')
        .where('date', '==', tomorrowString)
        .get();

      if (hackathonsSnapshot.empty) {
        console.log('No hackathons happening tomorrow');
        return null;
      }

      let totalEmailsSent = 0;

      for (const hackathonDoc of hackathonsSnapshot.docs) {
        const hackathon = hackathonDoc.data();
        const hackathonId = hackathonDoc.id;

        console.log(`Processing reminders for hackathon: ${hackathon.name}`);

        // Get all registrations for this hackathon
        const registrationsSnapshot = await db
          .collection('registrations')
          .where('hackathonId', '==', hackathonId)
          .get();

        if (registrationsSnapshot.empty) {
          console.log(`No registrations found for hackathon: ${hackathon.name}`);
          continue;
        }

        // Send reminder emails to all registered teams
        const emailPromises = registrationsSnapshot.docs.map(async (regDoc) => {
          const registration = regDoc.data();
          
          const template = emailTemplates.hackathonReminder(
            hackathon.name,
            hackathon.date,
            hackathon.time,
            registration.teamName
          );

          try {
            await sendEmail(
              registration.teamEmail,
              template.subject,
              template.html
            );
            return true;
          } catch (error) {
            console.error(`Failed to send reminder to ${registration.teamEmail}:`, error);
            return false;
          }
        });

        const results = await Promise.allSettled(emailPromises);
        const successCount = results.filter(result => result.status === 'fulfilled' && result.value === true).length;
        
        totalEmailsSent += successCount;
        console.log(`Sent ${successCount} reminder emails for hackathon: ${hackathon.name}`);

        // Send summary to organizer
        try {
          const organizerSummary = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Daily Reminder Summary</h2>
              <p>Reminder emails have been sent for your hackathon "<strong>${hackathon.name}</strong>" happening tomorrow.</p>
              
              <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #0c4a6e; margin-top: 0;">Summary:</h3>
                <ul style="color: #075985;">
                  <li><strong>Total registered teams:</strong> ${registrationsSnapshot.size}</li>
                  <li><strong>Reminder emails sent:</strong> ${successCount}</li>
                  <li><strong>Event date:</strong> ${hackathon.date} at ${hackathon.time}</li>
                </ul>
              </div>
              
              <p>Your participants have been notified about tomorrow's event. Make sure everything is ready!</p>
            </div>
          `;

          await sendEmail(
            hackathon.createdBy,
            `Reminder Summary - ${hackathon.name}`,
            organizerSummary
          );
        } catch (error) {
          console.error(`Failed to send organizer summary for ${hackathon.name}:`, error);
        }
      }

      console.log(`Daily reminder job completed. Total emails sent: ${totalEmailsSent}`);
      return null;
    } catch (error) {
      console.error('Error in sendDailyReminders:', error);
      return null;
    }
  });

// Send weekly digest emails (runs every Monday at 8 AM UTC)
exports.sendWeeklyDigest = functions.pubsub
  .schedule('0 8 * * 1')
  .timeZone('UTC')
  .onRun(async (context) => {
    try {
      console.log('Starting weekly digest job...');

      // Get date range for this week
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      const weekStartString = weekStart.toISOString().split('T')[0];
      const weekEndString = weekEnd.toISOString().split('T')[0];

      // Get hackathons happening this week
      const hackathonsSnapshot = await db
        .collection('hackathons')
        .where('date', '>=', weekStartString)
        .where('date', '<=', weekEndString)
        .orderBy('date')
        .get();

      if (hackathonsSnapshot.empty) {
        console.log('No hackathons happening this week');
        return null;
      }

      const weeklyHackathons = hackathonsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Get all users who have opted in for weekly digest
      const usersSnapshot = await db
        .collection('users')
        .where('preferences.weeklyDigest', '==', true)
        .get();

      if (usersSnapshot.empty) {
        console.log('No users subscribed to weekly digest');
        return null;
      }

      const recipients = usersSnapshot.docs.map(doc => {
        const user = doc.data();
        return {
          email: user.email,
          name: user.displayName || user.email.split('@')[0]
        };
      });

      // Send bulk weekly digest
      const template = emailTemplates.weeklyDigest(weeklyHackathons, '{name}');
      
      try {
        const result = await sendBulkEmail(recipients, template.subject, template.html);
        console.log(`Weekly digest sent to ${recipients.length} users`);
        return result;
      } catch (error) {
        console.error('Failed to send weekly digest:', error);
        return null;
      }
    } catch (error) {
      console.error('Error in sendWeeklyDigest:', error);
      return null;
    }
  });

// Clean up expired hackathons (runs daily at 2 AM UTC)
exports.cleanupExpiredHackathons = functions.pubsub
  .schedule('0 2 * * *')
  .timeZone('UTC')
  .onRun(async (context) => {
    try {
      console.log('Starting cleanup job for expired hackathons...');

      // Get hackathons that ended more than 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];

      const expiredHackathonsSnapshot = await db
        .collection('hackathons')
        .where('date', '<', cutoffDate)
        .get();

      if (expiredHackathonsSnapshot.empty) {
        console.log('No expired hackathons to clean up');
        return null;
      }

      console.log(`Found ${expiredHackathonsSnapshot.size} expired hackathons to clean up`);

      // Archive instead of delete (move to archived collection)
      const batch = db.batch();
      
      for (const hackathonDoc of expiredHackathonsSnapshot.docs) {
        const hackathon = hackathonDoc.data();
        const hackathonId = hackathonDoc.id;

        // Get registrations for this hackathon
        const registrationsSnapshot = await db
          .collection('registrations')
          .where('hackathonId', '==', hackathonId)
          .get();

        // Create archived hackathon document
        const archivedHackathonRef = db.collection('archived_hackathons').doc(hackathonId);
        batch.set(archivedHackathonRef, {
          ...hackathon,
          archivedAt: admin.firestore.FieldValue.serverTimestamp(),
          registrationCount: registrationsSnapshot.size
        });

        // Archive registrations
        registrationsSnapshot.docs.forEach(regDoc => {
          const registration = regDoc.data();
          const archivedRegRef = db.collection('archived_registrations').doc(regDoc.id);
          batch.set(archivedRegRef, {
            ...registration,
            archivedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          // Delete original registration
          batch.delete(regDoc.ref);
        });

        // Delete original hackathon
        batch.delete(hackathonDoc.ref);
      }

      await batch.commit();
      console.log(`Successfully archived ${expiredHackathonsSnapshot.size} expired hackathons`);
      return null;
    } catch (error) {
      console.error('Error in cleanupExpiredHackathons:', error);
      return null;
    }
  });

// Generate and send monthly analytics (runs on 1st of every month at 9 AM UTC)
exports.sendMonthlyAnalytics = functions.pubsub
  .schedule('0 9 1 * *')
  .timeZone('UTC')
  .onRun(async (context) => {
    try {
      console.log('Starting monthly analytics job...');

      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Get hackathons created last month
      const hackathonsSnapshot = await db
        .collection('hackathons')
        .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(lastMonth))
        .where('createdAt', '<', admin.firestore.Timestamp.fromDate(thisMonth))
        .get();

      // Get registrations from last month
      const registrationsSnapshot = await db
        .collection('registrations')
        .where('registeredAt', '>=', admin.firestore.Timestamp.fromDate(lastMonth))
        .where('registeredAt', '<', admin.firestore.Timestamp.fromDate(thisMonth))
        .get();

      // Calculate statistics
      const stats = {
        hackathonsCreated: hackathonsSnapshot.size,
        totalRegistrations: registrationsSnapshot.size,
        uniqueOrganizers: new Set(hackathonsSnapshot.docs.map(doc => doc.data().createdBy)).size,
        avgRegistrationsPerHackathon: hackathonsSnapshot.size > 0 ? 
          Math.round((registrationsSnapshot.size / hackathonsSnapshot.size) * 100) / 100 : 0
      };

      // Send analytics to platform admins
      const adminEmails = functions.config().admin?.emails?.split(',') || [];

      if (adminEmails.length > 0) {
        const analyticsEmail = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Monthly Platform Analytics</h2>
            <p>Here's your monthly summary for ${lastMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}:</p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0;">
              <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; text-align: center;">
                <h3 style="color: #0c4a6e; font-size: 2em; margin: 0;">${stats.hackathonsCreated}</h3>
                <p style="color: #075985; margin: 5px 0;">New Hackathons</p>
              </div>
              <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; text-align: center;">
                <h3 style="color: #166534; font-size: 2em; margin: 0;">${stats.totalRegistrations}</h3>
                <p style="color: #15803d; margin: 5px 0;">Total Registrations</p>
              </div>
              <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; text-align: center;">
                <h3 style="color: #92400e; font-size: 2em; margin: 0;">${stats.uniqueOrganizers}</h3>
                <p style="color: #a16207; margin: 5px 0;">Unique Organizers</p>
              </div>
              <div style="background-color: #f3e8ff; padding: 20px; border-radius: 8px; text-align: center;">
                <h3 style="color: #7c2d92; font-size: 2em; margin: 0;">${stats.avgRegistrationsPerHackathon}</h3>
                <p style="color: #8b5cf6; margin: 5px 0;">Avg Registrations/Event</p>
              </div>
            </div>
            
            <p>The platform continues to grow! Keep up the great work.</p>
          </div>
        `;

        for (const adminEmail of adminEmails) {
          try {
            await sendEmail(
              adminEmail.trim(),
              'Monthly Platform Analytics',
              analyticsEmail
            );
          } catch (error) {
            console.error(`Failed to send analytics to ${adminEmail}:`, error);
          }
        }
      }

      console.log('Monthly analytics job completed');
      return stats;
    } catch (error) {
      console.error('Error in sendMonthlyAnalytics:', error);
      return null;
    }
  });