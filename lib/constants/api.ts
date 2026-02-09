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
  PAYMENT: {
    /** GET ?planId=xxx - backend creates Stripe Checkout Session, returns { url } for redirect */
    CHECKOUT_SESSION: '/payment/checkout-session',
    /** GET ?session_id=xxx - returns { status, planId? } for post-checkout redirect page */
    SESSION_STATUS: '/payment/session-status',
  },
  TECHNICIAN: {
    /** POST - Create technician (barber) profile. Body: full_name, email, phone_number, address? */
    CREATE: '/technician',
    /** POST - Create technician (lite). Body: contact_via_socials, nick_name, address{street,country,state} */
    LITE: '/technician/lite',
    /** GET - Get technician profile for current user (JWT) */
    ME: '/technician/me',
  },
  PROGRESS: {
    /** GET - Get onboarding progress for current user (JWT). Returns has_subscribed, is_technician, timeline, owner. */
    ME: '/progress/me',
  },
  PLANS: {
    /** GET ?provider=stripe - List plans with price_id for Stripe */
    LIST: '/plans/list',
  },
  SUBSCRIPTION: {
    /** POST - Subscribe to a plan. Body: { price_id, technician_id } */
    SUBSCRIBE: '/subscription/subscribe',
  },
} as const;
