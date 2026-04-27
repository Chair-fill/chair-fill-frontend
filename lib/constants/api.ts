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
    /** GET - Publicly get technician details by ID/slug. Path: /technician/:id (no JWT) */
    GET_PUBLIC: (id: string) => `/technician/${encodeURIComponent(id)}`,
  },
  BOOKING: {
    /** POST - Create a guest booking. Body: service_id, start_time, guest_info: { first_name, last_name, email, phone } */
    CREATE_GUEST: '/booking/guest',
    /** POST - Create booking for entity. Path: /booking/:eid/book. Body: { data: { services, client, location?, date, slot_id? } } */
    BOOK: (eid: string) => `/booking/${encodeURIComponent(eid)}/book`,
    /** PUT - Update booking. Path: /booking/:bookingId/update. Body: { data: { date?, ... } } */
    UPDATE: (bookingId: string) => `/booking/${encodeURIComponent(bookingId)}/update`,
    /** GET - Pay for booking. Opens payment checkout. Path: /booking/pay/:bookingId */
    PAY: (bookingId: string) => `/booking/pay/${encodeURIComponent(bookingId)}`,
    /** DELETE - Forfeit booking. Path: /booking/:bookingId/forfeit */
    FORFEIT: (bookingId: string) => `/booking/${encodeURIComponent(bookingId)}/forfeit`,
    /** GET - List bookings. Query: technician_id?|shop_id?, from_date?, to_date?, page_size?, cursor? */
    LIST: '/booking/list',
  },
  /** Availability endpoints. */
  AVAILABILITY: {
    /** GET - Get availability for technician/shop. Query: technician_id?|shop_id?, date? (no JWT) */
    ME: '/availability/me',
    /** PUT - Update availability. Body: { technician_id?|shop_id?, availableTime, period, date?, weekday?, off_times? } (JWT) */
    UPDATE: '/availability/update',
    /** GET - Enquire available time windows for a date. Path: /availability/times/:id/enquire?date=ISO&slot_index=0 (no JWT) */
    ENQUIRE: (id: string) => `/availability/times/${id}/enquire`,
  },
  /** Calendar endpoints. */
  CALENDAR: {
    /** GET - Get calendar for current user. Query: technician_id?|shop_id? (JWT) */
    ME: '/calendar/me',
  },
  /** Slots endpoints. */
  SLOTS: {
    /** GET - Get slots. Query: technician_id?|shop_id? (mutually exclusive) (JWT) */
    ME: '/slots/me',
  },
  /** Admin wallet endpoints. */
  ADMIN_WALLET: {
    /** GET - List all user wallets */
    USERS: '/admin/wallet/users',
    /** POST - Reset wallet PIN. Path: /admin/wallet/reset-pin/:uid */
    RESET_PIN: (uid: string) => `/admin/wallet/reset-pin/${encodeURIComponent(uid)}`,
    /** POST - Credit user wallet. Path: /admin/wallet/user/:user_id/credit. Body: { amount, narration } */
    CREDIT: (userId: string) => `/admin/wallet/user/${encodeURIComponent(userId)}/credit`,
    /** POST - Debit user wallet. Path: /admin/wallet/user/:user_id/debit. Body: { amount, narration } */
    DEBIT: (userId: string) => `/admin/wallet/user/${encodeURIComponent(userId)}/debit`,
    /** GET - Get a specific user's wallet. Path: /admin/wallet/:user_id/user */
    GET_USER: (userId: string) => `/admin/wallet/${encodeURIComponent(userId)}/user`,
    /** POST - Freeze a wallet. Body: { wallet_id?, user_id?, frozen? } */
    FREEZE: '/admin/wallet/freeze',
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
    /** GET - Verify contact has iMessage (Postman: verify imessage Contact). Query: contact_id */
    IMESSAGE_VERIFY: '/contact/imessage/verify',
  },
  /** Outreach (Postman: Blast). POST /outreach/blast. Body: technician_id OR shop_id (mutually exclusive). */
  OUTREACH: {
    /** POST - Blast outreach. Body: { contact_ids, initial_outreach_message, technician_id } (shop_id later) */
    BLAST: '/outreach/blast',
  },
  /** Offerings (services). Create, update, list, get, delete. JWT required. */
  OFFERINGS: {
    /** POST - Create offering. Body: name, price, duration, description, technician_id, shop_id?, premium_hours?, promo? */
    CREATE: '/offerings',
    /** PUT - Update offering. Body: offering_id, name?, price?, duration?, description?, promo_enabled?, promo? */
    UPDATE: '/offerings',
    /** GET - List offerings. Query: technician_id?, shop_id?, search?, cursor?, from?, to?, page_size? */
    LIST: '/offerings/list',
    /** GET - Get offering by id */
    GET: (id: string) => `/offerings/${encodeURIComponent(id)}`,
    /** DELETE - Delete offering by id */
    DELETE: (id: string) => `/offerings/${encodeURIComponent(id)}`,
  },
  /** GET - Generate signed/served URL for an asset. Query: path, size (e.g. s, m) */
  URL: {
    GENERATE: '/url/generate',
  },
  /** Chat Threads (Postman: Threads). Query and stream. */
  THREADS: {
    /** GET - Query threads. Query: provider_chat_id?, barber_id?, user_id?, conversation_type?, contact_id?, cursor?, from?, to?, page_size?, lean? */
    QUERY: '/threads/query',
    /** GET - Stream messages for a thread. Path: /threads/:id/stream. Query: provider?, page_number?, cursor?, from?, to?, page_size?, lean? */
    STREAM: (id: string) => `/threads/${encodeURIComponent(id)}/stream`,
  },
} as const;
