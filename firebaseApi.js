// firebaseApi.js - Service for Firebase Functions API calls
import { getAuth } from 'firebase/auth';

class FirebaseApiService {
  constructor() {
    // Get your Firebase project URL from the Firebase console
    // It should be something like: https://us-central1-your-project-id.cloudfunctions.net
    this.baseURL = process.env.REACT_APP_FIREBASE_FUNCTIONS_URL || 'https://us-central1-zeroshothire-1d25d.cloudfunctions.net';
  }

  // Get auth token for authenticated requests
  async getAuthToken() {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    return await user.getIdToken();
  }

  // Generic API call method
  async apiCall(endpoint, method = 'GET', data = null) {
    try {
      const token = await this.getAuthToken();
      
      const config = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      if (data && method !== 'GET') {
        config.body = JSON.stringify(data);
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // File upload method (for resume and avatar)
  async uploadFile(endpoint, file) {
    try {
      const token = await this.getAuthToken();
      
      // Convert file to base64
      const fileBuffer = await this.fileToBase64(file);
      
      const config = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fileBuffer: fileBuffer.split(',')[1], // Remove data:image/png;base64, prefix
          fileName: file.name,
          mimeType: file.type
        })
      };

      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error(`File upload failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Helper method to convert file to base64
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  // Profile API methods
  async saveProfile(profileData) {
    return await this.apiCall('/saveUserProfile', 'POST', profileData);
  }

  async getProfile() {
    return await this.apiCall('/getUserProfile', 'GET');
  }

  async uploadResume(file) {
    return await this.uploadFile('/uploadResume', file);
  }

  async uploadAvatar(file) {
    return await this.uploadFile('/uploadAvatar', file);
  }

  async searchColleges(searchTerm = '') {
    const endpoint = `/searchColleges${searchTerm ? `?searchTerm=${encodeURIComponent(searchTerm)}` : ''}`;
    return await this.apiCall(endpoint, 'GET');
  }

  async deleteProfile() {
    return await this.apiCall('/deleteUserProfile', 'DELETE');
  }
}

export default new FirebaseApiService();