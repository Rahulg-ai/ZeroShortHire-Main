// functions/src/hackathonFunctions.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

const db = admin.firestore();
const storage = admin.storage();

/**
 * Triggered when a new hackathon is created
 */
exports.onHackathonCreated = functions.firestore
  .document('hackathons/{hackathonId}')
  .onCreate(async (snap, context) => {
    const hackathonData = snap.data();
    const hackathonId = context.params.hackathonId;

    console.log(`New hackathon created: ${hackathonId}`);

    try {
      // Send notification emails to sponsors (if you have email service set up)
      // You can implement this based on your email service (SendGrid, etc.)
      
      // Log the creation for analytics
      await db.collection('analytics').add({
        event: 'hackathon_created',
        hackathonId: hackathonId,
        hackathonName: hackathonData.name,
        createdBy: hackathonData.createdBy,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`Analytics logged for hackathon creation: ${hackathonId}`);
    } catch (error) {
      console.error(`Error in onHackathonCreated for ${hackathonId}:`, error);
    }
  });

/**
 * Get hackathon statistics
 */
exports.getHackathonStats = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      const hackathonId = req.query.hackathonId;
      
      if (!hackathonId) {
        return res.status(400).json({
          error: 'Hackathon ID is required'
        });
      }

      // Get hackathon document
      const hackathonDoc = await db.collection('hackathons').doc(hackathonId).get();
      
      if (!hackathonDoc.exists) {
        return res.status(404).json({
          error: 'Hackathon not found'
        });
      }

      // Get registration count
      const registrationsQuery = db.collection('registrations')
        .where('hackathonId', '==', hackathonId);
      const registrationsSnapshot = await registrationsQuery.get();

      const stats = {
        totalRegistrations: registrationsSnapshot.size,
        hackathonData: hackathonDoc.data()
      };

      res.status(200).json(stats);
    } catch (error) {
      console.error('Error getting hackathon stats:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  });
});

/**
 * Update hackathon
 */
exports.updateHackathon = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    if (req.method !== 'PUT' && req.method !== 'PATCH') {
      return res.status(405).json({
        error: 'Method not allowed'
      });
    }

    try {
      // Verify authentication
      const token = req.headers.authorization?.split('Bearer ')[1];
      if (!token) {
        return res.status(401).json({
          error: 'Authentication token is required'
        });
      }

      let decodedToken;
      try {
        decodedToken = await admin.auth().verifyIdToken(token);
      } catch (error) {
        return res.status(401).json({
          error: 'Invalid authentication token'
        });
      }

      const hackathonId = req.body.hackathonId;
      const updateData = req.body.updateData;

      if (!hackathonId || !updateData) {
        return res.status(400).json({
          error: 'Hackathon ID and update data are required'
        });
      }

      // Check if hackathon exists and verify ownership
      const hackathonRef = db.collection('hackathons').doc(hackathonId);
      const hackathonDoc = await hackathonRef.get();

      if (!hackathonDoc.exists) {
        return res.status(404).json({
          error: 'Hackathon not found'
        });
      }

      const hackathonData = hackathonDoc.data();
      
      if (hackathonData.createdBy !== decodedToken.email) {
        return res.status(403).json({
          error: 'You can only update hackathons you created'
        });
      }

      // Update the hackathon
      await hackathonRef.update({
        ...updateData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      res.status(200).json({
        success: true,
        message: 'Hackathon updated successfully'
      });

    } catch (error) {
      console.error('Error updating hackathon:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  });
});

/**
 * Delete hackathon and all associated data
 */
exports.deleteHackathon = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    if (req.method !== 'DELETE') {
      return res.status(405).json({
        error: 'Method not allowed',
        message: 'Only DELETE method is supported'
      });
    }

    try {
      // Extract hackathon ID from URL path or request body
      const hackathonId = req.params.hackathonId || req.body.hackathonId || req.query.hackathonId;
      
      if (!hackathonId) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Hackathon ID is required'
        });
      }

      // Verify authentication
      const token = req.headers.authorization?.split('Bearer ')[1];
      if (!token) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication token is required'
        });
      }

      let decodedToken;
      try {
        decodedToken = await admin.auth().verifyIdToken(token);
      } catch (error) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid authentication token'
        });
      }

      console.log(`User ${decodedToken.email} attempting to delete hackathon: ${hackathonId}`);

      // Get hackathon document to verify it exists and check ownership
      const hackathonRef = db.collection('hackathons').doc(hackathonId);
      const hackathonDoc = await hackathonRef.get();

      if (!hackathonDoc.exists) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Hackathon not found'
        });
      }

      const hackathonData = hackathonDoc.data();

      // Verify ownership
      if (hackathonData.createdBy !== decodedToken.email) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only delete hackathons you created'
        });
      }

      // Start deletion process
      const batch = db.batch();
      const filesToDelete = [];

      // Get all registrations for this hackathon
      const registrationsQuery = db.collection('registrations')
        .where('hackathonId', '==', hackathonId);
      
      const registrationsSnapshot = await registrationsQuery.get();
      
      console.log(`Found ${registrationsSnapshot.size} registrations to delete`);

      // Collect hackathon files
      if (hackathonData.files && Array.isArray(hackathonData.files)) {
        hackathonData.files.forEach(file => {
          if (file.path) {
            filesToDelete.push(file.path);
          }
        });
      }

      // Delete all registrations and collect their files
      registrationsSnapshot.forEach(doc => {
        const registrationData = doc.data();
        
        // Add registration to batch delete
        batch.delete(doc.ref);
        
        // Collect files from registrations
        if (registrationData.uploadedFile && registrationData.uploadedFile.path) {
          filesToDelete.push(registrationData.uploadedFile.path);
        }
      });

      // Delete the hackathon document
      batch.delete(hackathonRef);

      // Execute the batch delete
      await batch.commit();
      console.log('Batch delete completed successfully');

      // Delete files from storage (run after database cleanup)
      const fileDeletePromises = filesToDelete.map(async (filePath) => {
        try {
          await storage.bucket().file(filePath).delete();
          console.log(`Deleted file: ${filePath}`);
        } catch (error) {
          console.error(`Failed to delete file ${filePath}:`, error.message);
          // Don't fail the entire operation if a file can't be deleted
        }
      });

      await Promise.allSettled(fileDeletePromises);
      
      // Log the deletion for audit purposes
      await db.collection('audit_logs').add({
        action: 'DELETE_HACKATHON',
        hackathonId: hackathonId,
        hackathonName: hackathonData.name,
        deletedAt: admin.firestore.FieldValue.serverTimestamp(),
        deletedBy: decodedToken.email,
        deletedByUid: decodedToken.uid,
        registrationsDeleted: registrationsSnapshot.size,
        filesDeleted: filesToDelete.length
      });

      // Return success response
      return res.status(200).json({
        success: true,
        message: 'Hackathon deleted successfully',
        details: {
          hackathonId: hackathonId,
          registrationsDeleted: registrationsSnapshot.size,
          filesDeleted: filesToDelete.length
        }
      });

    } catch (error) {
      console.error('Error deleting hackathon:', error);
      
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete hackathon',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });
});

/**
 * Cleanup function that runs when a hackathon is deleted
 * This is a backup cleanup in case the HTTP function misses something
 */
exports.onHackathonDeleted = functions.firestore
  .document('hackathons/{hackathonId}')
  .onDelete(async (snap, context) => {
    const hackathonId = context.params.hackathonId;
    const hackathonData = snap.data();
    
    console.log(`Hackathon ${hackathonId} deleted, running cleanup function`);

    try {
      // Check if there are still any registrations (shouldn't be, but just in case)
      const registrationsQuery = db.collection('registrations')
        .where('hackathonId', '==', hackathonId);
      
      const registrationsSnapshot = await registrationsQuery.get();
      
      if (registrationsSnapshot.size > 0) {
        console.log(`Found ${registrationsSnapshot.size} orphaned registrations, cleaning up...`);
        
        const batch = db.batch();
        const filesToDelete = [];
        
        registrationsSnapshot.forEach(doc => {
          const registrationData = doc.data();
          batch.delete(doc.ref);
          
          if (registrationData.uploadedFile && registrationData.uploadedFile.path) {
            filesToDelete.push(registrationData.uploadedFile.path);
          }
        });

        await batch.commit();

        // Delete files
        const fileDeletePromises = filesToDelete.map(async (filePath) => {
          try {
            await storage.bucket().file(filePath).delete();
            console.log(`Cleaned up orphaned file: ${filePath}`);
          } catch (error) {
            console.error(`Failed to delete orphaned file ${filePath}:`, error.message);
          }
        });

        await Promise.allSettled(fileDeletePromises);
      }

      console.log(`Cleanup completed for hackathon ${hackathonId}`);
      
    } catch (error) {
      console.error(`Error in cleanup for hackathon ${hackathonId}:`, error);
    }
  });