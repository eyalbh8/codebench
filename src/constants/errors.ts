/**
 * Standardized Error Codes for the Application
 *
 * This file contains all error codes used throughout the application.
 * Each error code includes:
 * - error: Short error identifier
 * - code: Numeric error code
 * - description: Detailed description of the error
 * - title: Human-readable error title
 */

export interface AppError {
  error: string;
  code: number;
  description: string;
  title: string;
}

// Authentication & Authorization Errors (1000-1999)
export const AUTH_ERRORS = {
  UNAUTHORIZED: {
    error: 'UNAUTHORIZED',
    code: 1001,
    description: 'User is not authenticated or authentication token is invalid',
    title: 'Authentication Required',
  },
  FORBIDDEN: {
    error: 'FORBIDDEN',
    code: 1002,
    description: 'User does not have permission to access this resource',
    title: 'Access Denied',
  },
  TOKEN_EXPIRED: {
    error: 'TOKEN_EXPIRED',
    code: 1003,
    description: 'Authentication token has expired',
    title: 'Session Expired',
  },
  INVALID_CREDENTIALS: {
    error: 'INVALID_CREDENTIALS',
    code: 1004,
    description: 'Provided credentials are invalid',
    title: 'Invalid Login',
  },
} as const;

// Validation Errors (2000-2999)
export const VALIDATION_ERRORS = {
  INVALID_INPUT: {
    error: 'INVALID_INPUT',
    code: 2001,
    description: 'The provided input data is invalid or malformed',
    title: 'Invalid Input',
  },
  MISSING_REQUIRED_FIELD: {
    error: 'MISSING_REQUIRED_FIELD',
    code: 2002,
    description: 'A required field is missing from the request',
    title: 'Missing Required Field',
  },
  INVALID_FORMAT: {
    error: 'INVALID_FORMAT',
    code: 2003,
    description: 'The data format is not valid',
    title: 'Invalid Format',
  },
  VALUE_TOO_LONG: {
    error: 'VALUE_TOO_LONG',
    code: 2004,
    description: 'The provided value exceeds the maximum allowed length',
    title: 'Value Too Long',
  },
  VALUE_TOO_SHORT: {
    error: 'VALUE_TOO_SHORT',
    code: 2005,
    description: 'The provided value is below the minimum required length',
    title: 'Value Too Short',
  },
  INVALID_EMAIL: {
    error: 'INVALID_EMAIL',
    code: 2006,
    description: 'The provided email address is not valid',
    title: 'Invalid Email',
  },
  INVALID_URL: {
    error: 'INVALID_URL',
    code: 2007,
    description: 'The provided URL is not valid',
    title: 'Invalid URL',
  },
  MISSING_AI_SETTINGS: {
    error: 'MISSING_AI_SETTINGS',
    code: 2008,
    description: 'The AI settings are missing',
    title: 'Missing AI Settings',
  },
  NO_DATA_TO_UPDATE: {
    error: 'NO_DATA_TO_UPDATE',
    code: 2009,
    description: 'No data provided to update the resource',
    title: 'No Update Data',
  },
  POST_ALREADY_POSTED: {
    error: 'POST_ALREADY_POSTED',
    code: 2010,
    description: 'The post is already posted',
    title: 'Post Already Posted',
  },
  NO_IMAGES_TO_REMOVE: {
    error: 'NO_IMAGES_TO_REMOVE',
    code: 2011,
    description: 'No images provided to remove',
    title: 'No Images to Remove',
  },
  INVALID_SOCIAL_NETWORK_FOR_AI_SETTINGS: {
    error: 'INVALID_SOCIAL_NETWORK_FOR_AI_SETTINGS',
    code: 2012,
    description: 'The social network is not valid for AI settings',
    title: 'Invalid Social Network for AI Settings',
  },
  MISSING_GENERATION_ID: {
    error: 'MISSING_GENERATION_ID',
    code: 2013,
    description: 'The generation ID is missing',
    title: 'Missing Generation ID',
  },
  USED_STEP_NOT_FOUND: {
    error: 'USED_STEP_NOT_FOUND',
    code: 2014,
    description: 'The used step was not found',
    title: 'Used Step Not Found',
  },
  UNSUPPORTED_SOCIAL_MEDIA_PROVIDER: {
    error: 'UNSUPPORTED_SOCIAL_MEDIA_PROVIDER',
    code: 2015,
    description: 'The social media provider is not supported',
    title: 'Unsupported Social Media Provider',
  },
  ACCOUNT_NAME_ALREADY_EXISTS: {
    error: 'ACCOUNT_NAME_ALREADY_EXISTS',
    code: 2016,
    description: 'The account name already exists',
    title: 'Account Name Already Exists',
  },
  PROMPT_ALREADY_EXISTS: {
    error: 'PROMPT_ALREADY_EXISTS',
    code: 2017,
    description: 'The prompt already exists',
    title: 'Prompt Already Exists',
  },
  MULTIPLE_REGIONS_NOT_ALLOWED: {
    error: 'MULTIPLE_REGIONS_NOT_ALLOWED',
    code: 2018,
    description: 'Multiple regions are not allowed',
    title: 'Multiple Regions Not Allowed',
  },
  COMPETITOR_SITE_REQUIRED: {
    error: 'COMPETITOR_SITE_REQUIRED',
    code: 2019,
    description: 'The competitor site is required',
    title: 'Competitor Site Required',
  },
  URLS_REQUIRED_FOR_DONE_STATUS: {
    error: 'URLS_REQUIRED_FOR_DONE_STATUS',
    code: 2020,
    description: 'URLs are required when marking a recommendation as DONE',
    title: 'URLs Required',
  },
} as const;

// Resource Not Found Errors (3000-3999)
export const NOT_FOUND_ERRORS = {
  RESOURCE_NOT_FOUND: {
    error: 'RESOURCE_NOT_FOUND',
    code: 3001,
    description: 'The requested resource was not found',
    title: 'Resource Not Found',
  },
  ACCOUNT_NOT_FOUND: {
    error: 'ACCOUNT_NOT_FOUND',
    code: 3002,
    description: 'The specified account was not found',
    title: 'Account Not Found',
  },
  ACCOUNT_NOT_FOUND_IN_REQUEST: {
    error: 'ACCOUNT_NOT_FOUND_IN_REQUEST',
    code: 3002,
    description: 'The specified account was not found in the request',
    title: 'Account Not Found In Request',
  },
  PROMPT_NOT_FOUND: {
    error: 'PROMPT_NOT_FOUND',
    code: 3003,
    description: 'The specified prompt was not found',
    title: 'Prompt Not Found',
  },
  TOPIC_NOT_FOUND: {
    error: 'TOPIC_NOT_FOUND',
    code: 3004,
    description: 'The specified topic was not found',
    title: 'Topic Not Found',
  },
  USER_NOT_FOUND: {
    error: 'USER_NOT_FOUND',
    code: 3005,
    description: 'The specified user was not found',
    title: 'User Not Found',
  },
  AUTH_USER_NOT_FOUND: {
    error: 'AUTH_USER_NOT_FOUND',
    code: 3005,
    description: 'The specified auth user was not found',
    title: 'Auth User Not Found',
  },
  AUTH_USER_HAVE_NO_ACCOUNTS: {
    error: 'AUTH_USER_HAVE_NO_ACCOUNTS',
    code: 3005,
    description: 'The specified auth user has no accounts',
    title: 'Auth User Have No Accounts',
  },
  REGION_NOT_FOUND: {
    error: 'REGION_NOT_FOUND',
    code: 3006,
    description: 'The specified region was not found',
    title: 'Region Not Found',
  },
  ASYNC_JOB_NOT_FOUND: {
    error: 'ASYNC_JOB_NOT_FOUND',
    code: 3007,
    description: 'The specified async job was not found',
    title: 'Async Job Not Found',
  },
  FEATURE_REQUEST_NOT_FOUND: {
    error: 'FEATURE_REQUEST_NOT_FOUND',
    code: 3008,
    description: 'The specified feature request was not found',
    title: 'Feature Request Not Found',
  },
  REGION_NOT_FOUND_IN_ACCOUNT_SETTINGS: {
    error: 'REGION_NOT_FOUND_IN_ACCOUNT_SETTINGS',
    code: 3009,
    description: 'The specified region was not found in account settings',
    title: 'Region Not Found In Account Settings',
  },
  NO_RUNS_FOUND: {
    error: 'NO_RUNS_FOUND',
    code: 3010,
    description: 'No runs found for the account',
    title: 'No Runs Found',
  },
  ACCOUNT_HAS_NO_STRIPE_CUSTOMER_ID: {
    error: 'ACCOUNT_HAS_NO_STRIPE_CUSTOMER_ID',
    code: 3011,
    description: 'The account has no stripe customer id',
    title: 'Account Has No Stripe Customer ID',
  },
  ACCOUNT_ALREADY_HAS_STRIPE_CUSTOMER_ID: {
    error: 'ACCOUNT_ALREADY_HAS_STRIPE_CUSTOMER_ID',
    code: 3012,
    description: 'The account already has a stripe customer id',
    title: 'Account Already Has Stripe Customer ID',
  },
  POST_NOT_FOUND: {
    error: 'POST_NOT_FOUND',
    code: 3013,
    description: 'The specified post was not found',
    title: 'Post Not Found',
  },
  RECOMMENDATION_NOT_FOUND: {
    error: 'RECOMMENDATION_NOT_FOUND',
    code: 3020,
    description: 'The specified recommendation was not found',
    title: 'Recommendation Not Found',
  },
  PARTNER_NOT_FOUND: {
    error: 'PARTNER_NOT_FOUND',
    code: 3014,
    description: 'The specified partner was not found',
    title: 'Partner Not Found',
  },
  AUTH_USER_EMAIL_NOT_FOUND: {
    error: 'AUTH_USER_EMAIL_NOT_FOUND',
    code: 3015,
    description: 'The specified auth user email was not found',
    title: 'Auth User Email Not Found',
  },
  AUTH_RESPONSE_NOT_OK: {
    error: 'AUTH_RESPONSE_NOT_OK',
    code: 3016,
    description: 'The auth response is not ok',
    title: 'Auth Response Not Ok',
  },
  ACCOUNT_IS_NOT_UNDER_AGENCY: {
    error: 'ACCOUNT_IS_NOT_UNDER_AGENCY',
    code: 3017,
    description:
      'The account is not under agency and cannot perform this action',
    title: 'Account Is Not Under Agency',
  },
  ACCOUNT_HAS_ALREADY_RUN: {
    error: 'ACCOUNT_HAS_ALREADY_RUN',
    code: 3018,
    description: 'The account has already run',
    title: 'Account Has Already Run',
  },
  ACCOUNT_SUBSCRIPTION_NOT_FOUND: {
    error: 'ACCOUNT_SUBSCRIPTION_NOT_FOUND',
    code: 3019,
    description: 'The specified account subscription was not found',
    title: 'Account Subscription Not Found',
  },
} as const;

// Business Logic Errors (4000-4999)
export const BUSINESS_ERRORS = {
  ACCOUNT_INACTIVE: {
    error: 'ACCOUNT_INACTIVE',
    code: 4001,
    description: 'The account is not active and cannot perform this action',
    title: 'Account Inactive',
  },
  ACCOUNT_NOT_IN_INITIAL_STATE: {
    error: 'ACCOUNT_NOT_IN_INITIAL_STATE',
    code: 4002,
    description:
      'The account is not in initial state and cannot perform this action',
    title: 'Account Not In Initial State',
  },
  POST_CREATION_LIMIT_REACHED: {
    error: 'POST_CREATION_LIMIT_REACHED',
    code: 4003,
    description:
      'The maximum number of posts for this account has been reached',
    title: 'Post Creation Limit Reached',
  },
  POST_CREATION_LIMIT_NOT_SET: {
    error: 'POST_CREATION_LIMIT_NOT_SET',
    code: 4003,
    description: 'The post creation limit is not set for this account',
    title: 'Post Creation Limit Not Set',
  },
  PROMPT_LIMIT_REACHED: {
    error: 'PROMPT_LIMIT_REACHED',
    code: 4002,
    description:
      'The maximum number of prompts for this account has been reached',
    title: 'Prompt Limit Reached',
  },
  REGION_LIMIT_REACHED: {
    error: 'REGION_LIMIT_REACHED',
    code: 4003,
    description:
      'The maximum number of regions for this account has been reached',
    title: 'Region Limit Reached',
  },
  ACCOUNT_SETTINGS_NOT_FOUND: {
    error: 'ACCOUNT_SETTINGS_NOT_FOUND',
    code: 4004,
    description: 'Account settings not found',
    title: 'Settings Not Found',
  },
  PROMPT_NOT_SUGGESTED: {
    error: 'PROMPT_NOT_SUGGESTED',
    code: 4005,
    description: 'The prompt is not in suggested state and cannot be accepted',
    title: 'Invalid Prompt State',
  },
  NO_TOPICS_FOUND: {
    error: 'NO_TOPICS_FOUND',
    code: 4006,
    description: 'No active topics found for the account',
    title: 'No Topics Available',
  },
  INACTIVE_TOPICS: {
    error: 'INACTIVE_TOPICS',
    code: 4007,
    description: 'Some of the specified topics are not active',
    title: 'Inactive Topics',
  },
  MAX_PROMPTS_REACHED: {
    error: 'MAX_PROMPTS_REACHED',
    code: 4008,
    description: 'Maximum number of suggested prompts has been reached',
    title: 'Maximum Prompts Reached',
  },
  NO_PROMPTS_SUGGESTED: {
    error: 'NO_PROMPTS_SUGGESTED',
    code: 4009,
    description: 'No prompts were suggested by the AI service',
    title: 'No Prompts Generated',
  },
  NO_PROMPTS_INTENTIONS_GENERATED: {
    error: 'NO_PROMPTS_INTENTIONS_GENERATED',
    code: 4010,
    description: 'No prompts intentions were generated by the AI service',
    title: 'No Prompts Intentions Generated',
  },
  NO_TOPICS_SUGGESTED: {
    error: 'NO_TOPICS_SUGGESTED',
    code: 4010,
    description: 'No topics were suggested by the AI service',
    title: 'No Topics Generated',
  },
  NO_TOPICS_VOLUMES_GENERATED: {
    error: 'NO_TOPICS_VOLUMES_GENERATED',
    code: 4011,
    description: 'No topics volumes were generated by the AI service',
    title: 'No Topics Volumes Generated',
  },
  NO_DATA_TO_UPDATE: {
    error: 'NO_DATA_TO_UPDATE',
    code: 4010,
    description: 'No data provided to update the resource',
    title: 'No Update Data',
  },
  NO_REGIONS_FOUND: {
    error: 'NO_REGIONS_FOUND',
    code: 4011,
    description: 'No regions found in account settings',
    title: 'No Regions Configured',
  },
  NO_TOPICS_FOR_GENERATION: {
    error: 'NO_TOPICS_FOR_GENERATION',
    code: 4012,
    description: 'No topics received for prompt generation',
    title: 'No Topics Provided',
  },
  NO_PROMPTS_LIMIT_SET: {
    error: 'NO_PROMPTS_LIMIT_SET',
    code: 4013,
    description: 'No prompts limit set in account settings',
    title: 'No Prompts Limit Set',
  },
  PRODUCT_HAS_NO_PRICES: {
    error: 'PRODUCT_HAS_NO_PRICES',
    code: 4014,
    description: 'The product has no prices',
    title: 'Product Has No Prices',
  },
  ACCOUNT_HAS_ACTIVE_SUBSCRIPTIONS: {
    error: 'ACCOUNT_HAS_ACTIVE_SUBSCRIPTIONS',
    code: 4015,
    description: 'The account has active subscriptions',
    title: 'Account Has Active Subscriptions',
  },
  REGION_NOT_FOUND_IN_ACCOUNT_SETTINGS: {
    error: 'REGION_NOT_FOUND_IN_ACCOUNT_SETTINGS',
    code: 4018,
    description: 'The specified region is not configured in account settings',
    title: 'Region Not Configured',
  },
  REQUEST_BODY_REQUIRED: {
    error: 'REQUEST_BODY_REQUIRED',
    code: 4022,
    description: 'Request body is required for this operation',
    title: 'Request Body Required',
  },
  INVALID_REQUEST_BODY_FORMAT: {
    error: 'INVALID_REQUEST_BODY_FORMAT',
    code: 4023,
    description: 'Invalid request body format',
    title: 'Invalid Request Format',
  },
  POSTS_ALREADY_IN_PROGRESS: {
    error: 'POSTS_ALREADY_IN_PROGRESS',
    code: 4024,
    description: 'Posts are already in progress for this account',
    title: 'Posts In Progress',
  },
  POSTS_LIMIT_EXCEEDED: {
    error: 'POSTS_LIMIT_EXCEEDED',
    code: 4025,
    description: 'Posts limit exceeded for this account',
    title: 'Posts Limit Exceeded',
  },
  NO_CONTENT_GENERATED: {
    error: 'NO_CONTENT_GENERATED',
    code: 4024,
    description: 'No content generated',
    title: 'No Content Generated',
  },
  NO_SESSION_TOKEN: {
    error: 'NO_SESSION_TOKEN',
    code: 4026,
    description: 'No session token provided',
    title: 'Session Token Required',
  },
  MISSING_USER_ID: {
    error: 'MISSING_USER_ID',
    code: 4027,
    description: 'Missing user ID in request',
    title: 'User ID Required',
  },
  INVALID_SESSION_TOKEN: {
    error: 'INVALID_SESSION_TOKEN',
    code: 4028,
    description: 'Invalid session token',
    title: 'Invalid Session',
  },
  USER_NOT_VALIDATED: {
    error: 'USER_NOT_VALIDATED',
    code: 4029,
    description: 'User not validated',
    title: 'User Not Validated',
  },
  DB_USER_NOT_FOUND: {
    error: 'DB_USER_NOT_FOUND',
    code: 4030,
    description: 'User not found in database',
    title: 'Database User Not Found',
  },
  INSUFFICIENT_PERMISSIONS: {
    error: 'INSUFFICIENT_PERMISSIONS',
    code: 4031,
    description: 'Insufficient permissions for this operation',
    title: 'Access Denied',
  },
  SYSTEM_ASMIN_INSUFFICIENT_PERMISSIONS: {
    error: 'SYSTEM_ASMIN_INSUFFICIENT_PERMISSIONS',
    code: 4031,
    description: 'Insufficient permissions for this operation',
    title: 'Access Denied',
  },
  MISSING_ACCOUNT_ID: {
    error: 'MISSING_ACCOUNT_ID',
    code: 4032,
    description: 'Missing account ID in request',
    title: 'Account ID Required',
  },
  MISSING_USAGE_OR_SETTINGS: {
    error: 'MISSING_USAGE_OR_SETTINGS',
    code: 4033,
    description: 'Missing usage or settings data',
    title: 'Usage Data Required',
  },
  PROMPT_LIMIT_NOT_SET: {
    error: 'PROMPT_LIMIT_NOT_SET',
    code: 4034,
    description: 'Prompt limit not set in account settings',
    title: 'Prompt Limit Not Set',
  },
  PROMPT_LIMIT_EXCEEDED: {
    error: 'PROMPT_LIMIT_EXCEEDED',
    code: 4035,
    description: 'Prompt limit exceeded for this account',
    title: 'Prompt Limit Exceeded',
  },
  REGION_LIMIT_NOT_SET: {
    error: 'REGION_LIMIT_NOT_SET',
    code: 4036,
    description: 'Region limit not set in account settings',
    title: 'Region Limit Not Set',
  },
  REGION_LIMIT_EXCEEDED: {
    error: 'REGION_LIMIT_EXCEEDED',
    code: 4037,
    description: 'Region limit exceeded for this account',
    title: 'Region Limit Exceeded',
  },
  USER_ALREADY_HAS_ACCOUNTS: {
    error: 'USER_ALREADY_HAS_ACCOUNTS',
    code: 4038,
    description: 'User already has accounts',
    title: 'User Already Has Accounts',
  },
  MISSING_SUB_TOKEN: {
    error: 'MISSING_SUB_TOKEN',
    code: 4039,
    description: 'Missing sub token in request',
    title: 'Sub Token Required',
  },
  INVALID_SESSION_REFRESH_TOKEN: {
    error: 'IINVALID_SESSION_REFRESH_TOKEN',
    code: 4040,
    description: 'Invalid session refresh token',
    title: 'Invalid Session Refresh Token',
  },
  ACCOUNT_MEMBERS_LIMIT_EXCEEDED: {
    error: 'ACCOUNT_MEMBERS_LIMIT_EXCEEDED',
    code: 4041,
    description: 'Account members limit exceeded',
    title: 'Account Members Limit Exceeded',
  },
  ACCOUNT_MEMBERS_LIMIT_NOT_SET: {
    error: 'ACCOUNT_MEMBERS_LIMIT_NOT_SET',
    code: 4042,
    description: 'Account members limit not set',
    title: 'Account Members Limit Not Set',
  },
  IS_AGENCY_INSUFFICIENT_PERMISSIONS: {
    error: 'IS_AGENCY_INSUFFICIENT_PERMISSIONS',
    code: 4043,
    description: 'Insufficient permissions for this operation',
    title: 'Access Denied',
  },
  INSIGHT_LIMIT_EXCEEDED: {
    error: 'INSIGHT_LIMIT_EXCEEDED',
    code: 4044,
    description: 'Insight generation limit exceeded for this account',
    title: 'Insight Limit Exceeded',
  },
  INSIGHT_LIMIT_NOT_SET: {
    error: 'INSIGHT_LIMIT_NOT_SET',
    code: 4045,
    description: 'Insight limit not set in account settings',
    title: 'Insight Limit Not Set',
  },
} as const;

// External Service Errors (5000-5999)
export const EXTERNAL_SERVICE_ERRORS = {
  LLM_SERVICE_ERROR: {
    error: 'LLM_SERVICE_ERROR',
    code: 5001,
    description: 'Error occurred while communicating with the LLM service',
    title: 'AI Service Error',
  },
  DATABASE_ERROR: {
    error: 'DATABASE_ERROR',
    code: 5002,
    description: 'An error occurred while accessing the database',
    title: 'Database Error',
  },
  AWS_SERVICE_ERROR: {
    error: 'AWS_SERVICE_ERROR',
    code: 5003,
    description: 'An error occurred while communicating with AWS services',
    title: 'Cloud Service Error',
  },
  THIRD_PARTY_API_ERROR: {
    error: 'THIRD_PARTY_API_ERROR',
    code: 5004,
    description: 'An error occurred while communicating with a third-party API',
    title: 'External Service Error',
  },
  UPDATE_FAILED: {
    error: 'UPDATE_FAILED',
    code: 5005,
    description: 'An error occurred while updating the resource',
    title: 'Update Failed',
  },
} as const;

// System Errors (6000-6999)
export const SYSTEM_ERRORS = {
  INTERNAL_SERVER_ERROR: {
    error: 'INTERNAL_SERVER_ERROR',
    code: 6001,
    description: 'An unexpected error occurred on the server',
    title: 'Internal Server Error',
  },
  SERVICE_UNAVAILABLE: {
    error: 'SERVICE_UNAVAILABLE',
    code: 6002,
    description: 'The service is temporarily unavailable',
    title: 'Service Unavailable',
  },
  CONFIGURATION_ERROR: {
    error: 'CONFIGURATION_ERROR',
    code: 6003,
    description: 'A configuration error occurred',
    title: 'Configuration Error',
  },
  RATE_LIMIT_EXCEEDED: {
    error: 'RATE_LIMIT_EXCEEDED',
    code: 6004,
    description: 'Too many requests have been made, please try again later',
    title: 'Rate Limit Exceeded',
  },
  MAX_PROMPT_SUGGESTIONS_NOT_SET: {
    error: 'MAX_PROMPT_SUGGESTIONS_NOT_SET',
    code: 6005,
    description: 'Max prompt suggestions not set',
    title: 'Max Prompt Suggestions Not Set',
  },
  REDDIT_CONFIGURATION_NOT_SET: {
    error: 'REDDIT_CONFIGURATION_NOT_SET',
    code: 6006,
    description: 'Reddit configuration not set',
    title: 'Reddit Configuration Not Set',
  },
  REDDIT_SERVICE_ERROR: {
    error: 'REDDIT_SERVICE_ERROR',
    code: 6007,
    description:
      'An error occurred while communicating with the Reddit service',
    title: 'Reddit Service Error',
  },
  REDDIT_TOKEN_NOT_FOUND: {
    error: 'REDDIT_TOKEN_NOT_FOUND',
    code: 6008,
    description: 'Reddit token not found',
    title: 'Reddit Token Not Found',
  },
  REDDIT_SUBREDDIT_NOT_FOUND: {
    error: 'REDDIT_SUBREDDIT_NOT_FOUND',
    code: 6009,
    description: 'Reddit subreddit not found',
    title: 'Reddit Subreddit Not Found',
  },
} as const;

// Validation Schema Errors (7000-7999)
export const SCHEMA_ERRORS = {
  VALIDATION_FAILED: {
    error: 'VALIDATION_FAILED',
    code: 7001,
    description: 'Request validation failed',
    title: 'Validation Error',
  },
  SERIALIZATION_FAILED: {
    error: 'SERIALIZATION_FAILED',
    code: 7002,
    description: 'Response serialization failed',
    title: 'Response Error',
  },
} as const;

// Combine all error types for easy access
export const ERROR_CODES = {
  ...AUTH_ERRORS,
  ...VALIDATION_ERRORS,
  ...NOT_FOUND_ERRORS,
  ...BUSINESS_ERRORS,
  ...EXTERNAL_SERVICE_ERRORS,
  ...SYSTEM_ERRORS,
  ...SCHEMA_ERRORS,
} as const;

// Type for all error codes
export type ErrorCode = keyof typeof ERROR_CODES;

// Helper function to get error by code
export function getErrorByCode(code: number): AppError | undefined {
  return Object.values(ERROR_CODES).find((error) => error.code === code);
}

// Helper function to get error by error string
export function getErrorByString(errorString: string): AppError | undefined {
  return Object.values(ERROR_CODES).find(
    (error) => error.error === errorString,
  );
}
