const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

// Helper function to validate user authentication
const validateAuth = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new Error('No authorization header');
  }
  
  const token = authHeader.split('Bearer ')[1];
  if (!token) {
    throw new Error('No token provided');
  }
  
  const decodedToken = await admin.auth().verifyIdToken(token);
  return decodedToken;
};

// Function to create or update user profile
exports.saveUserProfile = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const decodedToken = await validateAuth(req);
      const userId = decodedToken.uid;
      const profileData = req.body;

      // Validate required fields
      const requiredFields = ['fullName', 'college', 'yearOfStudy', 'course'];
      for (const field of requiredFields) {
        if (!profileData[field]) {
          return res.status(400).json({ error: `Missing required field: ${field}` });
        }
      }

      // Clean up the profile data - remove any client-side only fields
      const cleanProfileData = {
        fullName: profileData.fullName,
        email: profileData.email || decodedToken.email,
        college: profileData.college,
        customCollege: profileData.customCollege || '',
        yearOfStudy: profileData.yearOfStudy,
        course: profileData.course,
        customCourse: profileData.customCourse || '',
        pincode: profileData.pincode || '',
        address: profileData.address || '',
        city: profileData.city || '',
        state: profileData.state || '',
        technicalSkills: profileData.technicalSkills || [],
        softSkills: profileData.softSkills || [],
        customSkills: profileData.customSkills || [],
        avatarType: profileData.avatarType || 'dicebear',
        avatarSeed: profileData.avatarSeed || 'Jude',
        uploadedAvatar: profileData.uploadedAvatar || null,
        resume: profileData.resume || null,
        resumeFileName: profileData.resumeFileName || '',
        aboutMe: profileData.aboutMe || ''
      };

      // Prepare profile data with metadata
      const profile = {
        ...cleanProfileData,
        userId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      // Check if profile exists
      const existingProfile = await db.collection('profiles').doc(userId).get();
      if (!existingProfile.exists) {
        profile.createdAt = admin.firestore.FieldValue.serverTimestamp();
      }

      // Save to Firestore
      await db.collection('profiles').doc(userId).set(profile, { merge: true });

      // Update user record with profile completion status
      try {
        await admin.auth().updateUser(userId, {
          displayName: cleanProfileData.fullName
        });
      } catch (authError) {
        console.error('Failed to update user display name:', authError);
        // Don't fail the entire request if this fails
      }

      res.status(200).json({ 
        success: true, 
        message: 'Profile saved successfully',
        profileId: userId
      });

    } catch (error) {
      console.error('Error saving profile:', error);
      res.status(500).json({ 
        error: 'Failed to save profile', 
        details: error.message 
      });
    }
  });
});

// Function to get user profile
exports.getUserProfile = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const decodedToken = await validateAuth(req);
      const userId = decodedToken.uid;

      const profileDoc = await db.collection('profiles').doc(userId).get();
      
      if (!profileDoc.exists) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      const profileData = profileDoc.data();
      
      // Remove sensitive fields if any
      delete profileData.internalNotes;
      
      res.status(200).json({
        success: true,
        profile: profileData
      });

    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ 
        error: 'Failed to fetch profile', 
        details: error.message 
      });
    }
  });
});

// Function to upload resume
exports.uploadResume = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const decodedToken = await validateAuth(req);
      const userId = decodedToken.uid;

      const { fileBuffer, fileName, mimeType } = req.body;
      
      if (!fileBuffer || !fileName) {
        return res.status(400).json({ error: 'File data is required' });
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(mimeType)) {
        return res.status(400).json({ error: 'Invalid file type. Only PDF, DOC, and DOCX files are allowed.' });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = fileName.split('.').pop();
      const uniqueFileName = `resumes/${userId}/${timestamp}_resume.${fileExtension}`;

      // Convert base64 to buffer
      const buffer = Buffer.from(fileBuffer, 'base64');
      
      // Validate file size (5MB limit)
      if (buffer.length > 5 * 1024 * 1024) {
        return res.status(400).json({ error: 'File size too large. Maximum 5MB allowed.' });
      }

      // Upload to Firebase Storage
      const file = bucket.file(uniqueFileName);
      
      await file.save(buffer, {
        metadata: {
          contentType: mimeType,
          metadata: {
            uploadedBy: userId,
            originalName: fileName,
            uploadTimestamp: timestamp.toString()
          }
        }
      });

      // Make file publicly accessible
      await file.makePublic();

      const fileUrl = `https://storage.googleapis.com/${bucket.name}/${uniqueFileName}`;

      // Update user profile with resume URL
      await db.collection('profiles').doc(userId).update({
        resume: fileUrl,
        resumeFileName: fileName,
        resumeUploadedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      res.status(200).json({
        success: true,
        fileUrl,
        fileName,
        message: 'Resume uploaded successfully'
      });

    } catch (error) {
      console.error('Error uploading resume:', error);
      res.status(500).json({ 
        error: 'Failed to upload resume', 
        details: error.message 
      });
    }
  });
});

// Function to upload avatar
exports.uploadAvatar = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const decodedToken = await validateAuth(req);
      const userId = decodedToken.uid;

      const { fileBuffer, fileName, mimeType } = req.body;
      
      if (!fileBuffer || !fileName) {
        return res.status(400).json({ error: 'File data is required' });
      }

      // Validate file type
      if (!mimeType.startsWith('image/')) {
        return res.status(400).json({ error: 'File must be an image' });
      }

      // Convert base64 to buffer
      const buffer = Buffer.from(fileBuffer, 'base64');
      
      // Validate file size (2MB limit for images)
      if (buffer.length > 2 * 1024 * 1024) {
        return res.status(400).json({ error: 'File size too large. Maximum 2MB allowed for images.' });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = fileName.split('.').pop();
      const uniqueFileName = `avatars/${userId}/${timestamp}_avatar.${fileExtension}`;

      // Upload to Firebase Storage
      const file = bucket.file(uniqueFileName);
      
      await file.save(buffer, {
        metadata: {
          contentType: mimeType,
          metadata: {
            uploadedBy: userId,
            originalName: fileName,
            uploadTimestamp: timestamp.toString()
          }
        }
      });

      await file.makePublic();

      const fileUrl = `https://storage.googleapis.com/${bucket.name}/${uniqueFileName}`;

      // Update user profile with avatar URL
      await db.collection('profiles').doc(userId).update({
        uploadedAvatar: fileUrl,
        avatarType: 'upload',
        avatarUploadedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      res.status(200).json({
        success: true,
        fileUrl,
        message: 'Avatar uploaded successfully'
      });

    } catch (error) {
      console.error('Error uploading avatar:', error);
      res.status(500).json({ 
        error: 'Failed to upload avatar', 
        details: error.message 
      });
    }
  });
});

// Function to search colleges
exports.searchColleges = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      const { searchTerm } = req.query;
      
      // Enhanced colleges list for West Bengal
      const colleges = [
        "Other",
        "Institute of Engineering & Management (IEM)",
        "Heritage Institute of Technology",
        "Haldia Institute of Technology (HIT)",
        "JIS College of Engineering",
        "Narula Institute of Technology",
        "Netaji Subhash Engineering College (NSEC)",
        "BP Poddar Institute of Management & Technology (BPPIMT)",
        "Supreme Knowledge Foundation Group of Institutions (SKF)",
        "St. Thomas' College of Engineering & Technology (STCET)",
        "Techno India University",
        "University of Engineering & Management (UEM)",
        "Techno Main Salt Lake",
        "Academy of Technology",
        "Meghnad Saha Institute of Technology (MSIT)",
        "Future Institute of Engineering and Management (FIEM)",
        "Guru Nanak Institute of Technology (GNIT)",
        "Kalyani Government Engineering College",
        "Government College of Engineering and Ceramic Technology",
        "Jalpaiguri Government Engineering College"
      ];

      let filteredColleges = colleges;

      if (searchTerm && searchTerm.length >= 2) {
        const term = searchTerm.toLowerCase().trim();
        filteredColleges = colleges
          .filter(college => college.toLowerCase().includes(term))
          .sort((a, b) => {
            const aLower = a.toLowerCase();
            const bLower = b.toLowerCase();
            
            // Prioritize exact matches and starts-with matches
            if (aLower.startsWith(term) && !bLower.startsWith(term)) return -1;
            if (!aLower.startsWith(term) && bLower.startsWith(term)) return 1;
            
            return a.localeCompare(b);
          });
      }

      res.status(200).json({
        success: true,
        colleges: filteredColleges.slice(0, 20) // Limit results to 20
      });

    } catch (error) {
      console.error('Error searching colleges:', error);
      res.status(500).json({ 
        error: 'Failed to search colleges', 
        details: error.message 
      });
    }
  });
});

// Function to delete user profile and associated files
exports.deleteUserProfile = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const decodedToken = await validateAuth(req);
      const userId = decodedToken.uid;

      // Get profile to clean up storage files
      const profileDoc = await db.collection('profiles').doc(userId).get();
      
      if (profileDoc.exists) {
        const profileData = profileDoc.data();
        
        // Delete associated files from storage
        const filesToDelete = [];
        
        if (profileData.resume) {
          const resumePath = profileData.resume.split(`${bucket.name}/`)[1];
          if (resumePath) {
            filesToDelete.push(bucket.file(resumePath).delete().catch(console.error));
          }
        }
        
        if (profileData.uploadedAvatar) {
          const avatarPath = profileData.uploadedAvatar.split(`${bucket.name}/`)[1];
          if (avatarPath) {
            filesToDelete.push(bucket.file(avatarPath).delete().catch(console.error));
          }
        }

        // Wait for file deletions to complete
        await Promise.allSettled(filesToDelete);
      }

      // Delete profile document
      await db.collection('profiles').doc(userId).delete();

      res.status(200).json({
        success: true,
        message: 'Profile deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting profile:', error);
      res.status(500).json({ 
        error: 'Failed to delete profile', 
        details: error.message 
      });
    }
  });
});