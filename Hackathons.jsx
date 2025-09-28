import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Users, Tag, Plus, X, ExternalLink, Mail, Globe, User, Eye, Settings, FileText, Download, Phone, Trash2, AlertTriangle } from 'lucide-react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  deleteDoc, 
  doc, 
  getDoc,
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

// Real Firebase services
const firebaseServices = {
  hackathonServices: {
    create: async (hackathonData, userEmail) => {
      try {
        const docRef = await addDoc(collection(db, 'hackathons'), {
          ...hackathonData,
          createdAt: serverTimestamp(),
          createdBy: userEmail,
          registrationCount: 0
        });
        
        return {
          id: docRef.id,
          ...hackathonData,
          createdAt: new Date().toISOString(),
          createdBy: userEmail
        };
      } catch (error) {
        console.error('Error creating hackathon:', error);
        throw new Error('Failed to create hackathon');
      }
    },
    
    getAll: async (limitCount = 20) => {
      try {
        const q = query(
          collection(db, 'hackathons'),
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        );
        const querySnapshot = await getDocs(q);
        
        const hackathons = [];
        querySnapshot.forEach((doc) => {
          hackathons.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString()
          });
        });
        
        return { hackathons };
      } catch (error) {
        console.error('Error fetching hackathons:', error);
        throw new Error('Failed to fetch hackathons');
      }
    },
    
    getByCreator: async (creatorEmail) => {
      try {
        const q = query(
          collection(db, 'hackathons'),
          where('createdBy', '==', creatorEmail),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        
        const hackathons = [];
        querySnapshot.forEach((doc) => {
          hackathons.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString()
          });
        });
        
        return hackathons;
      } catch (error) {
        console.error('Error fetching organizer hackathons:', error);
        throw new Error('Failed to fetch organizer hackathons');
      }
    },
    
    delete: async (hackathonId) => {
      try {
        // First, delete all registrations for this hackathon
        const registrationsQuery = query(
          collection(db, 'registrations'),
          where('hackathonId', '==', hackathonId)
        );
        const registrationsSnapshot = await getDocs(registrationsQuery);
        
        // Delete all registration documents and their associated files
        const deletePromises = [];
        registrationsSnapshot.forEach((regDoc) => {
          const regData = regDoc.data();
          
          // Delete uploaded files from storage if they exist
          if (regData.uploadedFile?.path) {
            const fileRef = ref(storage, regData.uploadedFile.path);
            deletePromises.push(deleteObject(fileRef).catch(() => {})); // Ignore file deletion errors
          }
          
          // Delete registration document
          deletePromises.push(deleteDoc(doc(db, 'registrations', regDoc.id)));
        });
        
        // Wait for all registrations and files to be deleted
        await Promise.all(deletePromises);
        
        // Finally, delete the hackathon document
        await deleteDoc(doc(db, 'hackathons', hackathonId));
        
        return { success: true };
      } catch (error) {
        console.error('Error deleting hackathon:', error);
        throw new Error('Failed to delete hackathon');
      }
    }
  },
  
  registrationServices: {
    create: async (registrationData) => {
      try {
        const docRef = await addDoc(collection(db, 'registrations'), {
          ...registrationData,
          registeredAt: serverTimestamp()
        });
        
        return {
          id: docRef.id,
          ...registrationData,
          registeredAt: new Date().toISOString()
        };
      } catch (error) {
        console.error('Error creating registration:', error);
        throw new Error('Failed to create registration');
      }
    },
    
    getByHackathon: async (hackathonId) => {
      try {
        const q = query(
          collection(db, 'registrations'),
          where('hackathonId', '==', hackathonId),
          orderBy('registeredAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        
        const registrations = [];
        querySnapshot.forEach((doc) => {
          registrations.push({
            id: doc.id,
            ...doc.data(),
            registeredAt: doc.data().registeredAt?.toDate()?.toISOString() || new Date().toISOString()
          });
        });
        
        return registrations;
      } catch (error) {
        console.error('Error fetching registrations:', error);
        throw new Error('Failed to fetch registrations');
      }
    },
    
    getCountByHackathon: async (hackathonId) => {
      try {
        const q = query(
          collection(db, 'registrations'),
          where('hackathonId', '==', hackathonId)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.size;
      } catch (error) {
        console.error('Error fetching registration count:', error);
        return 0;
      }
    },
    
    exportRegistrations: async (hackathonId) => {
      try {
        const registrations = await firebaseServices.registrationServices.getByHackathon(hackathonId);
        
        // Create CSV content
        const headers = ['Team Name', 'Team Leader', 'Email', 'Phone', 'College', 'Members', 'Registered At'];
        const csvData = [
          headers.join(','),
          ...registrations.map(reg => [
            `"${reg.teamName}"`,
            `"${reg.teamLeader.name}"`,
            `"${reg.teamLeader.email}"`,
            `"${reg.teamLeader.phone}"`,
            `"${reg.collegeName}"`,
            1 + (reg.members?.length || 0),
            `"${firebaseServices.utils.formatDate(reg.registeredAt)}"`
          ].join(','))
        ].join('\n');
        
        // Create and download file
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `registrations_${hackathonId}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        return { success: true, count: registrations.length };
      } catch (error) {
        console.error('Error exporting registrations:', error);
        throw new Error('Failed to export registrations');
      }
    }
  },
  
  utils: {
    formatDate: (date) => {
      const d = typeof date === 'string' ? new Date(date) : date;
      return d.toLocaleDateString();
    },
    
    formatTime: (date) => {
      const d = typeof date === 'string' ? new Date(date) : date;
      return d.toLocaleTimeString();
    },
    
    validateEmail: (email) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },
    
    formatFileSize: (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
  },
  
  fileServices: {
    validateFile: (file) => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = ['.pdf', '.ppt', '.pptx', '.doc', '.docx'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      
      if (file.size > maxSize) {
        return { isValid: false, errors: ['File size exceeds 10MB limit'] };
      }
      
      if (!allowedTypes.includes(fileExtension)) {
        return { isValid: false, errors: ['Invalid file type. Only PDF, PPT, DOC files allowed'] };
      }
      
      return { isValid: true, errors: [] };
    },
    
    uploadFile: async (file, hackathonId, teamName) => {
      try {
        const filePath = `hackathons/${hackathonId}/teams/${teamName}/${file.name}`;
        const fileRef = ref(storage, filePath);
        
        // Upload file to Firebase Storage
        const snapshot = await uploadBytes(fileRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        return {
          name: file.name,
          size: file.size,
          type: file.type,
          url: downloadURL,
          path: filePath
        };
      } catch (error) {
        console.error('Error uploading file:', error);
        throw new Error('Failed to upload file');
      }
    }
  }
};

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ isOpen, onClose, hackathon, onConfirm, loading }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-800 rounded-xl p-6 w-full max-w-md"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-600 bg-opacity-20 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Delete Hackathon</h3>
            <p className="text-slate-400 text-sm">This action cannot be undone</p>
          </div>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-slate-300 mb-3">
            Are you sure you want to delete the hackathon:
          </p>
          <div className="bg-slate-700 rounded-lg p-3 mb-3">
            <p className="text-white font-medium">{hackathon?.name}</p>
            <p className="text-slate-400 text-sm">
              {hackathon?.date} at {hackathon?.time}
            </p>
          </div>
          <div className="bg-red-900 bg-opacity-30 border border-red-700 rounded-lg p-3">
            <p className="text-red-200 text-sm">
              <strong>Warning:</strong> This will permanently delete:
            </p>
            <ul className="text-red-300 text-sm mt-2 space-y-1">
              <li>• The hackathon event</li>
              <li>• All team registrations</li>
              <li>• Uploaded files and documents</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
            {loading ? 'Deleting...' : 'Delete Hackathon'}
          </motion.button>
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Registrations Modal Component
const RegistrationsModal = ({ isOpen, onClose, hackathon }) => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('registeredAt');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (isOpen && hackathon) {
      loadRegistrations();
    }
  }, [isOpen, hackathon]);

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const regsData = await firebaseServices.registrationServices.getByHackathon(hackathon.id);
      setRegistrations(regsData);
    } catch (error) {
      console.error('Error loading registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileDownload = (file, teamName) => {
    if (file && file.url) {
      window.open(file.url, '_blank');
    } else {
      console.log(`No file available for team ${teamName}`);
    }
  };

  const handleExportRegistrations = async () => {
    setExporting(true);
    try {
      const result = await firebaseServices.registrationServices.exportRegistrations(hackathon.id);
      console.log(`Exported ${result.count} registrations`);
    } catch (error) {
      console.error('Error exporting registrations:', error);
      alert('Failed to export registrations');
    } finally {
      setExporting(false);
    }
  };

  const filteredAndSortedRegistrations = registrations
    .filter(reg => 
      reg.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.teamLeader.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.collegeName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'teamName') return a.teamName.localeCompare(b.teamName);
      if (sortBy === 'collegeName') return a.collegeName.localeCompare(b.collegeName);
      if (sortBy === 'registeredAt') {
        const dateA = new Date(a.registeredAt);
        const dateB = new Date(b.registeredAt);
        return dateB - dateA;
      }
      return 0;
    });

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-800 rounded-xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Team Registrations</h2>
            <p className="text-slate-400 text-sm">{hackathon?.name} - {registrations.length} teams registered</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportRegistrations}
              disabled={exporting}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
            >
              {exporting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download size={16} />
              )}
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="p-4 border-b border-slate-700 bg-slate-750">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search teams, leaders, or colleges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-slate-300 text-sm">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="registeredAt">Registration Date</option>
                <option value="teamName">Team Name</option>
                <option value="collegeName">College</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-white text-lg">Loading registrations...</div>
            </div>
          ) : filteredAndSortedRegistrations.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-slate-400 text-lg mb-4">
                {searchTerm ? 'No teams match your search' : 'No teams registered yet'}
              </div>
              <p className="text-slate-500">
                {searchTerm ? 'Try adjusting your search terms' : 'Teams will appear here once they register for this hackathon'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700 text-left">
                    <th className="pb-3 text-slate-300 font-medium text-sm">#</th>
                    <th className="pb-3 text-slate-300 font-medium text-sm">Team</th>
                    <th className="pb-3 text-slate-300 font-medium text-sm">Team Leader</th>
                    <th className="pb-3 text-slate-300 font-medium text-sm">Contact</th>
                    <th className="pb-3 text-slate-300 font-medium text-sm">College</th>
                    <th className="pb-3 text-slate-300 font-medium text-sm">Members</th>
                    <th className="pb-3 text-slate-300 font-medium text-sm">Files</th>
                    <th className="pb-3 text-slate-300 font-medium text-sm">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedRegistrations.map((registration, index) => (
                    <motion.tr
                      key={registration.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="border-b border-slate-700 hover:bg-slate-750 group"
                    >
                      {/* Index */}
                      <td className="py-4 pr-4 text-slate-400 text-sm">
                        {index + 1}
                      </td>

                      {/* Team Info */}
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {registration.teamName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{registration.teamName}</p>
                            <p className="text-slate-400 text-xs">Team ID: {registration.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Team Leader */}
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-blue-400" />
                          <div>
                            <p className="text-white text-sm font-medium">{registration.teamLeader.name}</p>
                            {registration.teamLeader.github && (
                              <a 
                                href={registration.teamLeader.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 mt-1"
                              >
                                GitHub <ExternalLink size={10} />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-4 pr-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail size={12} className="text-slate-400" />
                            <span className="text-slate-300 text-xs">{registration.teamLeader.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone size={12} className="text-slate-400" />
                            <span className="text-slate-300 text-xs">{registration.teamLeader.phone}</span>
                          </div>
                        </div>
                      </td>

                      {/* College */}
                      <td className="py-4 pr-4">
                        <p className="text-slate-300 text-sm">{registration.collegeName}</p>
                      </td>

                      {/* Team Size */}
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-2">
                          <Users size={14} className="text-slate-400" />
                          <span className="text-white text-sm font-medium">
                            {1 + (registration.members?.length || 0)}
                          </span>
                          <span className="text-slate-400 text-xs">members</span>
                        </div>
                      </td>

                      {/* Uploaded Files */}
                      <td className="py-4 pr-4">
                        {registration.uploadedFile ? (
                          <button
                            onClick={() => handleFileDownload(registration.uploadedFile, registration.teamName)}
                            className="flex items-center gap-2 bg-blue-900 bg-opacity-50 hover:bg-opacity-70 text-blue-200 px-3 py-2 rounded-lg text-xs transition-colors group-hover:bg-opacity-60"
                          >
                            <FileText size={14} />
                            <span className="max-w-20 truncate">{registration.uploadedFile.name}</span>
                            <Download size={12} />
                          </button>
                        ) : (
                          <span className="text-slate-500 text-xs">No files</span>
                        )}
                      </td>

                      {/* Registration Date */}
                      <td className="py-4">
                        <p className="text-slate-300 text-xs">
                          {firebaseServices.utils.formatDate(registration.registeredAt)}
                        </p>
                        <p className="text-slate-500 text-xs">
                          {firebaseServices.utils.formatTime(registration.registeredAt)}
                        </p>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-slate-700 bg-slate-750">
          <div className="text-slate-400 text-sm">
            {filteredAndSortedRegistrations.length} of {registrations.length} teams
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="bg-slate-600 hover:bg-slate-700 text-white py-2 px-6 rounded-lg transition-colors"
          >
            Close
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Organizer Dashboard Component
const OrganizerDashboard = ({ onSuccess, onError }) => {
  const [user] = useAuthState(auth);
  const [organizerHackathons, setOrganizerHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHackathon, setSelectedHackathon] = useState(null);
  const [showRegistrations, setShowRegistrations] = useState(false);
  const [registrationCounts, setRegistrationCounts] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hackathonToDelete, setHackathonToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadOrganizerHackathons();
    }
  }, [user]);

  const loadOrganizerHackathons = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const hackathons = await firebaseServices.hackathonServices.getByCreator(user.email);
      setOrganizerHackathons(hackathons);
      
      // Load registration counts for each hackathon
      const counts = {};
      for (const hackathon of hackathons) {
        const count = await firebaseServices.registrationServices.getCountByHackathon(hackathon.id);
        counts[hackathon.id] = count;
      }
      setRegistrationCounts(counts);
    } catch (error) {
      console.error('Error loading organizer hackathons:', error);
      onError?.('Failed to load hackathons');
    } finally {
      setLoading(false);
    }
  };

  const handleViewRegistrations = (hackathon) => {
    setSelectedHackathon(hackathon);
    setShowRegistrations(true);
  };

  const handleDeleteClick = (hackathon) => {
    setHackathonToDelete(hackathon);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!hackathonToDelete) return;
    
    setDeleteLoading(true);
    try {
      await firebaseServices.hackathonServices.delete(hackathonToDelete.id);
      
      // Remove from local state
      setOrganizerHackathons(prev => prev.filter(h => h.id !== hackathonToDelete.id));
      setRegistrationCounts(prev => {
        const newCounts = { ...prev };
        delete newCounts[hackathonToDelete.id];
        return newCounts;
      });
      
      setShowDeleteModal(false);
      setHackathonToDelete(null);
      
      onSuccess?.('Hackathon deleted successfully');
    } catch (error) {
      console.error('Error deleting hackathon:', error);
      onError?.('Failed to delete hackathon');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 text-lg mb-4">Please sign in to view your hackathons</div>
        <p className="text-slate-500">You need to be authenticated to access the organizer dashboard</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white text-lg">Loading your hackathons...</div>
      </div>
    );
  }

  if (organizerHackathons.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 text-lg mb-4">No hackathons created yet</div>
        <p className="text-slate-500">Create your first hackathon to start organizing events</p>
      </div>
    );
  }

  return (
    <div>
      {/* Dashboard Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Your Hackathons</h2>
        <p className="text-slate-400">Manage and view registrations for hackathons you've created</p>
      </div>

      {/* Hackathons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizerHackathons.map((hackathon, index) => (
          <motion.div
            key={hackathon.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700"
          >
            {/* Hackathon Header */}
            <div className="mb-4">
              <h3 className="text-xl font-bold text-white mb-2">{hackathon.name}</h3>
              <div className="flex items-center gap-4 text-slate-300 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  <span>{hackathon.date} at {hackathon.time}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={16} />
                  <span>{hackathon.location}</span>
                </div>
              </div>
            </div>

            {/* Registration Stats */}
            <div className="bg-blue-900 bg-opacity-30 border border-blue-700 p-4 rounded-lg mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Teams Registered</p>
                  <p className="text-2xl font-bold text-white">{registrationCounts[hackathon.id] || 0}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-sm">Max Team Size</p>
                  <p className="text-lg font-semibold text-white">{hackathon.maxTeamSize}</p>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {hackathon.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-xs flex items-center gap-1"
                >
                  <Tag size={12} />
                  {tag}
                </span>
              ))}
              {hackathon.tags.length > 2 && (
                <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-xs">
                  +{hackathon.tags.length - 2} more
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleViewRegistrations(hackathon)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Eye size={16} />
                View Registrations
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDeleteClick(hackathon)}
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors flex items-center justify-center"
                title="Delete Hackathon"
              >
                <Trash2 size={16} />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Registrations Modal */}
      <AnimatePresence>
        {showRegistrations && (
          <RegistrationsModal
            isOpen={showRegistrations}
            onClose={() => {
              setShowRegistrations(false);
              setSelectedHackathon(null);
            }}
            hackathon={selectedHackathon}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <DeleteConfirmationModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setHackathonToDelete(null);
            }}
            hackathon={hackathonToDelete}
            onConfirm={handleDeleteConfirm}
            loading={deleteLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Individual Hackathon Card Component
const HackathonCard = ({ hackathon, onRegister }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700 hover:border-blue-500 transition-colors"
    >
      {/* Hackathon Header */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-2">{hackathon.name}</h3>
        <div className="flex items-center gap-4 text-slate-300 text-sm">
          <div className="flex items-center gap-1">
            <Calendar size={16} />
            <span>{hackathon.date} at {hackathon.time}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin size={16} />
            <span>{hackathon.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={16} />
            <span>Max {hackathon.maxTeamSize} members</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-slate-400 mb-4">{hackathon.description}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {hackathon.tags.map((tag, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-blue-900 text-blue-200 rounded-full text-xs flex items-center gap-1"
          >
            <Tag size={12} />
            {tag}
          </span>
        ))}
      </div>

      {/* Sponsors Section */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-slate-300 mb-2">Sponsors:</h4>
        <div className="flex flex-wrap gap-2">
          {hackathon.sponsors.map((sponsor, index) => (
            <div key={index} className="bg-slate-700 rounded-lg p-2 text-xs">
              <div className="flex items-center gap-2 mb-1">
                <Globe size={12} className="text-blue-400" />
                <span className="text-white font-medium">{sponsor.name}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Mail size={10} />
                <span>{sponsor.email}</span>
                <a
                  href={sponsor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  <ExternalLink size={10} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Register Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onRegister(hackathon)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
      >
        Register for Hackathon
      </motion.button>
    </motion.div>
  );
};

// Hackathon Creation Form Component
const HackathonForm = ({ isOpen, onClose, onSubmit }) => {
  const [user] = useAuthState(auth);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: '',
    location: '',
    description: '',
    maxTeamSize: 4,
    tags: '',
    sponsors: [{ name: '', email: '', website: '' }]
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Hackathon name is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Time is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.maxTeamSize < 1) newErrors.maxTeamSize = 'Team size must be at least 1';
    
    // Validate sponsors
    formData.sponsors.forEach((sponsor, index) => {
      if (sponsor.name && !sponsor.email) {
        newErrors[`sponsor_email_${index}`] = 'Email is required for sponsor';
      }
      if (sponsor.email && !firebaseServices.utils.validateEmail(sponsor.email)) {
        newErrors[`sponsor_email_${index}`] = 'Invalid email format';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to create a hackathon');
      return;
    }

    if (validateForm()) {
      setSubmitting(true);
      try {
        const hackathonData = {
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          sponsors: formData.sponsors.filter(sponsor => sponsor.name && sponsor.email)
        };
        
        await onSubmit(hackathonData);
        
        setFormData({
          name: '',
          date: '',
          time: '',
          location: '',
          description: '',
          maxTeamSize: 4,
          tags: '',
          sponsors: [{ name: '', email: '', website: '' }]
        });
        setErrors({});
      } catch (error) {
        console.error('Error submitting form:', error);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const addSponsor = () => {
    setFormData({
      ...formData,
      sponsors: [...formData.sponsors, { name: '', email: '', website: '' }]
    });
  };

  const removeSponsor = (index) => {
    setFormData({
      ...formData,
      sponsors: formData.sponsors.filter((_, i) => i !== index)
    });
  };

  const updateSponsor = (index, field, value) => {
    const newSponsors = [...formData.sponsors];
    newSponsors[index][field] = value;
    setFormData({ ...formData, sponsors: newSponsors });
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Create New Hackathon</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Hackathon Name*</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                placeholder="Enter hackathon name"
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Max Team Size*</label>
              <input
                type="number"
                min="1"
                value={formData.maxTeamSize}
                onChange={(e) => setFormData({ ...formData, maxTeamSize: parseInt(e.target.value) })}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
              {errors.maxTeamSize && <p className="text-red-400 text-xs mt-1">{errors.maxTeamSize}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Date*</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
              {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Time*</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
              {errors.time && <p className="text-red-400 text-xs mt-1">{errors.time}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Location / Online Link*</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              placeholder="Enter location or online meeting link"
            />
            {errors.location && <p className="text-red-400 text-xs mt-1">{errors.location}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Description*</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              placeholder="Describe your hackathon..."
            />
            {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Tags/Categories (comma separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              placeholder="AI, Web Development, Mobile, etc."
            />
          </div>

          {/* Sponsors Section */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-slate-300">Sponsors</label>
              <button
                type="button"
                onClick={addSponsor}
                className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
              >
                <Plus size={16} />
                Add Sponsor
              </button>
            </div>
            
            {formData.sponsors.map((sponsor, index) => (
              <div key={index} className="bg-slate-700 p-4 rounded-lg mb-3">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-slate-300">Sponsor {index + 1}</span>
                  {formData.sponsors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSponsor(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Sponsor name"
                      value={sponsor.name}
                      onChange={(e) => updateSponsor(index, 'name', e.target.value)}
                      className="w-full p-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="sponsor@email.com"
                      value={sponsor.email}
                      onChange={(e) => updateSponsor(index, 'email', e.target.value)}
                      className="w-full p-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                    />
                    {errors[`sponsor_email_${index}`] && (
                      <p className="text-red-400 text-xs mt-1">{errors[`sponsor_email_${index}`]}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="url"
                      placeholder="https://website.com"
                      value={sponsor.website}
                      onChange={(e) => updateSponsor(index, 'website', e.target.value)}
                      className="w-full p-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {submitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {submitting ? 'Creating...' : 'Create Hackathon'}
            </motion.button>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-6 py-3 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Registration Form Component
const RegistrationForm = ({ isOpen, onClose, hackathon, onSubmit }) => {
  const [user] = useAuthState(auth);
  const [formData, setFormData] = useState({
    teamName: '',
    teamLeader: { name: '', email: '', phone: '', github: '' },
    collegeName: '',
    members: [],
    uploadedFile: null
  });
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        teamLeader: { ...prev.teamLeader, email: user.email }
      }));
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.teamName.trim()) newErrors.teamName = 'Team name is required';
    if (!formData.collegeName.trim()) newErrors.collegeName = 'College name is required';
    
    // Validate team leader
    if (!formData.teamLeader.name.trim()) newErrors.teamLeaderName = 'Team leader name is required';
    if (!formData.teamLeader.email.trim()) newErrors.teamLeaderEmail = 'Team leader email is required';
    else if (!firebaseServices.utils.validateEmail(formData.teamLeader.email)) newErrors.teamLeaderEmail = 'Invalid email format';
    if (!formData.teamLeader.phone.trim()) newErrors.teamLeaderPhone = 'Team leader phone is required';
    
    formData.members.forEach((member, index) => {
      if (!member.name.trim()) newErrors[`member_name_${index}`] = 'Member name is required';
      if (!member.email.trim()) newErrors[`member_email_${index}`] = 'Member email is required';
      else if (!firebaseServices.utils.validateEmail(member.email)) newErrors[`member_email_${index}`] = 'Invalid email format';
      if (!member.phone.trim()) newErrors[`member_phone_${index}`] = 'Member phone is required';
    });

    // Check total team size (leader + members)
    const totalTeamSize = 1 + formData.members.length;
    if (totalTeamSize > hackathon?.maxTeamSize) {
      newErrors.teamSize = `Total team size cannot exceed ${hackathon.maxTeamSize} members (including leader)`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to register for hackathons');
      return;
    }

    if (validateForm()) {
      setSubmitting(true);
      try {
        await onSubmit(formData);
        
        setFormData({
          teamName: '',
          teamLeader: { name: '', email: user.email, phone: '', github: '' },
          collegeName: '',
          members: [],
          uploadedFile: null
        });
        setErrors({});
      } catch (error) {
        console.error('Error submitting registration:', error);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const addMember = () => {
    // Check if adding one more member (plus leader) exceeds limit
    const totalAfterAdd = 1 + formData.members.length + 1;
    if (totalAfterAdd <= hackathon.maxTeamSize) {
      setFormData({
        ...formData,
        members: [...formData.members, { name: '', email: '', phone: '', github: '' }]
      });
    }
  };

  const removeMember = (index) => {
    setFormData({
      ...formData,
      members: formData.members.filter((_, i) => i !== index)
    });
  };

  const updateTeamLeader = (field, value) => {
    setFormData({
      ...formData,
      teamLeader: { ...formData.teamLeader, [field]: value }
    });
  };

  const updateMember = (index, field, value) => {
    const newMembers = [...formData.members];
    newMembers[index][field] = value;
    setFormData({ ...formData, members: newMembers });
  };

  // File upload handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = (file) => {
    const validation = firebaseServices.fileServices.validateFile(file);
    
    if (!validation.isValid) {
      setErrors({ ...errors, file: validation.errors[0] });
      return;
    }

    setFormData({ ...formData, uploadedFile: file });
    setErrors({ ...errors, file: undefined });
  };

  const removeFile = () => {
    setFormData({ ...formData, uploadedFile: null });
  };

  if (!isOpen || !hackathon) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Register for Hackathon</h2>
            <p className="text-slate-400 text-sm">{hackathon.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Team Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Team Name*</label>
            <input
              type="text"
              value={formData.teamName}
              onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              placeholder="Enter your team name"
            />
            {errors.teamName && <p className="text-red-400 text-xs mt-1">{errors.teamName}</p>}
          </div>

          {/* College Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">College/University Name*</label>
            <input
              type="text"
              value={formData.collegeName}
              onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              placeholder="Enter your college or university name"
            />
            {errors.collegeName && <p className="text-red-400 text-xs mt-1">{errors.collegeName}</p>}
          </div>

          {/* Team Leader Section */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Team Leader*</label>
            <div className="bg-blue-900 bg-opacity-30 border border-blue-700 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <input
                    type="text"
                    placeholder="Full name*"
                    value={formData.teamLeader.name}
                    onChange={(e) => updateTeamLeader('name', e.target.value)}
                    className="w-full p-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                  {errors.teamLeaderName && (
                    <p className="text-red-400 text-xs mt-1">{errors.teamLeaderName}</p>
                  )}
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="Phone number*"
                    value={formData.teamLeader.phone}
                    onChange={(e) => updateTeamLeader('phone', e.target.value)}
                    className="w-full p-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                  {errors.teamLeaderPhone && (
                    <p className="text-red-400 text-xs mt-1">{errors.teamLeaderPhone}</p>
                  )}
                </div>
              </div>
              <div className="mb-3">
                <input
                  type="email"
                  placeholder="Email address*"
                  value={formData.teamLeader.email}
                  onChange={(e) => updateTeamLeader('email', e.target.value)}
                  className="w-full p-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                  disabled={!!user}
                />
                {errors.teamLeaderEmail && (
                  <p className="text-red-400 text-xs mt-1">{errors.teamLeaderEmail}</p>
                )}
              </div>
              <div>
                <input
                  type="url"
                  placeholder="GitHub profile (optional)"
                  value={formData.teamLeader.github}
                  onChange={(e) => updateTeamLeader('github', e.target.value)}
                  className="w-full p-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Additional Team Members */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-slate-300">
                Additional Team Members ({formData.members.length}/{hackathon.maxTeamSize - 1})
              </label>
              {(1 + formData.members.length) < hackathon.maxTeamSize && (
                <button
                  type="button"
                  onClick={addMember}
                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
                >
                  <Plus size={16} />
                  Add Member
                </button>
              )}
            </div>
            
            <p className="text-xs text-slate-400 mb-3">
              Total team size: {1 + formData.members.length}/{hackathon.maxTeamSize} (including team leader)
            </p>
            
            {errors.teamSize && <p className="text-red-400 text-xs mb-2">{errors.teamSize}</p>}
            
            {formData.members.map((member, index) => (
              <div key={index} className="bg-slate-700 p-4 rounded-lg mb-3">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-slate-300">Team Member {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeMember(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X size={16} />
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Full name*"
                        value={member.name}
                        onChange={(e) => updateMember(index, 'name', e.target.value)}
                        className="w-full p-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                      />
                      {errors[`member_name_${index}`] && (
                        <p className="text-red-400 text-xs mt-1">{errors[`member_name_${index}`]}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="tel"
                        placeholder="Phone number*"
                        value={member.phone}
                        onChange={(e) => updateMember(index, 'phone', e.target.value)}
                        className="w-full p-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                      />
                      {errors[`member_phone_${index}`] && (
                        <p className="text-red-400 text-xs mt-1">{errors[`member_phone_${index}`]}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Email address*"
                      value={member.email}
                      onChange={(e) => updateMember(index, 'email', e.target.value)}
                      className="w-full p-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                    />
                    {errors[`member_email_${index}`] && (
                      <p className="text-red-400 text-xs mt-1">{errors[`member_email_${index}`]}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="url"
                      placeholder="GitHub profile (optional)"
                      value={member.github}
                      onChange={(e) => updateMember(index, 'github', e.target.value)}
                      className="w-full p-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* File Upload Section */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Upload Documents (Optional)
            </label>
            <p className="text-xs text-slate-400 mb-3">
              You can upload your project proposal, presentation, or any relevant documents (PDF, PPT, DOC - Max 10MB)
            </p>
            
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                dragActive 
                  ? 'border-blue-400 bg-blue-900 bg-opacity-20' 
                  : 'border-slate-600 hover:border-slate-500'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {formData.uploadedFile ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{formData.uploadedFile.name}</p>
                      <p className="text-slate-400 text-sm">
                        {firebaseServices.utils.formatFileSize(formData.uploadedFile.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="mt-2">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-blue-400 hover:text-blue-300 font-medium">Upload a file</span>
                      <span className="text-slate-400"> or drag and drop</span>
                    </label>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept=".pdf,.ppt,.pptx,.doc,.docx"
                      onChange={handleFileChange}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">PDF, PPT, DOC up to 10MB</p>
                </div>
              )}
            </div>
            {errors.file && <p className="text-red-400 text-xs mt-1">{errors.file}</p>}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {submitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {submitting ? 'Registering...' : 'Register Team'}
            </motion.button>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-6 py-3 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Main Hackathon Platform Component
const HackathonPlatform = () => {
  const [user] = useAuthState(auth);
  const [hackathons, setHackathons] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [selectedHackathon, setSelectedHackathon] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('browse');

  // Load hackathons using Firebase service
  useEffect(() => {
    loadHackathons();
  }, []);

  const loadHackathons = async () => {
    setLoading(true);
    try {
      const result = await firebaseServices.hackathonServices.getAll(20);
      setHackathons(result.hackathons);
    } catch (error) {
      console.error('Error loading hackathons:', error);
      showFeedback('error', 'Failed to load hackathons');
    } finally {
      setLoading(false);
    }
  };

  // Show feedback message
  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
  };

  // Create new hackathon using Firebase service
  const handleCreateHackathon = async (hackathonData) => {
    if (!user) {
      showFeedback('error', 'Please sign in to create hackathons');
      return;
    }

    try {
      await firebaseServices.hackathonServices.create(hackathonData, user.email);
      setShowCreateForm(false);
      
      // Reload hackathons
      await loadHackathons();
      
      showFeedback('success', 'Hackathon created successfully!');
    } catch (error) {
      console.error('Error creating hackathon:', error);
      showFeedback('error', error.message);
    }
  };

  // Handle registration using Firebase service
  const handleRegistration = async (registrationData) => {
    if (!user) {
      showFeedback('error', 'Please sign in to register for hackathons');
      return;
    }

    try {
      // Upload file if provided
      let uploadedFileData = null;
      if (registrationData.uploadedFile) {
        uploadedFileData = await firebaseServices.fileServices.uploadFile(
          registrationData.uploadedFile,
          selectedHackathon.id,
          registrationData.teamName
        );
      }

      // Create registration
      await firebaseServices.registrationServices.create({
        ...registrationData,
        hackathonId: selectedHackathon.id,
        hackathonName: selectedHackathon.name,
        teamEmail: user.email,
        uploadedFile: uploadedFileData
      });

      setShowRegistrationForm(false);
      setSelectedHackathon(null);
      showFeedback('success', 'Successfully registered for the hackathon!');
    } catch (error) {
      console.error('Error creating registration:', error);
      showFeedback('error', error.message);
    }
  };

  // Filter hackathons based on current view
  const filteredHackathons = currentView === 'browse' ? hackathons : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading hackathons...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Hackathon Platform</h1>
              <p className="text-slate-400 mt-1">Discover, create, and participate in hackathons</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Authentication Status */}
              {user ? (
                <div className="text-slate-300 text-sm">
                  Welcome, {user.email}
                </div>
              ) : (
                <div className="text-slate-400 text-sm">
                  Please sign in to create hackathons
                </div>
              )}

              {/* View Toggle */}
              <div className="bg-slate-700 rounded-lg p-1 flex">
                <button
                  onClick={() => setCurrentView('browse')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'browse'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Browse Hackathons
                </button>
                <button
                  onClick={() => setCurrentView('organizer')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'organizer'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Settings size={16} className="inline mr-2" />
                  Organizer Dashboard
                </button>
              </div>
              
              {/* Create Hackathon Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <Plus size={20} />
                Create Hackathon
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Feedback Messages */}
      <AnimatePresence>
        {feedback.message && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
              feedback.type === 'success' 
                ? 'bg-green-600 text-white' 
                : 'bg-red-600 text-white'
            }`}
          >
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {currentView === 'browse' ? (
          // Browse Hackathons View
          filteredHackathons.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-slate-400 text-lg mb-4">No hackathons found</div>
              <p className="text-slate-500">No hackathons available at the moment. Check back later or create your own!</p>
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {filteredHackathons.map((hackathon) => (
                <HackathonCard
                  key={hackathon.id}
                  hackathon={hackathon}
                  onRegister={(hackathon) => {
                    if (!user) {
                      showFeedback('error', 'Please sign in to register for hackathons');
                      return;
                    }
                    setSelectedHackathon(hackathon);
                    setShowRegistrationForm(true);
                  }}
                />
              ))}
            </motion.div>
          )
        ) : (
          // Organizer Dashboard View
          <OrganizerDashboard 
            onSuccess={(message) => showFeedback('success', message)}
            onError={(message) => showFeedback('error', message)}
          />
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreateForm && (
          <HackathonForm
            isOpen={showCreateForm}
            onClose={() => setShowCreateForm(false)}
            onSubmit={handleCreateHackathon}
          />
        )}
        
        {showRegistrationForm && (
          <RegistrationForm
            isOpen={showRegistrationForm}
            onClose={() => {
              setShowRegistrationForm(false);
              setSelectedHackathon(null);
            }}
            hackathon={selectedHackathon}
            onSubmit={handleRegistration}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default HackathonPlatform;