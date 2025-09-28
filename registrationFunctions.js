// functions/src/registrationFunctions.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { sendEmail } = require('./utils/emailService');
const cors = require('cors')({ origin: true });

const db = admin.firestore();

// Trigger when a new registration is created
exports.onRegistrationCreated = functions.firestore
  .document('registrations/{registrationId}')
  .onCreate(async (snap, context) => {
    const registration = snap.data();
    const registrationId = context.params.registrationId;

    try {
      // Get hackathon details
      const hackathonDoc = await db.collection('hackathons').doc(registration.hackathonId).get();
      
      if (!hackathonDoc.exists) {
        console.error('Hackathon not found for registration:', registrationId);
        return null;
      }

      const hackathon = hackathonDoc.data();

      // Send confirmation email to team leader
      const teamConfirmationEmail = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">Registration Confirmed!</h2>
          <p>Congratulations! Your team "<strong>${registration.teamName}</strong>" has been successfully registered for <strong>"${hackathon.name}"</strong>.</p>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
            <h3 style="color: #0c4a6e; margin-top: 0;">Event Details:</h3>
            <ul style="color: #075985;">
              <li><strong>Date:</strong> ${hackathon.date}</li>
              <li><strong>Time:</strong> ${hackathon.time}</li>
              <li><strong>Location:</strong> ${hackathon.location}</li>
              <li><strong>Max Team Size:</strong> ${hackathon.maxTeamSize}</li>
            </ul>
          </div>

          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #334155; margin-top: 0;">Your Team Details:</h3>
            <ul style="color: #64748b;">
              <li><strong>Team Name:</strong> ${registration.teamName}</li>
              <li><strong>Team Leader:</strong> ${registration.teamLeader.name}</li>
              <li><strong>College:</strong> ${registration.collegeName}</li>
              <li><strong>Team Size:</strong> ${1 + (registration.members?.length || 0)} members</li>
              <li><strong>Registration ID:</strong> ${registrationId}</li>
            </ul>
          </div>

          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;"><strong>Next Steps:</strong></p>
            <ul style="color: #92400e; margin: 10px 0;">
              <li>Mark your calendar for ${hackathon.date}</li>
              <li>Prepare your development environment</li>
              <li>Review the hackathon themes and requirements</li>
              <li>Stay tuned for updates from the organizers</li>
            </ul>
          </div>

          <p style="color: #059669; font-weight: bold;">We're excited to see what you'll build! Good luck!</p>
          <p style="color: #64748b; font-size: 14px;">If you have any questions, feel free to contact the organizer.</p>
        </div>
      `;

      await sendEmail(
        registration.teamEmail,
        `Registration Confirmed - ${hackathon.name}`,
        teamConfirmationEmail
      );

      // Send notification to hackathon organizer
      const organizerNotificationEmail = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Team Registration</h2>
          <p>A new team has registered for your hackathon "<strong>${hackathon.name}</strong>".</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #334155; margin-top: 0;">Team Details:</h3>
            <ul style="color: #64748b;">
              <li><strong>Team Name:</strong> ${registration.teamName}</li>
              <li><strong>Team Leader:</strong> ${registration.teamLeader.name}</li>
              <li><strong>Email:</strong> ${registration.teamLeader.email}</li>
              <li><strong>Phone:</strong> ${registration.teamLeader.phone}</li>
              <li><strong>College:</strong> ${registration.collegeName}</li>
              <li><strong>Team Size:</strong> ${1 + (registration.members?.length || 0)} members</li>
            </ul>
            
            ${registration.members && registration.members.length > 0 ? `
              <h4 style="color: #334155;">Team Members:</h4>
              <ul style="color: #64748b;">
                ${registration.members.map(member => `
                  <li>${member.name} (${member.email})</li>
                `).join('')}
              </ul>
            ` : ''}
          </div>

          <p>You can view all registrations and manage your hackathon from your organizer dashboard.</p>
          <p style="color: #64748b; font-size: 14px;">Registration ID: ${registrationId}</p>
        </div>
      `;

      await sendEmail(
        hackathon.createdBy,
        `New Registration - ${hackathon.name}`,
        organizerNotificationEmail
      );

      console.log(`Registration notifications sent for team: ${registration.teamName}`);
      return null;
    } catch (error) {
      console.error('Error in onRegistrationCreated:', error);
      return null;
    }
  });

// HTTP function to export registrations as CSV
exports.exportRegistrations = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      const hackathonId = req.query.hackathonId;
      const userEmail = req.query.userEmail;

      if (!hackathonId || !userEmail) {
        return res.status(400).json({ error: 'hackathonId and userEmail are required' });
      }

      // Verify user is the organizer
      const hackathonDoc = await db.collection('hackathons').doc(hackathonId).get();
      if (!hackathonDoc.exists) {
        return res.status(404).json({ error: 'Hackathon not found' });
      }
      if (hackathonDoc.data().createdBy !== userEmail) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Get registrations
      const registrationsSnapshot = await db
        .collection('registrations')
        .where('hackathonId', '==', hackathonId)
        .orderBy('registeredAt', 'desc')
        .get();

      if (registrationsSnapshot.empty) {
        return res.status(404).json({ error: 'No registrations found' });
      }

      // Convert to CSV format
      const csvHeaders = [
        'Registration ID',
        'Team Name',
        'Team Leader Name',
        'Team Leader Email',
        'Team Leader Phone',
        'Team Leader GitHub',
        'College',
        'Team Size',
        'Member 1 Name',
        'Member 1 Email',
        'Member 1 Phone',
        'Member 1 GitHub',
        'Member 2 Name',
        'Member 2 Email',
        'Member 2 Phone',
        'Member 2 GitHub',
        'Member 3 Name',
        'Member 3 Email',
        'Member 3 Phone',
        'Member 3 GitHub',
        'Member 4 Name',
        'Member 4 Email',
        'Member 4 Phone',
        'Member 4 GitHub',
        'Registration Date',
        'Has Uploaded File'
      ];

      const csvData = registrationsSnapshot.docs.map(doc => {
        const reg = doc.data();
        const members = reg.members || [];
        
        // Pad members array to handle up to 4 additional members
        while (members.length < 4) {
          members.push({ name: '', email: '', phone: '', github: '' });
        }

        return [
          doc.id,
          reg.teamName || '',
          reg.teamLeader.name || '',
          reg.teamLeader.email || '',
          reg.teamLeader.phone || '',
          reg.teamLeader.github || '',
          reg.collegeName || '',
          1 + (reg.members?.length || 0),
          members[0].name || '',
          members[0].email || '',
          members[0].phone || '',
          members[0].github || '',
          members[1].name || '',
          members[1].email || '',
          members[1].phone || '',
          members[1].github || '',
          members[2].name || '',
          members[2].email || '',
          members[2].phone || '',
          members[2].github || '',
          members[3].name || '',
          members[3].email || '',
          members[3].phone || '',
          members[3].github || '',
          new Date(reg.registeredAt).toLocaleString(),
          reg.uploadedFile ? 'Yes' : 'No'
        ];
      });

      // Create CSV content
      const csvContent = [csvHeaders, ...csvData]
        .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      const hackathonName = hackathonDoc.data().name.replace(/[^a-zA-Z0-9]/g, '_');
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${hackathonName}_registrations_${timestamp}.csv`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csvContent);
    } catch (error) {
      console.error('Error exporting registrations:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

// HTTP function to validate team registration data
exports.validateRegistration = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const { hackathonId, teamEmail, teamData } = req.body;

      if (!hackathonId || !teamEmail || !teamData) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if hackathon exists and is active
      const hackathonDoc = await db.collection('hackathons').doc(hackathonId).get();
      if (!hackathonDoc.exists) {
        return res.status(404).json({ error: 'Hackathon not found' });
      }

      const hackathon = hackathonDoc.data();
      
      // Check if hackathon date has passed
      const hackathonDate = new Date(hackathon.date);
      const currentDate = new Date();
      if (hackathonDate < currentDate) {
        return res.status(400).json({ error: 'Registration closed - hackathon date has passed' });
      }

      // Check if team already registered
      const existingRegSnapshot = await db
        .collection('registrations')
        .where('hackathonId', '==', hackathonId)
        .where('teamEmail', '==', teamEmail)
        .get();

      if (!existingRegSnapshot.empty) {
        return res.status(409).json({ error: 'Team already registered for this hackathon' });
      }

      // Check for duplicate team name
      const duplicateTeamSnapshot = await db
        .collection('registrations')
        .where('hackathonId', '==', hackathonId)
        .where('teamName', '==', teamData.teamName)
        .get();

      if (!duplicateTeamSnapshot.empty) {
        return res.status(409).json({ error: 'Team name already taken for this hackathon' });
      }

      // Check team size limit
      const teamSize = 1 + (teamData.members?.length || 0);
      if (teamSize > hackathon.maxTeamSize) {
        return res.status(400).json({ 
          error: `Team size exceeds limit. Maximum ${hackathon.maxTeamSize} members allowed.` 
        });
      }

      // Validate required fields
      const errors = [];
      if (!teamData.teamName || teamData.teamName.trim().length === 0) {
        errors.push('Team name is required');
      }
      if (!teamData.collegeName || teamData.collegeName.trim().length === 0) {
        errors.push('College name is required');
      }
      if (!teamData.teamLeader || !teamData.teamLeader.name || teamData.teamLeader.name.trim().length === 0) {
        errors.push('Team leader name is required');
      }
      if (!teamData.teamLeader || !teamData.teamLeader.email || teamData.teamLeader.email.trim().length === 0) {
        errors.push('Team leader email is required');
      }
      if (!teamData.teamLeader || !teamData.teamLeader.phone || teamData.teamLeader.phone.trim().length === 0) {
        errors.push('Team leader phone is required');
      }

      // Validate email formats
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (teamData.teamLeader && teamData.teamLeader.email && !emailRegex.test(teamData.teamLeader.email)) {
        errors.push('Invalid team leader email format');
      }

      // Validate member data
      if (teamData.members) {
        teamData.members.forEach((member, index) => {
          if (!member.name || member.name.trim().length === 0) {
            errors.push(`Member ${index + 1} name is required`);
          }
          if (!member.email || member.email.trim().length === 0) {
            errors.push(`Member ${index + 1} email is required`);
          } else if (!emailRegex.test(member.email)) {
            errors.push(`Invalid email format for member ${index + 1}`);
          }
          if (!member.phone || member.phone.trim().length === 0) {
            errors.push(`Member ${index + 1} phone is required`);
          }
        });
      }

      if (errors.length > 0) {
        return res.status(400).json({ error: 'Validation failed', details: errors });
      }

      res.json({ 
        valid: true, 
        message: 'Registration data is valid',
        hackathonName: hackathon.name,
        maxTeamSize: hackathon.maxTeamSize 
      });
    } catch (error) {
      console.error('Error validating registration:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

// HTTP function to get registration details
exports.getRegistrationDetails = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      const registrationId = req.query.registrationId;
      const userEmail = req.query.userEmail;

      if (!registrationId || !userEmail) {
        return res.status(400).json({ error: 'registrationId and userEmail are required' });
      }

      const registrationDoc = await db.collection('registrations').doc(registrationId).get();
      
      if (!registrationDoc.exists) {
        return res.status(404).json({ error: 'Registration not found' });
      }

      const registration = registrationDoc.data();
      
      // Check if user has permission to view this registration
      // (team leader or hackathon organizer)
      const hackathonDoc = await db.collection('hackathons').doc(registration.hackathonId).get();
      const isOrganizer = hackathonDoc.exists && hackathonDoc.data().createdBy === userEmail;
      const isTeamLeader = registration.teamEmail === userEmail;

      if (!isOrganizer && !isTeamLeader) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      res.json({
        id: registrationDoc.id,
        ...registration,
        hackathon: hackathonDoc.exists ? hackathonDoc.data() : null
      });
    } catch (error) {
      console.error('Error getting registration details:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});