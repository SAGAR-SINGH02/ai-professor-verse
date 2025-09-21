import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
  profile: {
    avatar?: string;
    bio?: string;
    preferences: {
      theme: 'light' | 'dark';
      language: string;
      notifications: boolean;
    };
    learningStats?: {
      coursesCompleted: number;
      totalLearningTime: number;
      currentStreak: number;
      achievements: string[];
    };
  };
  refreshToken?: string;
  lastLogin?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false // Don't include password in queries by default
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  },
  profile: {
    avatar: {
      type: String,
      default: function() {
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(this.name)}`;
      }
    },
    bio: {
      type: String,
      maxlength: 500
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'dark'
      },
      language: {
        type: String,
        default: 'en'
      },
      notifications: {
        type: Boolean,
        default: true
      }
    },
    learningStats: {
      coursesCompleted: {
        type: Number,
        default: 0
      },
      totalLearningTime: {
        type: Number,
        default: 0 // in minutes
      },
      currentStreak: {
        type: Number,
        default: 0 // days
      },
      achievements: [{
        type: String
      }]
    }
  },
  refreshToken: {
    type: String,
    select: false
  },
  lastLogin: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ 'profile.preferences.theme': 1 });

// Virtual for user's full profile
UserSchema.virtual('fullProfile').get(function() {
  return {
    id: this._id,
    email: this.email,
    name: this.name,
    role: this.role,
    ...this.profile,
    createdAt: this.createdAt,
    lastLogin: this.lastLogin
  };
});

// Method to check if user is premium (for future use)
UserSchema.methods.isPremium = function() {
  return this.role === 'teacher' || this.role === 'admin';
};

// Method to update learning stats
UserSchema.methods.updateLearningStats = function(courseCompleted = false, learningTime = 0) {
  if (courseCompleted) {
    this.profile.learningStats.coursesCompleted += 1;
  }
  this.profile.learningStats.totalLearningTime += learningTime;
  
  // Update streak logic would go here
  return this.save();
};

export default mongoose.model<IUser>('User', UserSchema);
