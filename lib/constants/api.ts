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
    /** POST - Upload user profile picture. Body: multipart/form-data with `file` */
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
    /** GET - Current subscription. Query: ?technician_id= or ?shop_id= (use one) */
    CURRENT: '/subscription/current',
    /** POST - Subscribe. Body: { price_id, user_id?, shop_id?, technician_id? } */
    SUBSCRIBE: '/subscription/subscribe',
    /** POST - Cancel at period end. Body: { shop_id? } or { technician_id? } */
    CANCEL: '/subscription/cancel',
  },
  /** Contact endpoints (match Chair Fill API Postman: /contact, /contact/list, /contact/bulk/json, etc.) */
  CONTACT: {
    /** GET - List contacts (Postman: List Contacts). Optional: ?technician_id= */
    LIST: '/contact/list',
    /** POST - Create single contact (Postman: Create Contact). Body: first_name, last_name, email, phone_number_1, shop_id?, technician_id? */
    CREATE: '/contact',
    /** POST - Bulk upload via JSON (Postman: Bulk JSON). Body: { shop_id?, technician_id?, contacts: [{ first_name, last_name?, email?, phone_number_1? }] } */
    BULK_JSON: '/contact/bulk/json',
    /** POST - Bulk upload file (CSV or VCF). FormData: file, data (JSON string e.g. {"technician_id":"TCH-..."}) */
    BULK_FILE: '/contact/bulk/file',
    /** POST - Bulk upload CSV (Postman: Bulk CSV). FormData: file, data (JSON string e.g. {"shop_id":"","technician_id":""}) */
    BULK_CSV: '/contact/bulk/csv',
    /** POST - Bulk upload VCF (Postman: Bulk VCF). FormData: file, data */
    BULK_VCF: '/contact/bulk/vcf',
    /** GET - Query contacts (Postman: Query Contact) */
    QUERY: '/contact/query',
    /** DELETE - Remove one contact (Postman: Delete Contact). Path: /contact/:id */
    DELETE: (id: string) => `/contact/${encodeURIComponent(id)}`,
  },
  /** Outreach (Postman: Send Outreach). POST /outreach/send */
  OUTREACH: {
    /** POST - Send outreach. Body: { message, phone_number, send_to_all } */
    SEND: '/outreach/send',
  },
  /** GET - Generate signed/served URL for an asset. Query: path, size (e.g. s, m) */
  URL: {
    GENERATE: '/url/generate',
  },
} as const;
