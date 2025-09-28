// login.js - Complete ZeroShotHire Backend with Fixed OAuth
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Firebase Admin SDK
const admin = require('firebase-admin');

// Initialize Firebase Admin
let serviceAccount;
try {
  serviceAccount = require('./serviceAccountKey.json');
} catch (error) {
  console.error('ServiceAccount key not found. Using environment variables for Firebase config.');
}

if (!admin.apps.length) {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
  } else {
    // Use environment variables for production
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
  }
}

const db = admin.firestore();
const auth = admin.auth();

const app = express();
const PORT = process.env.PORT || 3001;

// =============================================================================
// ENVIRONMENT VARIABLES VALIDATION
// =============================================================================

const requiredEnvVars = ['JWT_SECRET', 'SESSION_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn(`Warning: Missing environment variables: ${missingVars.join(', ')}`);
  console.warn('Using default values for development. Set these in production!');
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateJWT = (uid, expiresIn = '7d') => {
  return jwt.sign({ uid }, process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production', {
    expiresIn
  });
};

const verifyJWT = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production');
};

const getBaseURL = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.FUNCTION_URL || `https://us-central1-${process.env.FIREBASE_PROJECT_ID || 'zeroshothire-1d25d'}.cloudfunctions.net/api`;
  }
  return `http://localhost:${PORT}`;
};

const getFrontendURL = () => {
  return process.env.FRONTEND_URL || 
         process.env.NODE_ENV === 'production' 
           ? 'https://zeroshothire.web.app' 
           : 'http://localhost:3000';
};

// =============================================================================
// EMAIL SERVICE
// =============================================================================

let transporter = null;

if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
} else if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  // Fallback to Gmail
  transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

const sendEmail = async (mailOptions) => {
  if (!transporter) {
    console.warn('Email transporter not configured. Email not sent.');
    return Promise.resolve();
  }

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

const sendVerificationEmail = async (email, verificationCode, displayName = '') => {
  const mailOptions = {
    from: `"ZeroShotHire" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email - ZeroShotHire',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email - ZeroShotHire</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #e0e0e0; }
            .logo { font-size: 28px; font-weight: bold; color: #4F46E5; }
            .content { padding: 30px 0; }
            .verification-code { 
              font-size: 32px; 
              font-weight: bold; 
              text-align: center; 
              padding: 20px; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              border-radius: 10px;
              margin: 20px 0;
              letter-spacing: 5px;
            }
            .footer { text-align: center; padding: 20px 0; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; }
            .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 8px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🚀 ZeroShotHire</div>
              <p>Professional Hiring Platform</p>
            </div>
            <div class="content">
              <h2>Welcome${displayName ? ` ${displayName}` : ''}!</h2>
              <p>Thank you for joining ZeroShotHire. Please verify your email using this code:</p>
              <div class="verification-code">${verificationCode}</div>
              <p><strong>This code expires in 10 minutes.</strong></p>
              <p>If you didn't create this account, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 ZeroShotHire. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  };
  return sendEmail(mailOptions);
};

const sendWelcomeEmail = async (email, displayName = '') => {
  const mailOptions = {
    from: `"ZeroShotHire" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to ZeroShotHire!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to ZeroShotHire</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #e0e0e0; }
            .logo { font-size: 28px; font-weight: bold; color: #4F46E5; }
            .content { padding: 30px 0; }
            .feature-box { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #4F46E5; }
            .footer { text-align: center; padding: 20px 0; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; }
            .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🚀 ZeroShotHire</div>
              <h2>Welcome to the Future of Hiring!</h2>
            </div>
            <div class="content">
              <h2>Hello${displayName ? ` ${displayName}` : ''}!</h2>
              <p>Your email has been verified! You're now part of ZeroShotHire.</p>
              
              <div class="feature-box">
                <h4>📝 Complete Your Profile</h4>
                <p>Add your skills and experience to get better matches.</p>
              </div>
              
              <div class="feature-box">
                <h4>🎯 Set Job Preferences</h4>
                <p>Tell us what opportunities you're looking for.</p>
              </div>
              
              <div class="feature-box">
                <h4>🔍 Start Exploring</h4>
                <p>Browse thousands of job opportunities.</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${getFrontendURL()}/dashboard" class="button">
                  Get Started Now
                </a>
              </div>
              
              <p>Welcome aboard!<br>The ZeroShotHire Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 ZeroShotHire. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  };
  return sendEmail(mailOptions);
};

// =============================================================================
// MIDDLEWARE SETUP
// =============================================================================

// Trust proxy for deployment platforms
app.set('trust proxy', true);

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'", "https:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"],
      fontSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { 
    success: false, 
    error: 'Too many requests from this IP, please try again later.' 
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health check
    return req.path === '/health';
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // More generous for auth endpoints
  message: { 
    success: false, 
    error: 'Too many authentication attempts, please try again later.' 
  }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { 
    success: false, 
    error: 'Too many login attempts, please try again later.' 
  }
});

app.use(generalLimiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:5173',
      'https://zeroshothire.web.app',
      'https://zeroshothire.firebaseapp.com'
    ];
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Allow any localhost origin for development
    if (origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-session-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// =============================================================================
// AUTHENTICATION MIDDLEWARE
// =============================================================================

const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Access token required' 
      });
    }

    const decoded = verifyJWT(token);
    const userDoc = await db.collection('users').doc(decoded.uid).get();

    if (!userDoc.exists) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    req.user = { uid: decoded.uid, ...userDoc.data() };
    next();
  } catch (error) {
    console.error('JWT authentication error:', error);
    res.status(403).json({ 
      success: false, 
      error: 'Invalid or expired token' 
    });
  }
};

const requireEmailVerified = (req, res, next) => {
  if (!req.user.emailVerified) {
    return res.status(403).json({ 
      success: false,
      error: 'Email verification required',
      code: 'EMAIL_NOT_VERIFIED'
    });
  }
  next();
};

// =============================================================================
// PASSPORT CONFIGURATION
// =============================================================================

passport.serializeUser((user, done) => {
  console.log('Serializing user:', user.uid);
  done(null, user.uid);
});

passport.deserializeUser(async (uid, done) => {
  try {
    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc.exists) {
      const userData = { uid, ...userDoc.data() };
      console.log('Deserialized user:', userData.email);
      done(null, userData);
    } else {
      console.log('User not found during deserialization:', uid);
      done(null, false);
    }
  } catch (error) {
    console.error('Deserialization error:', error);
    done(error, null);
  }
});

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const googleCallbackURL = `${getBaseURL()}/auth/google/callback`;
  console.log('Google OAuth callback URL:', googleCallbackURL);
  
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: googleCallbackURL
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google OAuth strategy called for:', profile.emails[0].value);
      
      const email = profile.emails[0].value;
      const displayName = profile.displayName;
      const photoURL = profile.photos[0]?.value;

      let userRecord;
      try {
        userRecord = await auth.getUserByEmail(email);
        console.log('Found existing Firebase user:', email);
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          console.log('Creating new Firebase user:', email);
          userRecord = await auth.createUser({
            email,
            displayName,
            photoURL,
            emailVerified: true
          });
        } else {
          throw error;
        }
      }

      const userData = {
        email,
        displayName,
        photoURL,
        provider: 'google',
        emailVerified: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastLogin: admin.firestore.FieldValue.serverTimestamp(),
        stats: {
          totalLogins: admin.firestore.FieldValue.increment(1),
          lastLoginAt: admin.firestore.FieldValue.serverTimestamp()
        }
      };

      await db.collection('users').doc(userRecord.uid).set(userData, { merge: true });
      console.log('User data saved to Firestore:', email);
      
      return done(null, { uid: userRecord.uid, ...userData });
    } catch (error) {
      console.error('Google OAuth error:', error);
      return done(error, null);
    }
  }));
} else {
  console.warn('Google OAuth not configured - missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
}

// GitHub OAuth Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  const githubCallbackURL = `${getBaseURL()}/auth/github/callback`;
  console.log('GitHub OAuth callback URL:', githubCallbackURL);
  
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: githubCallbackURL
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('GitHub OAuth strategy called for:', profile.username);
      
      const email = profile.emails?.[0]?.value;
      const displayName = profile.displayName || profile.username;
      const photoURL = profile.photos?.[0]?.value;

      if (!email) {
        console.error('No email found in GitHub profile');
        return done(new Error('No email found in GitHub profile. Please make your email public in GitHub settings.'), null);
      }

      let userRecord;
      try {
        userRecord = await auth.getUserByEmail(email);
        console.log('Found existing Firebase user:', email);
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          console.log('Creating new Firebase user:', email);
          userRecord = await auth.createUser({
            email,
            displayName,
            photoURL,
            emailVerified: true
          });
        } else {
          throw error;
        }
      }

      const userData = {
        email,
        displayName,
        photoURL,
        provider: 'github',
        emailVerified: true,
        githubUsername: profile.username,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastLogin: admin.firestore.FieldValue.serverTimestamp(),
        stats: {
          totalLogins: admin.firestore.FieldValue.increment(1),
          lastLoginAt: admin.firestore.FieldValue.serverTimestamp()
        }
      };

      await db.collection('users').doc(userRecord.uid).set(userData, { merge: true });
      console.log('User data saved to Firestore:', email);
      
      return done(null, { uid: userRecord.uid, ...userData });
    } catch (error) {
      console.error('GitHub OAuth error:', error);
      return done(error, null);
    }
  }));
} else {
  console.warn('GitHub OAuth not configured - missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET');
}

// =============================================================================
// ROUTES
// =============================================================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'ZeroShotHire Backend',
    version: '1.0.0',
    features: {
      email: !!transporter,
      googleOAuth: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      githubOAuth: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
      firebase: true
    }
  });
});

// =============================================================================
// AUTHENTICATION ROUTES
// =============================================================================

// Register
app.post('/auth/register', authLimiter, async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    // Validation
    if (!email || !password || !displayName) {
      return res.status(400).json({ 
        success: false, 
        error: 'All fields are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        error: 'Password must be at least 6 characters long' 
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid email format' 
      });
    }

    // Check if user exists
    try {
      await auth.getUserByEmail(email);
      return res.status(400).json({ 
        success: false, 
        error: 'User already exists with this email' 
      });
    } catch (error) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const hashedPassword = await bcrypt.hash(password, 12);

    // Store temporary user data
    const tempUserData = {
      email,
      password: hashedPassword,
      displayName: displayName.trim(),
      verificationCode,
      codeExpiry: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 10 * 60 * 1000)), // 10 minutes
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('temp_users').doc(email).set(tempUserData);
    console.log('Temporary user data stored for:', email);

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationCode, displayName);
      console.log('Verification email sent to:', email);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail registration if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Registration initiated. Please check your email for verification code.',
      email
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Registration failed. Please try again.' 
    });
  }
});

// Verify email
app.post('/auth/verify-email', authLimiter, async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and verification code are required' 
      });
    }

    // Get temp user data
    const tempUserDoc = await db.collection('temp_users').doc(email).get();

    if (!tempUserDoc.exists) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid email or verification code expired' 
      });
    }

    const tempUserData = tempUserDoc.data();

    // Check verification code
    if (tempUserData.verificationCode !== verificationCode) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid verification code' 
      });
    }

    // Check if code expired
    if (tempUserData.codeExpiry.toDate() < new Date()) {
      await db.collection('temp_users').doc(email).delete();
      return res.status(400).json({ 
        success: false, 
        error: 'Verification code expired. Please register again.' 
      });
    }

    // Create Firebase user
    const userRecord = await auth.createUser({
      email: tempUserData.email,
      displayName: tempUserData.displayName,
      emailVerified: true
    });

    // Store user data in Firestore
    const userData = {
      email: tempUserData.email,
      displayName: tempUserData.displayName,
      password: tempUserData.password,
      provider: 'email',
      emailVerified: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      stats: {
        totalLogins: 1,
        firstLoginAt: admin.firestore.FieldValue.serverTimestamp(),
        lastLoginAt: admin.firestore.FieldValue.serverTimestamp()
      }
    };

    await db.collection('users').doc(userRecord.uid).set(userData);
    console.log('User created successfully:', email);

    // Clean up temp user
    await db.collection('temp_users').doc(email).delete();

    // Generate JWT token
    const token = generateJWT(userRecord.uid);

    // Send welcome email
    try {
      await sendWelcomeEmail(tempUserData.email, tempUserData.displayName);
      console.log('Welcome email sent to:', email);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail verification if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Email verified successfully! Welcome to ZeroShotHire!',
      user: {
        uid: userRecord.uid,
        email: userData.email,
        displayName: userData.displayName,
        emailVerified: true
      },
      token
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Email verification failed. Please try again.' 
    });
  }
});

// Resend verification code
app.post('/auth/resend-verification', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email is required' 
      });
    }

    const tempUserDoc = await db.collection('temp_users').doc(email).get();

    if (!tempUserDoc.exists) {
      return res.status(400).json({ 
        success: false, 
        error: 'No pending verification found for this email' 
      });
    }

    const tempUserData = tempUserDoc.data();
    const verificationCode = generateVerificationCode();

    await db.collection('temp_users').doc(email).update({
      verificationCode,
      codeExpiry: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 10 * 60 * 1000))
    });

    try {
      await sendVerificationEmail(email, verificationCode, tempUserData.displayName);
      console.log('Verification code resent to:', email);
    } catch (emailError) {
      console.error('Failed to resend verification email:', emailError);
      return res.status(500).json({
        success: false,
        error: 'Failed to send verification email. Please try again.'
      });
    }

    res.json({ 
      success: true,
      message: 'Verification code resent successfully' 
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to resend verification code' 
    });
  }
});

// Login
app.post('/auth/login', loginLimiter, async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password are required' 
      });
    }

    // Get user from Firestore
    const usersRef = db.collection('users');
    const querySnapshot = await usersRef.where('email', '==', email).get();

    if (querySnapshot.empty) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    // Check if user signed up with social login
    if (userData.provider !== 'email') {
      return res.status(400).json({ 
        success: false, 
        error: `This email is associated with ${userData.provider} login. Please use ${userData.provider} to sign in.` 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, userData.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }

    // Check if email is verified
    if (!userData.emailVerified) {
      return res.status(401).json({ 
        success: false, 
        error: 'Please verify your email before logging in',
        code: 'EMAIL_NOT_VERIFIED'
      });
    }

    // Update last login and stats
    await db.collection('users').doc(userDoc.id).update({
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      'stats.totalLogins': admin.firestore.FieldValue.increment(1),
      'stats.lastLoginAt': admin.firestore.FieldValue.serverTimestamp()
    });

    // Generate JWT token
    const tokenExpiry = rememberMe ? '30d' : '7d';
    const token = generateJWT(userDoc.id, tokenExpiry);

    console.log('Login successful for:', email);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        uid: userDoc.id,
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL || null,
        emailVerified: userData.emailVerified,
        provider: userData.provider
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Login failed. Please try again.' 
    });
  }
});

// Google OAuth routes
app.get('/auth/google', (req, res, next) => {
  console.log('Google OAuth initiated');
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(500).json({
      success: false,
      error: 'Google OAuth not configured'
    });
  }
  next();
}, passport.authenticate('google', { 
  scope: ['profile', 'email'],
  session: true
}));

app.get('/auth/google/callback', 
  (req, res, next) => {
    console.log('Google OAuth callback received');
    console.log('Query params:', req.query);
    if (req.query.error) {
      console.error('Google OAuth error:', req.query.error);
      return res.redirect(`${getFrontendURL()}/login?error=google_auth_failed`);
    }
    next();
  },
  passport.authenticate('google', { 
    failureRedirect: `${getFrontendURL()}/login?error=google_auth_failed`,
    session: true
  }),
  async (req, res) => {
    try {
      console.log('Google OAuth authentication successful for:', req.user.email);
      
      const token = generateJWT(req.user.uid);
      const frontendUrl = getFrontendURL();
      
      // Redirect to dashboard with token
      const redirectUrl = `${frontendUrl}/dashboard?token=${token}&auth=google&welcome=true`;
      console.log('Redirecting to:', redirectUrl);
      
      res.redirect(redirectUrl);
      
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect(`${getFrontendURL()}/login?error=auth_callback_failed`);
    }
  }
);

// GitHub OAuth routes
app.get('/auth/github', (req, res, next) => {
  console.log('GitHub OAuth initiated');
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    return res.status(500).json({
      success: false,
      error: 'GitHub OAuth not configured'
    });
  }
  next();
}, passport.authenticate('github', { 
  scope: ['user:email'],
  session: true
}));

app.get('/auth/github/callback',
  (req, res, next) => {
    console.log('GitHub OAuth callback received');
    console.log('Query params:', req.query);
    if (req.query.error) {
      console.error('GitHub OAuth error:', req.query.error);
      return res.redirect(`${getFrontendURL()}/login?error=github_auth_failed`);
    }
    next();
  },
  passport.authenticate('github', { 
    failureRedirect: `${getFrontendURL()}/login?error=github_auth_failed`,
    session: true
  }),
  async (req, res) => {
    try {
      console.log('GitHub OAuth authentication successful for:', req.user.email);
      
      const token = generateJWT(req.user.uid);
      const frontendUrl = getFrontendURL();
      
      // Redirect to dashboard with token
      const redirectUrl = `${frontendUrl}/dashboard?token=${token}&auth=github&welcome=true`;
      console.log('Redirecting to:', redirectUrl);
      
      res.redirect(redirectUrl);
      
    } catch (error) {
      console.error('GitHub callback error:', error);
      res.redirect(`${getFrontendURL()}/login?error=auth_callback_failed`);
    }
  }
);

// Verify token
app.get('/auth/verify', authenticateJWT, (req, res) => {
  res.json({
    success: true,
    valid: true,
    user: {
      uid: req.user.uid,
      email: req.user.email,
      displayName: req.user.displayName,
      photoURL: req.user.photoURL || null,
      emailVerified: req.user.emailVerified,
      provider: req.user.provider || 'email'
    }
  });
});

// Logout
app.post('/auth/logout', authenticateJWT, async (req, res) => {
  try {
    // Clear session if it exists
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error:', err);
        }
      });
    }
    
    res.json({ 
      success: true,
      message: 'Logout successful' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Logout failed' 
    });
  }
});

// Forgot password
app.post('/auth/forgot-password', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email is required' 
      });
    }

    const usersRef = db.collection('users');
    const querySnapshot = await usersRef.where('email', '==', email).get();

    if (querySnapshot.empty) {
      // Don't reveal whether email exists for security
      return res.json({ 
        success: true,
        message: 'If this email is registered, you will receive password reset instructions.' 
      });
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    // Don't allow password reset for social login users
    if (userData.provider !== 'email') {
      return res.json({ 
        success: true,
        message: 'If this email is registered, you will receive password reset instructions.' 
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.collection('users').doc(userDoc.id).update({
      resetToken,
      resetTokenExpiry: admin.firestore.Timestamp.fromDate(resetTokenExpiry)
    });

    const resetUrl = `${getFrontendURL()}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"ZeroShotHire" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request - ZeroShotHire',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset - ZeroShotHire</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #e0e0e0; }
              .logo { font-size: 28px; font-weight: bold; color: #4F46E5; }
              .content { padding: 30px 0; }
              .footer { text-align: center; padding: 20px 0; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; }
              .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">🚀 ZeroShotHire</div>
              </div>
              <div class="content">
                <h2>Password Reset Request</h2>
                <p>Hello${userData.displayName ? ` ${userData.displayName}` : ''},</p>
                <p>You requested a password reset. Click the button below to reset your password:</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${resetUrl}" class="button">Reset Password</a>
                </div>
                <p>Or copy this link: <a href="${resetUrl}">${resetUrl}</a></p>
                <p><strong>This link expires in 1 hour.</strong></p>
                <p>If you didn't request this, please ignore this email.</p>
              </div>
              <div class="footer">
                <p>&copy; 2025 ZeroShotHire. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `
    };

    try {
      await sendEmail(mailOptions);
      console.log('Password reset email sent to:', email);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({ 
      success: true,
      message: 'If this email is registered, you will receive password reset instructions.' 
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process password reset request' 
    });
  }
});

// Reset password
app.post('/auth/reset-password', authLimiter, async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        error: 'Token and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        error: 'Password must be at least 6 characters long' 
      });
    }

    const usersRef = db.collection('users');
    const querySnapshot = await usersRef.where('resetToken', '==', token).get();

    if (querySnapshot.empty) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid or expired reset token' 
      });
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    if (!userData.resetTokenExpiry || userData.resetTokenExpiry.toDate() < new Date()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Reset token has expired' 
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await db.collection('users').doc(userDoc.id).update({
      password: hashedPassword,
      resetToken: admin.firestore.FieldValue.delete(),
      resetTokenExpiry: admin.firestore.FieldValue.delete(),
      lastPasswordChange: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('Password reset successful for:', userData.email);

    res.json({ 
      success: true,
      message: 'Password reset successfully' 
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to reset password' 
    });
  }
});

// =============================================================================
// PROTECTED ROUTES
// =============================================================================

// User profile
app.get('/api/profile', authenticateJWT, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    const userData = userDoc.data();
    // Remove sensitive data
    delete userData.password;
    delete userData.resetToken;
    delete userData.resetTokenExpiry;
    
    res.json({ 
      success: true, 
      user: userData 
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get profile' 
    });
  }
});

app.put('/api/profile', authenticateJWT, async (req, res) => {
  try {
    const { displayName, photoURL, bio } = req.body;
    const updateData = {};
    
    if (displayName !== undefined) updateData.displayName = displayName.trim();
    if (photoURL !== undefined) updateData.photoURL = photoURL;
    if (bio !== undefined) updateData.bio = bio;
    updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    
    await db.collection('users').doc(req.user.uid).update(updateData);
    
    res.json({ 
      success: true, 
      message: 'Profile updated successfully' 
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update profile' 
    });
  }
});

// =============================================================================
// LEGAL PAGES
// =============================================================================

app.get('/legal/privacy-policy', (req, res) => {
  res.json({
    title: 'Privacy Policy',
    lastUpdated: '2025-01-01',
    content: {
      introduction: 'ZeroShotHire respects your privacy and is committed to protecting your personal information.',
      dataCollection: {
        title: 'Information We Collect',
        items: [
          'Personal information you provide (name, email, profile details)',
          'Authentication information from third-party providers',
          'Usage data and analytics to improve our services',
          'Resume and job-related documents you upload for analysis'
        ]
      },
      dataUsage: {
        title: 'How We Use Your Information',
        items: [
          'To provide resume analysis and job matching services',
          'To communicate with you about our services',
          'To improve our platform and user experience'
        ]
      },
      contact: 'For privacy questions, contact us at privacy@zeroshothire.com'
    }
  });
});

app.get('/legal/terms-conditions', (req, res) => {
  res.json({
    title: 'Terms and Conditions',
    lastUpdated: '2025-01-01',
    content: {
      acceptance: 'By using ZeroShotHire, you agree to these terms.',
      services: 'ZeroShotHire is a professional hiring platform providing resume analysis and job matching services.',
      userResponsibilities: 'Users are responsible for maintaining account security and providing accurate information.',
      contact: 'For questions, contact us at legal@zeroshothire.com'
    }
  });
});

// =============================================================================
// ERROR HANDLING
// =============================================================================

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  if (error.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      error: 'CORS policy violation'
    });
  }

  // Firebase Auth errors
  if (error.code === 'auth/email-already-exists') {
    return res.status(400).json({ 
      success: false, 
      error: 'Email already exists' 
    });
  }
  
  if (error.code === 'auth/invalid-email') {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid email format' 
    });
  }
  
  if (error.code === 'auth/weak-password') {
    return res.status(400).json({ 
      success: false, 
      error: 'Password is too weak' 
    });
  }
  
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('404 - Route not found:', req.originalUrl);
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// =============================================================================
// START SERVER
// =============================================================================

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
const server = app.listen(PORT, () => {
  console.log('\n🚀 ZeroShotHire Backend Server Started');
  console.log('=====================================');
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${getFrontendURL()}`);
  console.log(`📧 Email service: ${transporter ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET ? '✅ Set' : '⚠️  Using default (change in production!)'}`);
  console.log(`🔑 Session Secret: ${process.env.SESSION_SECRET ? '✅ Set' : '⚠️  Using default (change in production!)'}`);
  console.log('\n🔐 OAuth Configuration:');
  console.log(`  Google: ${process.env.GOOGLE_CLIENT_ID ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`  GitHub: ${process.env.GITHUB_CLIENT_ID ? '✅ Configured' : '❌ Not configured'}`);
  console.log('\n📋 OAuth Callback URLs:');
  console.log(`  Google: ${getBaseURL()}/auth/google/callback`);
  console.log(`  GitHub: ${getBaseURL()}/auth/github/callback`);
  console.log('\n✨ Server ready to accept requests!');
});

// Handle server errors
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  switch (error.code) {
    case 'EACCES':
      console.error(`Port ${PORT} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`Port ${PORT} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

module.exports = app;