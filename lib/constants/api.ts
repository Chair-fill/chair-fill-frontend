/**
 * Backend API paths (NestJS).
 * Base URL is set via NEXT_PUBLIC_API_URL (e.g. http://localhost:3000/api/v1).
 */
export const API = {
  AUTH: {
    SIGNIN: '/auth/signin',
    SIGNUP: '/auth/signup',
    SIGNUP_VERIFY: '/auth/signup-verify',
    VERIFY_EMAIL: '/auth/verify/email',
    PASSWORD_UPDATE: '/auth/passwords/update',
    FORGOT_PASSWORD_VERIFY: '/auth/passwords/forgot-password/verify',
    FORGOT_PASSWORD_OTP_VERIFY: '/auth/passwords/forgot-password/1/verify',
    FORGOT_PASSWORD_UPDATE: '/auth/passwords/forgot-password/1/update',
  },
  USER: {
    CURRENT: '/user/current',
    PROFILE: '/user/profile',
    LOCATION: '/user/location',
    PICTURE: '/user/picture',
    PICTURE_REMOVE: '/user/picture/remove',
  },
  VERIFY: {
    REQUEST_EMAIL: '/verify/request/email',
    EMAIL: '/verify/email',
    REQUEST_PHONE: '/verify/request/phone',
    PHONE: '/verify/phone',
  },
} as const;
