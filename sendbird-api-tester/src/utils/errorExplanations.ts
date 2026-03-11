export interface ErrorExplanation {
  title: string;
  plain: string;
  fixSteps: string[];
  docsHint?: string;
  severity: 'low' | 'medium' | 'high';
}

// Sendbird-specific error codes
const SENDBIRD_ERROR_CODES: Record<number, ErrorExplanation> = {
  400201: {
    title: 'User Already Exists',
    plain: 'A user with this ID already exists in your app. Sendbird requires unique user IDs.',
    fixSteps: ['Try a different user_id value', 'Or use the "Update User" endpoint to modify the existing user'],
    severity: 'medium',
  },
  400202: {
    title: 'User Not Found',
    plain: 'The user ID you provided doesn\'t exist in your app.',
    fixSteps: ['Check the user_id is spelled correctly', 'Run "Create User" first to create this user', 'Use "List Users" to see which users exist'],
    severity: 'medium',
  },
  400300: {
    title: 'Missing Required Field',
    plain: 'Your request is missing a field that Sendbird requires.',
    fixSteps: ['Expand this card and check the request body', 'Fill in all fields marked as required', 'Check the Sendbird docs for required fields'],
    severity: 'medium',
  },
  400301: {
    title: 'Invalid Parameter Value',
    plain: 'One of the values you sent is in the wrong format or out of range.',
    fixSteps: ['Check the response body for which field is invalid', 'Look at the allowed values in the endpoint description'],
    severity: 'medium',
  },
  400302: {
    title: 'Invalid JSON',
    plain: 'The request body isn\'t valid JSON. There\'s likely a formatting mistake.',
    fixSteps: ['Check the request body for missing commas, brackets, or quotes', 'Use a JSON validator to check your payload'],
    severity: 'medium',
  },
  400700: {
    title: 'Channel Not Found',
    plain: 'The channel URL you provided doesn\'t exist.',
    fixSteps: ['Check the channel_url is correct', 'Run "Create Group Channel" or "Create Open Channel" first', 'Use "List Channels" to find existing channels'],
    severity: 'medium',
  },
  400750: {
    title: 'Message Not Found',
    plain: 'The message ID you provided doesn\'t exist in this channel.',
    fixSteps: ['Check the message_id is correct', 'Make sure the message belongs to the specified channel', 'Send a message first using "Send Message"'],
    severity: 'medium',
  },
  900006: {
    title: 'Rate Limited',
    plain: 'Too many requests sent too quickly. Sendbird is temporarily blocking this operation.',
    fixSteps: ['Wait a few seconds and try again', 'Avoid running tests in rapid succession', 'Check your plan\'s rate limits in Sendbird Dashboard'],
    docsHint: 'Sendbird Dashboard → Settings → API → Rate Limits',
    severity: 'low',
  },
  900007: {
    title: 'Not Supported on Your Plan',
    plain: 'This feature isn\'t available on your current Sendbird plan.',
    fixSteps: ['Check which plan you\'re on in Sendbird Dashboard', 'Upgrade your plan to access this feature', 'Contact Sendbird sales if you need this feature'],
    docsHint: 'Sendbird Dashboard → Settings → Billing',
    severity: 'high',
  },
};

// HTTP status fallbacks
const HTTP_STATUS_MAP: Record<number, ErrorExplanation> = {
  400: {
    title: 'Bad Request — Something in Your Request is Wrong',
    plain: 'Sendbird couldn\'t process this request because something in the data you sent is incorrect or missing.',
    fixSteps: [
      'Expand this card and look at the request body',
      'Make sure all required fields are present and correctly formatted',
      'Check for typos in field names or values',
    ],
    severity: 'medium',
  },
  401: {
    title: 'Unauthorized — Your API Token is Invalid',
    plain: 'Sendbird rejected this request because your API token is wrong, expired, or missing.',
    fixSteps: [
      'Click "Credentials" in the top bar and double-check your API token',
      'Get a fresh token from: Sendbird Dashboard → Settings → General → API',
      'Make sure you\'re using the Master API Token (not a user session token)',
    ],
    docsHint: 'Sendbird Dashboard → Settings → General → API',
    severity: 'high',
  },
  403: {
    title: 'Forbidden — Your Token Doesn\'t Have Permission',
    plain: 'Your API token is valid but doesn\'t have the right permissions to perform this action.',
    fixSteps: [
      'Check your token\'s permissions in Sendbird Dashboard → Settings → General → API',
      'Some operations require a Master API Token with full admin access',
      'Verify that this feature is enabled for your application',
    ],
    docsHint: 'Sendbird Dashboard → Settings → General → API',
    severity: 'high',
  },
  404: {
    title: 'Not Found — Resource Doesn\'t Exist',
    plain: 'The user, channel, or message you\'re looking for doesn\'t exist in your app.',
    fixSteps: [
      'Double-check the ID or URL in your request parameters',
      'Make sure you created this resource first (try running earlier tests in this category)',
      'Use "List" endpoints to find valid IDs',
    ],
    severity: 'medium',
  },
  409: {
    title: 'Conflict — Resource Already Exists',
    plain: 'You\'re trying to create something that already exists (e.g. a user or channel with the same ID).',
    fixSteps: [
      'Use a different unique ID for this resource',
      'Or use the corresponding Update endpoint instead of Create',
    ],
    severity: 'medium',
  },
  429: {
    title: 'Rate Limited — Too Many Requests',
    plain: 'You\'ve sent too many requests in a short period. Sendbird is temporarily slowing you down.',
    fixSteps: [
      'Wait 5–10 seconds and try again',
      'Avoid running the full test suite multiple times in quick succession',
    ],
    severity: 'low',
  },
  500: {
    title: 'Sendbird Server Error — Not Your Fault',
    plain: 'Something went wrong on Sendbird\'s servers. This is not caused by your request.',
    fixSteps: [
      'Wait a moment and try again',
      'Check status.sendbird.com for any ongoing incidents',
      'Contact Sendbird support if this persists',
    ],
    docsHint: 'status.sendbird.com',
    severity: 'high',
  },
  503: {
    title: 'Service Temporarily Unavailable',
    plain: 'Sendbird\'s servers are under maintenance or temporarily overloaded.',
    fixSteps: [
      'Check status.sendbird.com for any ongoing incidents',
      'Wait a few minutes and try again',
    ],
    docsHint: 'status.sendbird.com',
    severity: 'high',
  },
};

const NETWORK_ERROR: ErrorExplanation = {
  title: 'Network Error — Can\'t Reach Sendbird',
  plain: 'Your browser couldn\'t connect to Sendbird\'s servers. This is usually a connectivity issue.',
  fixSteps: [
    'Check your internet connection',
    'Make sure your App ID is correct (it determines the API URL)',
    'Check if a firewall or VPN is blocking outbound HTTPS requests',
    'Try switching to a different region in Credentials if you\'re unsure',
  ],
  severity: 'high',
};

export function getErrorExplanation(
  httpStatus: number,
  responseBody?: unknown,
): ErrorExplanation {
  // Try Sendbird-specific error code first
  if (responseBody && typeof responseBody === 'object' && responseBody !== null) {
    const body = responseBody as Record<string, unknown>;
    const sbCode = typeof body.code === 'number' ? body.code : undefined;
    if (sbCode && SENDBIRD_ERROR_CODES[sbCode]) {
      return SENDBIRD_ERROR_CODES[sbCode];
    }
  }

  // Fall back to HTTP status
  if (HTTP_STATUS_MAP[httpStatus]) {
    return HTTP_STATUS_MAP[httpStatus];
  }

  // Network / unknown
  if (httpStatus === 0) return NETWORK_ERROR;

  return {
    title: `Unexpected Error (${httpStatus})`,
    plain: 'An unexpected error occurred. Check the response body below for more details.',
    fixSteps: ['Read the error message in the response body', 'Check Sendbird documentation for this endpoint'],
    severity: 'medium',
  };
}
