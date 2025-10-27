export interface AppError {
    error: string;
    code: number;
    description: string;
    title: string;
}
export declare const AUTH_ERRORS: {
    readonly UNAUTHORIZED: {
        readonly error: "UNAUTHORIZED";
        readonly code: 1001;
        readonly description: "User is not authenticated or authentication token is invalid";
        readonly title: "Authentication Required";
    };
    readonly FORBIDDEN: {
        readonly error: "FORBIDDEN";
        readonly code: 1002;
        readonly description: "User does not have permission to access this resource";
        readonly title: "Access Denied";
    };
    readonly TOKEN_EXPIRED: {
        readonly error: "TOKEN_EXPIRED";
        readonly code: 1003;
        readonly description: "Authentication token has expired";
        readonly title: "Session Expired";
    };
    readonly INVALID_CREDENTIALS: {
        readonly error: "INVALID_CREDENTIALS";
        readonly code: 1004;
        readonly description: "Provided credentials are invalid";
        readonly title: "Invalid Login";
    };
};
export declare const VALIDATION_ERRORS: {
    readonly INVALID_INPUT: {
        readonly error: "INVALID_INPUT";
        readonly code: 2001;
        readonly description: "The provided input data is invalid or malformed";
        readonly title: "Invalid Input";
    };
    readonly MISSING_REQUIRED_FIELD: {
        readonly error: "MISSING_REQUIRED_FIELD";
        readonly code: 2002;
        readonly description: "A required field is missing from the request";
        readonly title: "Missing Required Field";
    };
    readonly INVALID_FORMAT: {
        readonly error: "INVALID_FORMAT";
        readonly code: 2003;
        readonly description: "The data format is not valid";
        readonly title: "Invalid Format";
    };
    readonly VALUE_TOO_LONG: {
        readonly error: "VALUE_TOO_LONG";
        readonly code: 2004;
        readonly description: "The provided value exceeds the maximum allowed length";
        readonly title: "Value Too Long";
    };
    readonly VALUE_TOO_SHORT: {
        readonly error: "VALUE_TOO_SHORT";
        readonly code: 2005;
        readonly description: "The provided value is below the minimum required length";
        readonly title: "Value Too Short";
    };
    readonly INVALID_EMAIL: {
        readonly error: "INVALID_EMAIL";
        readonly code: 2006;
        readonly description: "The provided email address is not valid";
        readonly title: "Invalid Email";
    };
    readonly INVALID_URL: {
        readonly error: "INVALID_URL";
        readonly code: 2007;
        readonly description: "The provided URL is not valid";
        readonly title: "Invalid URL";
    };
    readonly MISSING_AI_SETTINGS: {
        readonly error: "MISSING_AI_SETTINGS";
        readonly code: 2008;
        readonly description: "The AI settings are missing";
        readonly title: "Missing AI Settings";
    };
    readonly NO_DATA_TO_UPDATE: {
        readonly error: "NO_DATA_TO_UPDATE";
        readonly code: 2009;
        readonly description: "No data provided to update the resource";
        readonly title: "No Update Data";
    };
    readonly POST_ALREADY_POSTED: {
        readonly error: "POST_ALREADY_POSTED";
        readonly code: 2010;
        readonly description: "The post is already posted";
        readonly title: "Post Already Posted";
    };
    readonly NO_IMAGES_TO_REMOVE: {
        readonly error: "NO_IMAGES_TO_REMOVE";
        readonly code: 2011;
        readonly description: "No images provided to remove";
        readonly title: "No Images to Remove";
    };
    readonly INVALID_SOCIAL_NETWORK_FOR_AI_SETTINGS: {
        readonly error: "INVALID_SOCIAL_NETWORK_FOR_AI_SETTINGS";
        readonly code: 2012;
        readonly description: "The social network is not valid for AI settings";
        readonly title: "Invalid Social Network for AI Settings";
    };
    readonly MISSING_GENERATION_ID: {
        readonly error: "MISSING_GENERATION_ID";
        readonly code: 2013;
        readonly description: "The generation ID is missing";
        readonly title: "Missing Generation ID";
    };
    readonly USED_STEP_NOT_FOUND: {
        readonly error: "USED_STEP_NOT_FOUND";
        readonly code: 2014;
        readonly description: "The used step was not found";
        readonly title: "Used Step Not Found";
    };
    readonly UNSUPPORTED_SOCIAL_MEDIA_PROVIDER: {
        readonly error: "UNSUPPORTED_SOCIAL_MEDIA_PROVIDER";
        readonly code: 2015;
        readonly description: "The social media provider is not supported";
        readonly title: "Unsupported Social Media Provider";
    };
    readonly ACCOUNT_NAME_ALREADY_EXISTS: {
        readonly error: "ACCOUNT_NAME_ALREADY_EXISTS";
        readonly code: 2016;
        readonly description: "The account name already exists";
        readonly title: "Account Name Already Exists";
    };
    readonly PROMPT_ALREADY_EXISTS: {
        readonly error: "PROMPT_ALREADY_EXISTS";
        readonly code: 2017;
        readonly description: "The prompt already exists";
        readonly title: "Prompt Already Exists";
    };
    readonly MULTIPLE_REGIONS_NOT_ALLOWED: {
        readonly error: "MULTIPLE_REGIONS_NOT_ALLOWED";
        readonly code: 2018;
        readonly description: "Multiple regions are not allowed";
        readonly title: "Multiple Regions Not Allowed";
    };
    readonly COMPETITOR_SITE_REQUIRED: {
        readonly error: "COMPETITOR_SITE_REQUIRED";
        readonly code: 2019;
        readonly description: "The competitor site is required";
        readonly title: "Competitor Site Required";
    };
    readonly URLS_REQUIRED_FOR_DONE_STATUS: {
        readonly error: "URLS_REQUIRED_FOR_DONE_STATUS";
        readonly code: 2020;
        readonly description: "URLs are required when marking a recommendation as DONE";
        readonly title: "URLs Required";
    };
};
export declare const NOT_FOUND_ERRORS: {
    readonly RESOURCE_NOT_FOUND: {
        readonly error: "RESOURCE_NOT_FOUND";
        readonly code: 3001;
        readonly description: "The requested resource was not found";
        readonly title: "Resource Not Found";
    };
    readonly ACCOUNT_NOT_FOUND: {
        readonly error: "ACCOUNT_NOT_FOUND";
        readonly code: 3002;
        readonly description: "The specified account was not found";
        readonly title: "Account Not Found";
    };
    readonly ACCOUNT_NOT_FOUND_IN_REQUEST: {
        readonly error: "ACCOUNT_NOT_FOUND_IN_REQUEST";
        readonly code: 3002;
        readonly description: "The specified account was not found in the request";
        readonly title: "Account Not Found In Request";
    };
    readonly PROMPT_NOT_FOUND: {
        readonly error: "PROMPT_NOT_FOUND";
        readonly code: 3003;
        readonly description: "The specified prompt was not found";
        readonly title: "Prompt Not Found";
    };
    readonly TOPIC_NOT_FOUND: {
        readonly error: "TOPIC_NOT_FOUND";
        readonly code: 3004;
        readonly description: "The specified topic was not found";
        readonly title: "Topic Not Found";
    };
    readonly USER_NOT_FOUND: {
        readonly error: "USER_NOT_FOUND";
        readonly code: 3005;
        readonly description: "The specified user was not found";
        readonly title: "User Not Found";
    };
    readonly AUTH_USER_NOT_FOUND: {
        readonly error: "AUTH_USER_NOT_FOUND";
        readonly code: 3005;
        readonly description: "The specified auth user was not found";
        readonly title: "Auth User Not Found";
    };
    readonly AUTH_USER_HAVE_NO_ACCOUNTS: {
        readonly error: "AUTH_USER_HAVE_NO_ACCOUNTS";
        readonly code: 3005;
        readonly description: "The specified auth user has no accounts";
        readonly title: "Auth User Have No Accounts";
    };
    readonly REGION_NOT_FOUND: {
        readonly error: "REGION_NOT_FOUND";
        readonly code: 3006;
        readonly description: "The specified region was not found";
        readonly title: "Region Not Found";
    };
    readonly ASYNC_JOB_NOT_FOUND: {
        readonly error: "ASYNC_JOB_NOT_FOUND";
        readonly code: 3007;
        readonly description: "The specified async job was not found";
        readonly title: "Async Job Not Found";
    };
    readonly FEATURE_REQUEST_NOT_FOUND: {
        readonly error: "FEATURE_REQUEST_NOT_FOUND";
        readonly code: 3008;
        readonly description: "The specified feature request was not found";
        readonly title: "Feature Request Not Found";
    };
    readonly REGION_NOT_FOUND_IN_ACCOUNT_SETTINGS: {
        readonly error: "REGION_NOT_FOUND_IN_ACCOUNT_SETTINGS";
        readonly code: 3009;
        readonly description: "The specified region was not found in account settings";
        readonly title: "Region Not Found In Account Settings";
    };
    readonly NO_RUNS_FOUND: {
        readonly error: "NO_RUNS_FOUND";
        readonly code: 3010;
        readonly description: "No runs found for the account";
        readonly title: "No Runs Found";
    };
    readonly ACCOUNT_HAS_NO_STRIPE_CUSTOMER_ID: {
        readonly error: "ACCOUNT_HAS_NO_STRIPE_CUSTOMER_ID";
        readonly code: 3011;
        readonly description: "The account has no stripe customer id";
        readonly title: "Account Has No Stripe Customer ID";
    };
    readonly ACCOUNT_ALREADY_HAS_STRIPE_CUSTOMER_ID: {
        readonly error: "ACCOUNT_ALREADY_HAS_STRIPE_CUSTOMER_ID";
        readonly code: 3012;
        readonly description: "The account already has a stripe customer id";
        readonly title: "Account Already Has Stripe Customer ID";
    };
    readonly POST_NOT_FOUND: {
        readonly error: "POST_NOT_FOUND";
        readonly code: 3013;
        readonly description: "The specified post was not found";
        readonly title: "Post Not Found";
    };
    readonly RECOMMENDATION_NOT_FOUND: {
        readonly error: "RECOMMENDATION_NOT_FOUND";
        readonly code: 3020;
        readonly description: "The specified recommendation was not found";
        readonly title: "Recommendation Not Found";
    };
    readonly PARTNER_NOT_FOUND: {
        readonly error: "PARTNER_NOT_FOUND";
        readonly code: 3014;
        readonly description: "The specified partner was not found";
        readonly title: "Partner Not Found";
    };
    readonly AUTH_USER_EMAIL_NOT_FOUND: {
        readonly error: "AUTH_USER_EMAIL_NOT_FOUND";
        readonly code: 3015;
        readonly description: "The specified auth user email was not found";
        readonly title: "Auth User Email Not Found";
    };
    readonly AUTH_RESPONSE_NOT_OK: {
        readonly error: "AUTH_RESPONSE_NOT_OK";
        readonly code: 3016;
        readonly description: "The auth response is not ok";
        readonly title: "Auth Response Not Ok";
    };
    readonly ACCOUNT_IS_NOT_UNDER_AGENCY: {
        readonly error: "ACCOUNT_IS_NOT_UNDER_AGENCY";
        readonly code: 3017;
        readonly description: "The account is not under agency and cannot perform this action";
        readonly title: "Account Is Not Under Agency";
    };
    readonly ACCOUNT_HAS_ALREADY_RUN: {
        readonly error: "ACCOUNT_HAS_ALREADY_RUN";
        readonly code: 3018;
        readonly description: "The account has already run";
        readonly title: "Account Has Already Run";
    };
    readonly ACCOUNT_SUBSCRIPTION_NOT_FOUND: {
        readonly error: "ACCOUNT_SUBSCRIPTION_NOT_FOUND";
        readonly code: 3019;
        readonly description: "The specified account subscription was not found";
        readonly title: "Account Subscription Not Found";
    };
};
export declare const BUSINESS_ERRORS: {
    readonly ACCOUNT_INACTIVE: {
        readonly error: "ACCOUNT_INACTIVE";
        readonly code: 4001;
        readonly description: "The account is not active and cannot perform this action";
        readonly title: "Account Inactive";
    };
    readonly ACCOUNT_NOT_IN_INITIAL_STATE: {
        readonly error: "ACCOUNT_NOT_IN_INITIAL_STATE";
        readonly code: 4002;
        readonly description: "The account is not in initial state and cannot perform this action";
        readonly title: "Account Not In Initial State";
    };
    readonly POST_CREATION_LIMIT_REACHED: {
        readonly error: "POST_CREATION_LIMIT_REACHED";
        readonly code: 4003;
        readonly description: "The maximum number of posts for this account has been reached";
        readonly title: "Post Creation Limit Reached";
    };
    readonly POST_CREATION_LIMIT_NOT_SET: {
        readonly error: "POST_CREATION_LIMIT_NOT_SET";
        readonly code: 4003;
        readonly description: "The post creation limit is not set for this account";
        readonly title: "Post Creation Limit Not Set";
    };
    readonly PROMPT_LIMIT_REACHED: {
        readonly error: "PROMPT_LIMIT_REACHED";
        readonly code: 4002;
        readonly description: "The maximum number of prompts for this account has been reached";
        readonly title: "Prompt Limit Reached";
    };
    readonly REGION_LIMIT_REACHED: {
        readonly error: "REGION_LIMIT_REACHED";
        readonly code: 4003;
        readonly description: "The maximum number of regions for this account has been reached";
        readonly title: "Region Limit Reached";
    };
    readonly ACCOUNT_SETTINGS_NOT_FOUND: {
        readonly error: "ACCOUNT_SETTINGS_NOT_FOUND";
        readonly code: 4004;
        readonly description: "Account settings not found";
        readonly title: "Settings Not Found";
    };
    readonly PROMPT_NOT_SUGGESTED: {
        readonly error: "PROMPT_NOT_SUGGESTED";
        readonly code: 4005;
        readonly description: "The prompt is not in suggested state and cannot be accepted";
        readonly title: "Invalid Prompt State";
    };
    readonly NO_TOPICS_FOUND: {
        readonly error: "NO_TOPICS_FOUND";
        readonly code: 4006;
        readonly description: "No active topics found for the account";
        readonly title: "No Topics Available";
    };
    readonly INACTIVE_TOPICS: {
        readonly error: "INACTIVE_TOPICS";
        readonly code: 4007;
        readonly description: "Some of the specified topics are not active";
        readonly title: "Inactive Topics";
    };
    readonly MAX_PROMPTS_REACHED: {
        readonly error: "MAX_PROMPTS_REACHED";
        readonly code: 4008;
        readonly description: "Maximum number of suggested prompts has been reached";
        readonly title: "Maximum Prompts Reached";
    };
    readonly NO_PROMPTS_SUGGESTED: {
        readonly error: "NO_PROMPTS_SUGGESTED";
        readonly code: 4009;
        readonly description: "No prompts were suggested by the AI service";
        readonly title: "No Prompts Generated";
    };
    readonly NO_PROMPTS_INTENTIONS_GENERATED: {
        readonly error: "NO_PROMPTS_INTENTIONS_GENERATED";
        readonly code: 4010;
        readonly description: "No prompts intentions were generated by the AI service";
        readonly title: "No Prompts Intentions Generated";
    };
    readonly NO_TOPICS_SUGGESTED: {
        readonly error: "NO_TOPICS_SUGGESTED";
        readonly code: 4010;
        readonly description: "No topics were suggested by the AI service";
        readonly title: "No Topics Generated";
    };
    readonly NO_TOPICS_VOLUMES_GENERATED: {
        readonly error: "NO_TOPICS_VOLUMES_GENERATED";
        readonly code: 4011;
        readonly description: "No topics volumes were generated by the AI service";
        readonly title: "No Topics Volumes Generated";
    };
    readonly NO_DATA_TO_UPDATE: {
        readonly error: "NO_DATA_TO_UPDATE";
        readonly code: 4010;
        readonly description: "No data provided to update the resource";
        readonly title: "No Update Data";
    };
    readonly NO_REGIONS_FOUND: {
        readonly error: "NO_REGIONS_FOUND";
        readonly code: 4011;
        readonly description: "No regions found in account settings";
        readonly title: "No Regions Configured";
    };
    readonly NO_TOPICS_FOR_GENERATION: {
        readonly error: "NO_TOPICS_FOR_GENERATION";
        readonly code: 4012;
        readonly description: "No topics received for prompt generation";
        readonly title: "No Topics Provided";
    };
    readonly NO_PROMPTS_LIMIT_SET: {
        readonly error: "NO_PROMPTS_LIMIT_SET";
        readonly code: 4013;
        readonly description: "No prompts limit set in account settings";
        readonly title: "No Prompts Limit Set";
    };
    readonly PRODUCT_HAS_NO_PRICES: {
        readonly error: "PRODUCT_HAS_NO_PRICES";
        readonly code: 4014;
        readonly description: "The product has no prices";
        readonly title: "Product Has No Prices";
    };
    readonly ACCOUNT_HAS_ACTIVE_SUBSCRIPTIONS: {
        readonly error: "ACCOUNT_HAS_ACTIVE_SUBSCRIPTIONS";
        readonly code: 4015;
        readonly description: "The account has active subscriptions";
        readonly title: "Account Has Active Subscriptions";
    };
    readonly REGION_NOT_FOUND_IN_ACCOUNT_SETTINGS: {
        readonly error: "REGION_NOT_FOUND_IN_ACCOUNT_SETTINGS";
        readonly code: 4018;
        readonly description: "The specified region is not configured in account settings";
        readonly title: "Region Not Configured";
    };
    readonly REQUEST_BODY_REQUIRED: {
        readonly error: "REQUEST_BODY_REQUIRED";
        readonly code: 4022;
        readonly description: "Request body is required for this operation";
        readonly title: "Request Body Required";
    };
    readonly INVALID_REQUEST_BODY_FORMAT: {
        readonly error: "INVALID_REQUEST_BODY_FORMAT";
        readonly code: 4023;
        readonly description: "Invalid request body format";
        readonly title: "Invalid Request Format";
    };
    readonly POSTS_ALREADY_IN_PROGRESS: {
        readonly error: "POSTS_ALREADY_IN_PROGRESS";
        readonly code: 4024;
        readonly description: "Posts are already in progress for this account";
        readonly title: "Posts In Progress";
    };
    readonly POSTS_LIMIT_EXCEEDED: {
        readonly error: "POSTS_LIMIT_EXCEEDED";
        readonly code: 4025;
        readonly description: "Posts limit exceeded for this account";
        readonly title: "Posts Limit Exceeded";
    };
    readonly NO_CONTENT_GENERATED: {
        readonly error: "NO_CONTENT_GENERATED";
        readonly code: 4024;
        readonly description: "No content generated";
        readonly title: "No Content Generated";
    };
    readonly NO_SESSION_TOKEN: {
        readonly error: "NO_SESSION_TOKEN";
        readonly code: 4026;
        readonly description: "No session token provided";
        readonly title: "Session Token Required";
    };
    readonly MISSING_USER_ID: {
        readonly error: "MISSING_USER_ID";
        readonly code: 4027;
        readonly description: "Missing user ID in request";
        readonly title: "User ID Required";
    };
    readonly INVALID_SESSION_TOKEN: {
        readonly error: "INVALID_SESSION_TOKEN";
        readonly code: 4028;
        readonly description: "Invalid session token";
        readonly title: "Invalid Session";
    };
    readonly USER_NOT_VALIDATED: {
        readonly error: "USER_NOT_VALIDATED";
        readonly code: 4029;
        readonly description: "User not validated";
        readonly title: "User Not Validated";
    };
    readonly DB_USER_NOT_FOUND: {
        readonly error: "DB_USER_NOT_FOUND";
        readonly code: 4030;
        readonly description: "User not found in database";
        readonly title: "Database User Not Found";
    };
    readonly INSUFFICIENT_PERMISSIONS: {
        readonly error: "INSUFFICIENT_PERMISSIONS";
        readonly code: 4031;
        readonly description: "Insufficient permissions for this operation";
        readonly title: "Access Denied";
    };
    readonly SYSTEM_ASMIN_INSUFFICIENT_PERMISSIONS: {
        readonly error: "SYSTEM_ASMIN_INSUFFICIENT_PERMISSIONS";
        readonly code: 4031;
        readonly description: "Insufficient permissions for this operation";
        readonly title: "Access Denied";
    };
    readonly MISSING_ACCOUNT_ID: {
        readonly error: "MISSING_ACCOUNT_ID";
        readonly code: 4032;
        readonly description: "Missing account ID in request";
        readonly title: "Account ID Required";
    };
    readonly MISSING_USAGE_OR_SETTINGS: {
        readonly error: "MISSING_USAGE_OR_SETTINGS";
        readonly code: 4033;
        readonly description: "Missing usage or settings data";
        readonly title: "Usage Data Required";
    };
    readonly PROMPT_LIMIT_NOT_SET: {
        readonly error: "PROMPT_LIMIT_NOT_SET";
        readonly code: 4034;
        readonly description: "Prompt limit not set in account settings";
        readonly title: "Prompt Limit Not Set";
    };
    readonly PROMPT_LIMIT_EXCEEDED: {
        readonly error: "PROMPT_LIMIT_EXCEEDED";
        readonly code: 4035;
        readonly description: "Prompt limit exceeded for this account";
        readonly title: "Prompt Limit Exceeded";
    };
    readonly REGION_LIMIT_NOT_SET: {
        readonly error: "REGION_LIMIT_NOT_SET";
        readonly code: 4036;
        readonly description: "Region limit not set in account settings";
        readonly title: "Region Limit Not Set";
    };
    readonly REGION_LIMIT_EXCEEDED: {
        readonly error: "REGION_LIMIT_EXCEEDED";
        readonly code: 4037;
        readonly description: "Region limit exceeded for this account";
        readonly title: "Region Limit Exceeded";
    };
    readonly USER_ALREADY_HAS_ACCOUNTS: {
        readonly error: "USER_ALREADY_HAS_ACCOUNTS";
        readonly code: 4038;
        readonly description: "User already has accounts";
        readonly title: "User Already Has Accounts";
    };
    readonly MISSING_SUB_TOKEN: {
        readonly error: "MISSING_SUB_TOKEN";
        readonly code: 4039;
        readonly description: "Missing sub token in request";
        readonly title: "Sub Token Required";
    };
    readonly INVALID_SESSION_REFRESH_TOKEN: {
        readonly error: "IINVALID_SESSION_REFRESH_TOKEN";
        readonly code: 4040;
        readonly description: "Invalid session refresh token";
        readonly title: "Invalid Session Refresh Token";
    };
    readonly ACCOUNT_MEMBERS_LIMIT_EXCEEDED: {
        readonly error: "ACCOUNT_MEMBERS_LIMIT_EXCEEDED";
        readonly code: 4041;
        readonly description: "Account members limit exceeded";
        readonly title: "Account Members Limit Exceeded";
    };
    readonly ACCOUNT_MEMBERS_LIMIT_NOT_SET: {
        readonly error: "ACCOUNT_MEMBERS_LIMIT_NOT_SET";
        readonly code: 4042;
        readonly description: "Account members limit not set";
        readonly title: "Account Members Limit Not Set";
    };
    readonly IS_AGENCY_INSUFFICIENT_PERMISSIONS: {
        readonly error: "IS_AGENCY_INSUFFICIENT_PERMISSIONS";
        readonly code: 4043;
        readonly description: "Insufficient permissions for this operation";
        readonly title: "Access Denied";
    };
    readonly INSIGHT_LIMIT_EXCEEDED: {
        readonly error: "INSIGHT_LIMIT_EXCEEDED";
        readonly code: 4044;
        readonly description: "Insight generation limit exceeded for this account";
        readonly title: "Insight Limit Exceeded";
    };
    readonly INSIGHT_LIMIT_NOT_SET: {
        readonly error: "INSIGHT_LIMIT_NOT_SET";
        readonly code: 4045;
        readonly description: "Insight limit not set in account settings";
        readonly title: "Insight Limit Not Set";
    };
};
export declare const EXTERNAL_SERVICE_ERRORS: {
    readonly LLM_SERVICE_ERROR: {
        readonly error: "LLM_SERVICE_ERROR";
        readonly code: 5001;
        readonly description: "Error occurred while communicating with the LLM service";
        readonly title: "AI Service Error";
    };
    readonly DATABASE_ERROR: {
        readonly error: "DATABASE_ERROR";
        readonly code: 5002;
        readonly description: "An error occurred while accessing the database";
        readonly title: "Database Error";
    };
    readonly AWS_SERVICE_ERROR: {
        readonly error: "AWS_SERVICE_ERROR";
        readonly code: 5003;
        readonly description: "An error occurred while communicating with AWS services";
        readonly title: "Cloud Service Error";
    };
    readonly THIRD_PARTY_API_ERROR: {
        readonly error: "THIRD_PARTY_API_ERROR";
        readonly code: 5004;
        readonly description: "An error occurred while communicating with a third-party API";
        readonly title: "External Service Error";
    };
    readonly UPDATE_FAILED: {
        readonly error: "UPDATE_FAILED";
        readonly code: 5005;
        readonly description: "An error occurred while updating the resource";
        readonly title: "Update Failed";
    };
};
export declare const SYSTEM_ERRORS: {
    readonly INTERNAL_SERVER_ERROR: {
        readonly error: "INTERNAL_SERVER_ERROR";
        readonly code: 6001;
        readonly description: "An unexpected error occurred on the server";
        readonly title: "Internal Server Error";
    };
    readonly SERVICE_UNAVAILABLE: {
        readonly error: "SERVICE_UNAVAILABLE";
        readonly code: 6002;
        readonly description: "The service is temporarily unavailable";
        readonly title: "Service Unavailable";
    };
    readonly CONFIGURATION_ERROR: {
        readonly error: "CONFIGURATION_ERROR";
        readonly code: 6003;
        readonly description: "A configuration error occurred";
        readonly title: "Configuration Error";
    };
    readonly RATE_LIMIT_EXCEEDED: {
        readonly error: "RATE_LIMIT_EXCEEDED";
        readonly code: 6004;
        readonly description: "Too many requests have been made, please try again later";
        readonly title: "Rate Limit Exceeded";
    };
    readonly MAX_PROMPT_SUGGESTIONS_NOT_SET: {
        readonly error: "MAX_PROMPT_SUGGESTIONS_NOT_SET";
        readonly code: 6005;
        readonly description: "Max prompt suggestions not set";
        readonly title: "Max Prompt Suggestions Not Set";
    };
    readonly REDDIT_CONFIGURATION_NOT_SET: {
        readonly error: "REDDIT_CONFIGURATION_NOT_SET";
        readonly code: 6006;
        readonly description: "Reddit configuration not set";
        readonly title: "Reddit Configuration Not Set";
    };
    readonly REDDIT_SERVICE_ERROR: {
        readonly error: "REDDIT_SERVICE_ERROR";
        readonly code: 6007;
        readonly description: "An error occurred while communicating with the Reddit service";
        readonly title: "Reddit Service Error";
    };
    readonly REDDIT_TOKEN_NOT_FOUND: {
        readonly error: "REDDIT_TOKEN_NOT_FOUND";
        readonly code: 6008;
        readonly description: "Reddit token not found";
        readonly title: "Reddit Token Not Found";
    };
    readonly REDDIT_SUBREDDIT_NOT_FOUND: {
        readonly error: "REDDIT_SUBREDDIT_NOT_FOUND";
        readonly code: 6009;
        readonly description: "Reddit subreddit not found";
        readonly title: "Reddit Subreddit Not Found";
    };
};
export declare const SCHEMA_ERRORS: {
    readonly VALIDATION_FAILED: {
        readonly error: "VALIDATION_FAILED";
        readonly code: 7001;
        readonly description: "Request validation failed";
        readonly title: "Validation Error";
    };
    readonly SERIALIZATION_FAILED: {
        readonly error: "SERIALIZATION_FAILED";
        readonly code: 7002;
        readonly description: "Response serialization failed";
        readonly title: "Response Error";
    };
};
export declare const ERROR_CODES: {
    readonly VALIDATION_FAILED: {
        readonly error: "VALIDATION_FAILED";
        readonly code: 7001;
        readonly description: "Request validation failed";
        readonly title: "Validation Error";
    };
    readonly SERIALIZATION_FAILED: {
        readonly error: "SERIALIZATION_FAILED";
        readonly code: 7002;
        readonly description: "Response serialization failed";
        readonly title: "Response Error";
    };
    readonly INTERNAL_SERVER_ERROR: {
        readonly error: "INTERNAL_SERVER_ERROR";
        readonly code: 6001;
        readonly description: "An unexpected error occurred on the server";
        readonly title: "Internal Server Error";
    };
    readonly SERVICE_UNAVAILABLE: {
        readonly error: "SERVICE_UNAVAILABLE";
        readonly code: 6002;
        readonly description: "The service is temporarily unavailable";
        readonly title: "Service Unavailable";
    };
    readonly CONFIGURATION_ERROR: {
        readonly error: "CONFIGURATION_ERROR";
        readonly code: 6003;
        readonly description: "A configuration error occurred";
        readonly title: "Configuration Error";
    };
    readonly RATE_LIMIT_EXCEEDED: {
        readonly error: "RATE_LIMIT_EXCEEDED";
        readonly code: 6004;
        readonly description: "Too many requests have been made, please try again later";
        readonly title: "Rate Limit Exceeded";
    };
    readonly MAX_PROMPT_SUGGESTIONS_NOT_SET: {
        readonly error: "MAX_PROMPT_SUGGESTIONS_NOT_SET";
        readonly code: 6005;
        readonly description: "Max prompt suggestions not set";
        readonly title: "Max Prompt Suggestions Not Set";
    };
    readonly REDDIT_CONFIGURATION_NOT_SET: {
        readonly error: "REDDIT_CONFIGURATION_NOT_SET";
        readonly code: 6006;
        readonly description: "Reddit configuration not set";
        readonly title: "Reddit Configuration Not Set";
    };
    readonly REDDIT_SERVICE_ERROR: {
        readonly error: "REDDIT_SERVICE_ERROR";
        readonly code: 6007;
        readonly description: "An error occurred while communicating with the Reddit service";
        readonly title: "Reddit Service Error";
    };
    readonly REDDIT_TOKEN_NOT_FOUND: {
        readonly error: "REDDIT_TOKEN_NOT_FOUND";
        readonly code: 6008;
        readonly description: "Reddit token not found";
        readonly title: "Reddit Token Not Found";
    };
    readonly REDDIT_SUBREDDIT_NOT_FOUND: {
        readonly error: "REDDIT_SUBREDDIT_NOT_FOUND";
        readonly code: 6009;
        readonly description: "Reddit subreddit not found";
        readonly title: "Reddit Subreddit Not Found";
    };
    readonly LLM_SERVICE_ERROR: {
        readonly error: "LLM_SERVICE_ERROR";
        readonly code: 5001;
        readonly description: "Error occurred while communicating with the LLM service";
        readonly title: "AI Service Error";
    };
    readonly DATABASE_ERROR: {
        readonly error: "DATABASE_ERROR";
        readonly code: 5002;
        readonly description: "An error occurred while accessing the database";
        readonly title: "Database Error";
    };
    readonly AWS_SERVICE_ERROR: {
        readonly error: "AWS_SERVICE_ERROR";
        readonly code: 5003;
        readonly description: "An error occurred while communicating with AWS services";
        readonly title: "Cloud Service Error";
    };
    readonly THIRD_PARTY_API_ERROR: {
        readonly error: "THIRD_PARTY_API_ERROR";
        readonly code: 5004;
        readonly description: "An error occurred while communicating with a third-party API";
        readonly title: "External Service Error";
    };
    readonly UPDATE_FAILED: {
        readonly error: "UPDATE_FAILED";
        readonly code: 5005;
        readonly description: "An error occurred while updating the resource";
        readonly title: "Update Failed";
    };
    readonly ACCOUNT_INACTIVE: {
        readonly error: "ACCOUNT_INACTIVE";
        readonly code: 4001;
        readonly description: "The account is not active and cannot perform this action";
        readonly title: "Account Inactive";
    };
    readonly ACCOUNT_NOT_IN_INITIAL_STATE: {
        readonly error: "ACCOUNT_NOT_IN_INITIAL_STATE";
        readonly code: 4002;
        readonly description: "The account is not in initial state and cannot perform this action";
        readonly title: "Account Not In Initial State";
    };
    readonly POST_CREATION_LIMIT_REACHED: {
        readonly error: "POST_CREATION_LIMIT_REACHED";
        readonly code: 4003;
        readonly description: "The maximum number of posts for this account has been reached";
        readonly title: "Post Creation Limit Reached";
    };
    readonly POST_CREATION_LIMIT_NOT_SET: {
        readonly error: "POST_CREATION_LIMIT_NOT_SET";
        readonly code: 4003;
        readonly description: "The post creation limit is not set for this account";
        readonly title: "Post Creation Limit Not Set";
    };
    readonly PROMPT_LIMIT_REACHED: {
        readonly error: "PROMPT_LIMIT_REACHED";
        readonly code: 4002;
        readonly description: "The maximum number of prompts for this account has been reached";
        readonly title: "Prompt Limit Reached";
    };
    readonly REGION_LIMIT_REACHED: {
        readonly error: "REGION_LIMIT_REACHED";
        readonly code: 4003;
        readonly description: "The maximum number of regions for this account has been reached";
        readonly title: "Region Limit Reached";
    };
    readonly ACCOUNT_SETTINGS_NOT_FOUND: {
        readonly error: "ACCOUNT_SETTINGS_NOT_FOUND";
        readonly code: 4004;
        readonly description: "Account settings not found";
        readonly title: "Settings Not Found";
    };
    readonly PROMPT_NOT_SUGGESTED: {
        readonly error: "PROMPT_NOT_SUGGESTED";
        readonly code: 4005;
        readonly description: "The prompt is not in suggested state and cannot be accepted";
        readonly title: "Invalid Prompt State";
    };
    readonly NO_TOPICS_FOUND: {
        readonly error: "NO_TOPICS_FOUND";
        readonly code: 4006;
        readonly description: "No active topics found for the account";
        readonly title: "No Topics Available";
    };
    readonly INACTIVE_TOPICS: {
        readonly error: "INACTIVE_TOPICS";
        readonly code: 4007;
        readonly description: "Some of the specified topics are not active";
        readonly title: "Inactive Topics";
    };
    readonly MAX_PROMPTS_REACHED: {
        readonly error: "MAX_PROMPTS_REACHED";
        readonly code: 4008;
        readonly description: "Maximum number of suggested prompts has been reached";
        readonly title: "Maximum Prompts Reached";
    };
    readonly NO_PROMPTS_SUGGESTED: {
        readonly error: "NO_PROMPTS_SUGGESTED";
        readonly code: 4009;
        readonly description: "No prompts were suggested by the AI service";
        readonly title: "No Prompts Generated";
    };
    readonly NO_PROMPTS_INTENTIONS_GENERATED: {
        readonly error: "NO_PROMPTS_INTENTIONS_GENERATED";
        readonly code: 4010;
        readonly description: "No prompts intentions were generated by the AI service";
        readonly title: "No Prompts Intentions Generated";
    };
    readonly NO_TOPICS_SUGGESTED: {
        readonly error: "NO_TOPICS_SUGGESTED";
        readonly code: 4010;
        readonly description: "No topics were suggested by the AI service";
        readonly title: "No Topics Generated";
    };
    readonly NO_TOPICS_VOLUMES_GENERATED: {
        readonly error: "NO_TOPICS_VOLUMES_GENERATED";
        readonly code: 4011;
        readonly description: "No topics volumes were generated by the AI service";
        readonly title: "No Topics Volumes Generated";
    };
    readonly NO_DATA_TO_UPDATE: {
        readonly error: "NO_DATA_TO_UPDATE";
        readonly code: 4010;
        readonly description: "No data provided to update the resource";
        readonly title: "No Update Data";
    };
    readonly NO_REGIONS_FOUND: {
        readonly error: "NO_REGIONS_FOUND";
        readonly code: 4011;
        readonly description: "No regions found in account settings";
        readonly title: "No Regions Configured";
    };
    readonly NO_TOPICS_FOR_GENERATION: {
        readonly error: "NO_TOPICS_FOR_GENERATION";
        readonly code: 4012;
        readonly description: "No topics received for prompt generation";
        readonly title: "No Topics Provided";
    };
    readonly NO_PROMPTS_LIMIT_SET: {
        readonly error: "NO_PROMPTS_LIMIT_SET";
        readonly code: 4013;
        readonly description: "No prompts limit set in account settings";
        readonly title: "No Prompts Limit Set";
    };
    readonly PRODUCT_HAS_NO_PRICES: {
        readonly error: "PRODUCT_HAS_NO_PRICES";
        readonly code: 4014;
        readonly description: "The product has no prices";
        readonly title: "Product Has No Prices";
    };
    readonly ACCOUNT_HAS_ACTIVE_SUBSCRIPTIONS: {
        readonly error: "ACCOUNT_HAS_ACTIVE_SUBSCRIPTIONS";
        readonly code: 4015;
        readonly description: "The account has active subscriptions";
        readonly title: "Account Has Active Subscriptions";
    };
    readonly REGION_NOT_FOUND_IN_ACCOUNT_SETTINGS: {
        readonly error: "REGION_NOT_FOUND_IN_ACCOUNT_SETTINGS";
        readonly code: 4018;
        readonly description: "The specified region is not configured in account settings";
        readonly title: "Region Not Configured";
    };
    readonly REQUEST_BODY_REQUIRED: {
        readonly error: "REQUEST_BODY_REQUIRED";
        readonly code: 4022;
        readonly description: "Request body is required for this operation";
        readonly title: "Request Body Required";
    };
    readonly INVALID_REQUEST_BODY_FORMAT: {
        readonly error: "INVALID_REQUEST_BODY_FORMAT";
        readonly code: 4023;
        readonly description: "Invalid request body format";
        readonly title: "Invalid Request Format";
    };
    readonly POSTS_ALREADY_IN_PROGRESS: {
        readonly error: "POSTS_ALREADY_IN_PROGRESS";
        readonly code: 4024;
        readonly description: "Posts are already in progress for this account";
        readonly title: "Posts In Progress";
    };
    readonly POSTS_LIMIT_EXCEEDED: {
        readonly error: "POSTS_LIMIT_EXCEEDED";
        readonly code: 4025;
        readonly description: "Posts limit exceeded for this account";
        readonly title: "Posts Limit Exceeded";
    };
    readonly NO_CONTENT_GENERATED: {
        readonly error: "NO_CONTENT_GENERATED";
        readonly code: 4024;
        readonly description: "No content generated";
        readonly title: "No Content Generated";
    };
    readonly NO_SESSION_TOKEN: {
        readonly error: "NO_SESSION_TOKEN";
        readonly code: 4026;
        readonly description: "No session token provided";
        readonly title: "Session Token Required";
    };
    readonly MISSING_USER_ID: {
        readonly error: "MISSING_USER_ID";
        readonly code: 4027;
        readonly description: "Missing user ID in request";
        readonly title: "User ID Required";
    };
    readonly INVALID_SESSION_TOKEN: {
        readonly error: "INVALID_SESSION_TOKEN";
        readonly code: 4028;
        readonly description: "Invalid session token";
        readonly title: "Invalid Session";
    };
    readonly USER_NOT_VALIDATED: {
        readonly error: "USER_NOT_VALIDATED";
        readonly code: 4029;
        readonly description: "User not validated";
        readonly title: "User Not Validated";
    };
    readonly DB_USER_NOT_FOUND: {
        readonly error: "DB_USER_NOT_FOUND";
        readonly code: 4030;
        readonly description: "User not found in database";
        readonly title: "Database User Not Found";
    };
    readonly INSUFFICIENT_PERMISSIONS: {
        readonly error: "INSUFFICIENT_PERMISSIONS";
        readonly code: 4031;
        readonly description: "Insufficient permissions for this operation";
        readonly title: "Access Denied";
    };
    readonly SYSTEM_ASMIN_INSUFFICIENT_PERMISSIONS: {
        readonly error: "SYSTEM_ASMIN_INSUFFICIENT_PERMISSIONS";
        readonly code: 4031;
        readonly description: "Insufficient permissions for this operation";
        readonly title: "Access Denied";
    };
    readonly MISSING_ACCOUNT_ID: {
        readonly error: "MISSING_ACCOUNT_ID";
        readonly code: 4032;
        readonly description: "Missing account ID in request";
        readonly title: "Account ID Required";
    };
    readonly MISSING_USAGE_OR_SETTINGS: {
        readonly error: "MISSING_USAGE_OR_SETTINGS";
        readonly code: 4033;
        readonly description: "Missing usage or settings data";
        readonly title: "Usage Data Required";
    };
    readonly PROMPT_LIMIT_NOT_SET: {
        readonly error: "PROMPT_LIMIT_NOT_SET";
        readonly code: 4034;
        readonly description: "Prompt limit not set in account settings";
        readonly title: "Prompt Limit Not Set";
    };
    readonly PROMPT_LIMIT_EXCEEDED: {
        readonly error: "PROMPT_LIMIT_EXCEEDED";
        readonly code: 4035;
        readonly description: "Prompt limit exceeded for this account";
        readonly title: "Prompt Limit Exceeded";
    };
    readonly REGION_LIMIT_NOT_SET: {
        readonly error: "REGION_LIMIT_NOT_SET";
        readonly code: 4036;
        readonly description: "Region limit not set in account settings";
        readonly title: "Region Limit Not Set";
    };
    readonly REGION_LIMIT_EXCEEDED: {
        readonly error: "REGION_LIMIT_EXCEEDED";
        readonly code: 4037;
        readonly description: "Region limit exceeded for this account";
        readonly title: "Region Limit Exceeded";
    };
    readonly USER_ALREADY_HAS_ACCOUNTS: {
        readonly error: "USER_ALREADY_HAS_ACCOUNTS";
        readonly code: 4038;
        readonly description: "User already has accounts";
        readonly title: "User Already Has Accounts";
    };
    readonly MISSING_SUB_TOKEN: {
        readonly error: "MISSING_SUB_TOKEN";
        readonly code: 4039;
        readonly description: "Missing sub token in request";
        readonly title: "Sub Token Required";
    };
    readonly INVALID_SESSION_REFRESH_TOKEN: {
        readonly error: "IINVALID_SESSION_REFRESH_TOKEN";
        readonly code: 4040;
        readonly description: "Invalid session refresh token";
        readonly title: "Invalid Session Refresh Token";
    };
    readonly ACCOUNT_MEMBERS_LIMIT_EXCEEDED: {
        readonly error: "ACCOUNT_MEMBERS_LIMIT_EXCEEDED";
        readonly code: 4041;
        readonly description: "Account members limit exceeded";
        readonly title: "Account Members Limit Exceeded";
    };
    readonly ACCOUNT_MEMBERS_LIMIT_NOT_SET: {
        readonly error: "ACCOUNT_MEMBERS_LIMIT_NOT_SET";
        readonly code: 4042;
        readonly description: "Account members limit not set";
        readonly title: "Account Members Limit Not Set";
    };
    readonly IS_AGENCY_INSUFFICIENT_PERMISSIONS: {
        readonly error: "IS_AGENCY_INSUFFICIENT_PERMISSIONS";
        readonly code: 4043;
        readonly description: "Insufficient permissions for this operation";
        readonly title: "Access Denied";
    };
    readonly INSIGHT_LIMIT_EXCEEDED: {
        readonly error: "INSIGHT_LIMIT_EXCEEDED";
        readonly code: 4044;
        readonly description: "Insight generation limit exceeded for this account";
        readonly title: "Insight Limit Exceeded";
    };
    readonly INSIGHT_LIMIT_NOT_SET: {
        readonly error: "INSIGHT_LIMIT_NOT_SET";
        readonly code: 4045;
        readonly description: "Insight limit not set in account settings";
        readonly title: "Insight Limit Not Set";
    };
    readonly RESOURCE_NOT_FOUND: {
        readonly error: "RESOURCE_NOT_FOUND";
        readonly code: 3001;
        readonly description: "The requested resource was not found";
        readonly title: "Resource Not Found";
    };
    readonly ACCOUNT_NOT_FOUND: {
        readonly error: "ACCOUNT_NOT_FOUND";
        readonly code: 3002;
        readonly description: "The specified account was not found";
        readonly title: "Account Not Found";
    };
    readonly ACCOUNT_NOT_FOUND_IN_REQUEST: {
        readonly error: "ACCOUNT_NOT_FOUND_IN_REQUEST";
        readonly code: 3002;
        readonly description: "The specified account was not found in the request";
        readonly title: "Account Not Found In Request";
    };
    readonly PROMPT_NOT_FOUND: {
        readonly error: "PROMPT_NOT_FOUND";
        readonly code: 3003;
        readonly description: "The specified prompt was not found";
        readonly title: "Prompt Not Found";
    };
    readonly TOPIC_NOT_FOUND: {
        readonly error: "TOPIC_NOT_FOUND";
        readonly code: 3004;
        readonly description: "The specified topic was not found";
        readonly title: "Topic Not Found";
    };
    readonly USER_NOT_FOUND: {
        readonly error: "USER_NOT_FOUND";
        readonly code: 3005;
        readonly description: "The specified user was not found";
        readonly title: "User Not Found";
    };
    readonly AUTH_USER_NOT_FOUND: {
        readonly error: "AUTH_USER_NOT_FOUND";
        readonly code: 3005;
        readonly description: "The specified auth user was not found";
        readonly title: "Auth User Not Found";
    };
    readonly AUTH_USER_HAVE_NO_ACCOUNTS: {
        readonly error: "AUTH_USER_HAVE_NO_ACCOUNTS";
        readonly code: 3005;
        readonly description: "The specified auth user has no accounts";
        readonly title: "Auth User Have No Accounts";
    };
    readonly REGION_NOT_FOUND: {
        readonly error: "REGION_NOT_FOUND";
        readonly code: 3006;
        readonly description: "The specified region was not found";
        readonly title: "Region Not Found";
    };
    readonly ASYNC_JOB_NOT_FOUND: {
        readonly error: "ASYNC_JOB_NOT_FOUND";
        readonly code: 3007;
        readonly description: "The specified async job was not found";
        readonly title: "Async Job Not Found";
    };
    readonly FEATURE_REQUEST_NOT_FOUND: {
        readonly error: "FEATURE_REQUEST_NOT_FOUND";
        readonly code: 3008;
        readonly description: "The specified feature request was not found";
        readonly title: "Feature Request Not Found";
    };
    readonly NO_RUNS_FOUND: {
        readonly error: "NO_RUNS_FOUND";
        readonly code: 3010;
        readonly description: "No runs found for the account";
        readonly title: "No Runs Found";
    };
    readonly ACCOUNT_HAS_NO_STRIPE_CUSTOMER_ID: {
        readonly error: "ACCOUNT_HAS_NO_STRIPE_CUSTOMER_ID";
        readonly code: 3011;
        readonly description: "The account has no stripe customer id";
        readonly title: "Account Has No Stripe Customer ID";
    };
    readonly ACCOUNT_ALREADY_HAS_STRIPE_CUSTOMER_ID: {
        readonly error: "ACCOUNT_ALREADY_HAS_STRIPE_CUSTOMER_ID";
        readonly code: 3012;
        readonly description: "The account already has a stripe customer id";
        readonly title: "Account Already Has Stripe Customer ID";
    };
    readonly POST_NOT_FOUND: {
        readonly error: "POST_NOT_FOUND";
        readonly code: 3013;
        readonly description: "The specified post was not found";
        readonly title: "Post Not Found";
    };
    readonly RECOMMENDATION_NOT_FOUND: {
        readonly error: "RECOMMENDATION_NOT_FOUND";
        readonly code: 3020;
        readonly description: "The specified recommendation was not found";
        readonly title: "Recommendation Not Found";
    };
    readonly PARTNER_NOT_FOUND: {
        readonly error: "PARTNER_NOT_FOUND";
        readonly code: 3014;
        readonly description: "The specified partner was not found";
        readonly title: "Partner Not Found";
    };
    readonly AUTH_USER_EMAIL_NOT_FOUND: {
        readonly error: "AUTH_USER_EMAIL_NOT_FOUND";
        readonly code: 3015;
        readonly description: "The specified auth user email was not found";
        readonly title: "Auth User Email Not Found";
    };
    readonly AUTH_RESPONSE_NOT_OK: {
        readonly error: "AUTH_RESPONSE_NOT_OK";
        readonly code: 3016;
        readonly description: "The auth response is not ok";
        readonly title: "Auth Response Not Ok";
    };
    readonly ACCOUNT_IS_NOT_UNDER_AGENCY: {
        readonly error: "ACCOUNT_IS_NOT_UNDER_AGENCY";
        readonly code: 3017;
        readonly description: "The account is not under agency and cannot perform this action";
        readonly title: "Account Is Not Under Agency";
    };
    readonly ACCOUNT_HAS_ALREADY_RUN: {
        readonly error: "ACCOUNT_HAS_ALREADY_RUN";
        readonly code: 3018;
        readonly description: "The account has already run";
        readonly title: "Account Has Already Run";
    };
    readonly ACCOUNT_SUBSCRIPTION_NOT_FOUND: {
        readonly error: "ACCOUNT_SUBSCRIPTION_NOT_FOUND";
        readonly code: 3019;
        readonly description: "The specified account subscription was not found";
        readonly title: "Account Subscription Not Found";
    };
    readonly INVALID_INPUT: {
        readonly error: "INVALID_INPUT";
        readonly code: 2001;
        readonly description: "The provided input data is invalid or malformed";
        readonly title: "Invalid Input";
    };
    readonly MISSING_REQUIRED_FIELD: {
        readonly error: "MISSING_REQUIRED_FIELD";
        readonly code: 2002;
        readonly description: "A required field is missing from the request";
        readonly title: "Missing Required Field";
    };
    readonly INVALID_FORMAT: {
        readonly error: "INVALID_FORMAT";
        readonly code: 2003;
        readonly description: "The data format is not valid";
        readonly title: "Invalid Format";
    };
    readonly VALUE_TOO_LONG: {
        readonly error: "VALUE_TOO_LONG";
        readonly code: 2004;
        readonly description: "The provided value exceeds the maximum allowed length";
        readonly title: "Value Too Long";
    };
    readonly VALUE_TOO_SHORT: {
        readonly error: "VALUE_TOO_SHORT";
        readonly code: 2005;
        readonly description: "The provided value is below the minimum required length";
        readonly title: "Value Too Short";
    };
    readonly INVALID_EMAIL: {
        readonly error: "INVALID_EMAIL";
        readonly code: 2006;
        readonly description: "The provided email address is not valid";
        readonly title: "Invalid Email";
    };
    readonly INVALID_URL: {
        readonly error: "INVALID_URL";
        readonly code: 2007;
        readonly description: "The provided URL is not valid";
        readonly title: "Invalid URL";
    };
    readonly MISSING_AI_SETTINGS: {
        readonly error: "MISSING_AI_SETTINGS";
        readonly code: 2008;
        readonly description: "The AI settings are missing";
        readonly title: "Missing AI Settings";
    };
    readonly POST_ALREADY_POSTED: {
        readonly error: "POST_ALREADY_POSTED";
        readonly code: 2010;
        readonly description: "The post is already posted";
        readonly title: "Post Already Posted";
    };
    readonly NO_IMAGES_TO_REMOVE: {
        readonly error: "NO_IMAGES_TO_REMOVE";
        readonly code: 2011;
        readonly description: "No images provided to remove";
        readonly title: "No Images to Remove";
    };
    readonly INVALID_SOCIAL_NETWORK_FOR_AI_SETTINGS: {
        readonly error: "INVALID_SOCIAL_NETWORK_FOR_AI_SETTINGS";
        readonly code: 2012;
        readonly description: "The social network is not valid for AI settings";
        readonly title: "Invalid Social Network for AI Settings";
    };
    readonly MISSING_GENERATION_ID: {
        readonly error: "MISSING_GENERATION_ID";
        readonly code: 2013;
        readonly description: "The generation ID is missing";
        readonly title: "Missing Generation ID";
    };
    readonly USED_STEP_NOT_FOUND: {
        readonly error: "USED_STEP_NOT_FOUND";
        readonly code: 2014;
        readonly description: "The used step was not found";
        readonly title: "Used Step Not Found";
    };
    readonly UNSUPPORTED_SOCIAL_MEDIA_PROVIDER: {
        readonly error: "UNSUPPORTED_SOCIAL_MEDIA_PROVIDER";
        readonly code: 2015;
        readonly description: "The social media provider is not supported";
        readonly title: "Unsupported Social Media Provider";
    };
    readonly ACCOUNT_NAME_ALREADY_EXISTS: {
        readonly error: "ACCOUNT_NAME_ALREADY_EXISTS";
        readonly code: 2016;
        readonly description: "The account name already exists";
        readonly title: "Account Name Already Exists";
    };
    readonly PROMPT_ALREADY_EXISTS: {
        readonly error: "PROMPT_ALREADY_EXISTS";
        readonly code: 2017;
        readonly description: "The prompt already exists";
        readonly title: "Prompt Already Exists";
    };
    readonly MULTIPLE_REGIONS_NOT_ALLOWED: {
        readonly error: "MULTIPLE_REGIONS_NOT_ALLOWED";
        readonly code: 2018;
        readonly description: "Multiple regions are not allowed";
        readonly title: "Multiple Regions Not Allowed";
    };
    readonly COMPETITOR_SITE_REQUIRED: {
        readonly error: "COMPETITOR_SITE_REQUIRED";
        readonly code: 2019;
        readonly description: "The competitor site is required";
        readonly title: "Competitor Site Required";
    };
    readonly URLS_REQUIRED_FOR_DONE_STATUS: {
        readonly error: "URLS_REQUIRED_FOR_DONE_STATUS";
        readonly code: 2020;
        readonly description: "URLs are required when marking a recommendation as DONE";
        readonly title: "URLs Required";
    };
    readonly UNAUTHORIZED: {
        readonly error: "UNAUTHORIZED";
        readonly code: 1001;
        readonly description: "User is not authenticated or authentication token is invalid";
        readonly title: "Authentication Required";
    };
    readonly FORBIDDEN: {
        readonly error: "FORBIDDEN";
        readonly code: 1002;
        readonly description: "User does not have permission to access this resource";
        readonly title: "Access Denied";
    };
    readonly TOKEN_EXPIRED: {
        readonly error: "TOKEN_EXPIRED";
        readonly code: 1003;
        readonly description: "Authentication token has expired";
        readonly title: "Session Expired";
    };
    readonly INVALID_CREDENTIALS: {
        readonly error: "INVALID_CREDENTIALS";
        readonly code: 1004;
        readonly description: "Provided credentials are invalid";
        readonly title: "Invalid Login";
    };
};
export type ErrorCode = keyof typeof ERROR_CODES;
export declare function getErrorByCode(code: number): AppError | undefined;
export declare function getErrorByString(errorString: string): AppError | undefined;
