import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { UserRole, UserStatus, UserPreferences } from '../types';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['username'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column({ unique: true })
  @Index()
  username: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  @Index()
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING_VERIFICATION,
  })
  @Index()
  status: UserStatus;

  @Column({ type: 'jsonb', nullable: true })
  preferences?: UserPreferences;

  @Column({ nullable: true })
  @Index()
  organizationId?: string;

  @Column({ nullable: true })
  lastLoginAt?: Date;

  @Column({ nullable: true })
  emailVerifiedAt?: Date;

  @Column({ nullable: true })
  passwordResetToken?: string;

  @Column({ nullable: true })
  passwordResetExpiresAt?: Date;

  @Column({ nullable: true })
  emailVerificationToken?: string;

  @Column({ nullable: true })
  twoFactorSecret?: string;

  @Column({ default: false })
  twoFactorEnabled: boolean;

  @Column({ type: 'jsonb', nullable: true })
  socialProviders?: {
    google?: {
      id: string;
      email: string;
    };
    github?: {
      id: string;
      username: string;
    };
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    lastIpAddress?: string;
    userAgent?: string;
    timezone?: string;
    locale?: string;
    onboardingCompleted?: boolean;
    termsAcceptedAt?: Date;
    privacyPolicyAcceptedAt?: Date;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  // Virtual properties
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  get isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  get isEmailVerified(): boolean {
    return !!this.emailVerifiedAt;
  }

  get hasCompletedOnboarding(): boolean {
    return this.metadata?.onboardingCompleted || false;
  }

  // Hooks
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  @BeforeInsert()
  setDefaults() {
    if (!this.preferences) {
      this.preferences = {
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
        notifications: {
          email: true,
          push: false,
          inApp: true,
          learningReminders: true,
          achievementAlerts: true,
          systemUpdates: false,
        },
        accessibility: {
          highContrast: false,
          fontSize: 'medium',
          screenReader: false,
          reducedMotion: false,
          captionsEnabled: false,
        },
        avatar: {
          selectedAvatarId: 'default',
          voiceSettings: {
            voiceId: 'default',
            speed: 1.0,
            pitch: 1.0,
            volume: 0.8,
          },
          emotionSensitivity: 0.7,
          interactionStyle: 'friendly',
        },
      };
    }

    if (!this.metadata) {
      this.metadata = {
        onboardingCompleted: false,
      };
    }
  }

  // Methods
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  updateLastLogin(ipAddress?: string, userAgent?: string): void {
    this.lastLoginAt = new Date();
    if (this.metadata) {
      this.metadata.lastIpAddress = ipAddress;
      this.metadata.userAgent = userAgent;
    }
  }

  markEmailAsVerified(): void {
    this.emailVerifiedAt = new Date();
    this.status = UserStatus.ACTIVE;
    this.emailVerificationToken = null;
  }

  generatePasswordResetToken(): string {
    const token = Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15);
    this.passwordResetToken = token;
    this.passwordResetExpiresAt = new Date(Date.now() + 3600000); // 1 hour
    return token;
  }

  generateEmailVerificationToken(): string {
    const token = Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15);
    this.emailVerificationToken = token;
    return token;
  }

  isPasswordResetTokenValid(token: string): boolean {
    return this.passwordResetToken === token && 
           this.passwordResetExpiresAt && 
           this.passwordResetExpiresAt > new Date();
  }

  clearPasswordResetToken(): void {
    this.passwordResetToken = null;
    this.passwordResetExpiresAt = null;
  }

  updatePreferences(preferences: Partial<UserPreferences>): void {
    this.preferences = {
      ...this.preferences,
      ...preferences,
    };
  }

  addSocialProvider(provider: 'google' | 'github', data: any): void {
    if (!this.socialProviders) {
      this.socialProviders = {};
    }
    this.socialProviders[provider] = data;
  }

  removeSocialProvider(provider: 'google' | 'github'): void {
    if (this.socialProviders && this.socialProviders[provider]) {
      delete this.socialProviders[provider];
    }
  }

  completeOnboarding(): void {
    if (this.metadata) {
      this.metadata.onboardingCompleted = true;
    }
  }

  acceptTerms(): void {
    if (this.metadata) {
      this.metadata.termsAcceptedAt = new Date();
    }
  }

  acceptPrivacyPolicy(): void {
    if (this.metadata) {
      this.metadata.privacyPolicyAcceptedAt = new Date();
    }
  }

  // Static methods
  static createFromSocialProvider(
    provider: 'google' | 'github',
    profile: any,
    email: string,
  ): Partial<User> {
    const user: Partial<User> = {
      email,
      username: profile.username || email.split('@')[0],
      firstName: profile.given_name || profile.name?.split(' ')[0] || '',
      lastName: profile.family_name || profile.name?.split(' ').slice(1).join(' ') || '',
      avatar: profile.picture || profile.avatar_url,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
      socialProviders: {
        [provider]: {
          id: profile.id,
          email: profile.email || email,
          ...(provider === 'github' && { username: profile.login }),
        },
      },
    };

    return user;
  }

  // Serialization
  toJSON() {
    const { password, passwordResetToken, emailVerificationToken, twoFactorSecret, ...result } = this;
    return result;
  }

  toPublicProfile() {
    return {
      id: this.id,
      username: this.username,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.fullName,
      avatar: this.avatar,
      role: this.role,
      createdAt: this.createdAt,
    };
  }

  toPrivateProfile() {
    return {
      ...this.toPublicProfile(),
      email: this.email,
      status: this.status,
      preferences: this.preferences,
      organizationId: this.organizationId,
      lastLoginAt: this.lastLoginAt,
      emailVerifiedAt: this.emailVerifiedAt,
      twoFactorEnabled: this.twoFactorEnabled,
      socialProviders: this.socialProviders ? Object.keys(this.socialProviders) : [],
      metadata: {
        onboardingCompleted: this.metadata?.onboardingCompleted,
        timezone: this.metadata?.timezone,
        locale: this.metadata?.locale,
      },
      updatedAt: this.updatedAt,
    };
  }
}
