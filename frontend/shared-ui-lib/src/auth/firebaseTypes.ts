/**
 * Firebase Authentication Type Definitions
 */

export interface FirebaseAuthResponse {
  socialId: string;
  socialToken: string;
  socialPlatform: 'google' | 'email';
  email?: string;
  displayName?: string;
  photoURL?: string;
}

export interface FirebaseError {
  code: string;
  message: string;
}

export interface SocialLoginRequest {
  socialId: string;
  socialToken: string;
  socialPlatform: string;
}

export interface SocialLoginResponse {
  userId: string;
  authToken: string;
  refreshToken: string;
  recentlyCreated: boolean;
}

