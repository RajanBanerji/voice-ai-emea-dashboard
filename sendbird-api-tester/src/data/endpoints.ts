export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface EndpointParam {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  default?: string | number | boolean;
  description: string;
  enum?: string[];
  isPathParam?: boolean;
}

export interface EndpointDef {
  id: string;
  method: HttpMethod;
  path: string;
  name: string;
  category: string;
  subcategory?: string;
  description: string;
  params: EndpointParam[];
  bodyFields: EndpointParam[];
  isDestructive: boolean;
  isPremium?: boolean;
}

export interface CategoryDef {
  name: string;
  icon: string;
  endpoints: EndpointDef[];
}

// ---------------------------------------------------------------------------
// Applications
// ---------------------------------------------------------------------------
const applicationEndpoints: EndpointDef[] = [
  {
    id: 'applications-get-info',
    method: 'GET',
    path: '/v3/applications/info',
    name: 'Get Application Info',
    category: 'Applications',
    description: 'Retrieve information about the current application.',
    params: [],
    bodyFields: [],
    isDestructive: false,
  },
  {
    id: 'applications-get-settings',
    method: 'GET',
    path: '/v3/applications/settings',
    name: 'Get Application Settings',
    category: 'Applications',
    description: 'Retrieve the settings of the current application.',
    params: [],
    bodyFields: [],
    isDestructive: false,
  },
  {
    id: 'applications-update-settings',
    method: 'PUT',
    path: '/v3/applications/settings',
    name: 'Update Application Settings',
    category: 'Applications',
    description: 'Update the global settings of the current application (empty body returns current settings).',
    params: [],
    bodyFields: [],
    isDestructive: false,
  },
  {
    id: 'applications-get-global-settings',
    method: 'GET',
    path: '/v3/applications/settings_global',
    name: 'Get Global Settings',
    category: 'Applications',
    description: 'Retrieve global application settings including domain filter, file filter, profanity filter, and more.',
    params: [],
    bodyFields: [],
    isDestructive: false,
  },
];

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
const userEndpoints: EndpointDef[] = [
  {
    id: 'users-create',
    method: 'POST',
    path: '/v3/users',
    name: 'Create User',
    category: 'Users',
    description: 'Create a new user in the application.',
    params: [],
    bodyFields: [
      {
        name: 'user_id',
        type: 'string',
        required: true,
        default: 'test_api_user_1',
        description: 'Unique ID of the user to create.',
      },
      {
        name: 'nickname',
        type: 'string',
        required: true,
        default: 'Test User 1',
        description: 'Nickname of the user.',
      },
      {
        name: 'profile_url',
        type: 'string',
        required: false,
        description: 'URL of the user profile image.',
      },
    ],
    isDestructive: false,
  },
  {
    id: 'users-list',
    method: 'GET',
    path: '/v3/users',
    name: 'List Users',
    category: 'Users',
    description: 'Retrieve a list of users in the application.',
    params: [
      {
        name: 'limit',
        type: 'number',
        required: false,
        default: 10,
        description: 'Number of results to return per page.',
      },
      {
        name: 'active_mode',
        type: 'string',
        required: false,
        description: 'Filter by user active status.',
        enum: ['activated', 'deactivated', 'all'],
      },
      {
        name: 'show_bot',
        type: 'boolean',
        required: false,
        default: false,
        description: 'Whether to include bot users in the results.',
      },
      {
        name: 'user_ids',
        type: 'string',
        required: false,
        description: 'Comma-separated list of user IDs to filter by.',
      },
    ],
    bodyFields: [],
    isDestructive: false,
  },
  {
    id: 'users-get',
    method: 'GET',
    path: '/v3/users/{user_id}',
    name: 'Get User',
    category: 'Users',
    description: 'Retrieve information about a specific user.',
    params: [
      {
        name: 'user_id',
        type: 'string',
        required: true,
        description: 'The unique ID of the user to retrieve.',
        isPathParam: true,
      },
    ],
    bodyFields: [],
    isDestructive: false,
  },
  {
    id: 'users-update',
    method: 'PUT',
    path: '/v3/users/{user_id}',
    name: 'Update User',
    category: 'Users',
    description: 'Update information about a specific user.',
    params: [
      {
        name: 'user_id',
        type: 'string',
        required: true,
        description: 'The unique ID of the user to update.',
        isPathParam: true,
      },
    ],
    bodyFields: [
      {
        name: 'nickname',
        type: 'string',
        required: false,
        default: 'Updated User',
        description: 'New nickname of the user.',
      },
      {
        name: 'profile_url',
        type: 'string',
        required: false,
        description: 'New profile image URL of the user.',
      },
    ],
    isDestructive: false,
  },
  {
    id: 'users-delete',
    method: 'DELETE',
    path: '/v3/users/{user_id}',
    name: 'Delete User',
    category: 'Users',
    description: 'Delete a specific user from the application.',
    params: [
      {
        name: 'user_id',
        type: 'string',
        required: true,
        description: 'The unique ID of the user to delete.',
        isPathParam: true,
      },
    ],
    bodyFields: [],
    isDestructive: true,
  },
  {
    id: 'users-list-group-channels',
    method: 'GET',
    path: '/v3/users/{user_id}/my_group_channels',
    name: "List User's Group Channels",
    category: 'Users',
    description: 'Retrieve a list of group channels the user has joined.',
    params: [
      {
        name: 'user_id',
        type: 'string',
        required: true,
        description: 'The unique ID of the user.',
        isPathParam: true,
      },
    ],
    bodyFields: [],
    isDestructive: false,
  },
  {
    id: 'users-get-unread-count',
    method: 'GET',
    path: '/v3/users/{user_id}/unread_message_count',
    name: 'Get Unread Count',
    category: 'Users',
    description: 'Retrieve the total unread message count for a user.',
    params: [
      {
        name: 'user_id',
        type: 'string',
        required: true,
        description: 'The unique ID of the user.',
        isPathParam: true,
      },
    ],
    bodyFields: [],
    isDestructive: false,
  },
  {
    id: 'users-block',
    method: 'POST',
    path: '/v3/users/{user_id}/block',
    name: 'Block User',
    category: 'Users',
    description: 'Block a target user on behalf of the specified user.',
    params: [
      {
        name: 'user_id',
        type: 'string',
        required: true,
        description: 'The unique ID of the user who blocks.',
        isPathParam: true,
      },
    ],
    bodyFields: [
      {
        name: 'target_id',
        type: 'string',
        required: true,
        default: 'test_api_user_2',
        description: 'The unique ID of the user to block.',
      },
    ],
    isDestructive: false,
  },
  {
    id: 'users-unblock',
    method: 'DELETE',
    path: '/v3/users/{user_id}/block/{target_id}',
    name: 'Unblock User',
    category: 'Users',
    description: 'Unblock a previously blocked user.',
    params: [
      {
        name: 'user_id',
        type: 'string',
        required: true,
        description: 'The unique ID of the user who blocked.',
        isPathParam: true,
      },
      {
        name: 'target_id',
        type: 'string',
        required: true,
        description: 'The unique ID of the blocked user to unblock.',
        isPathParam: true,
      },
    ],
    bodyFields: [],
    isDestructive: true,
  },
  {
    id: 'users-list-blocked',
    method: 'GET',
    path: '/v3/users/{user_id}/block',
    name: 'List Blocked Users',
    category: 'Users',
    description: 'Retrieve a list of users blocked by the specified user.',
    params: [
      {
        name: 'user_id',
        type: 'string',
        required: true,
        description: 'The unique ID of the user.',
        isPathParam: true,
      },
    ],
    bodyFields: [],
    isDestructive: false,
  },
];

// ---------------------------------------------------------------------------
// Open Channels
// ---------------------------------------------------------------------------
const openChannelEndpoints: EndpointDef[] = [
  {
    id: 'open-channels-create',
    method: 'POST',
    path: '/v3/open_channels',
    name: 'Create Open Channel',
    category: 'Open Channels',
    description: 'Create a new open channel.',
    params: [],
    bodyFields: [
      {
        name: 'name',
        type: 'string',
        required: false,
        default: 'Test Open Channel',
        description: 'Name of the open channel.',
      },
      {
        name: 'channel_url',
        type: 'string',
        required: false,
        description: 'Unique URL identifier for the channel.',
      },
    ],
    isDestructive: false,
  },
  {
    id: 'open-channels-list',
    method: 'GET',
    path: '/v3/open_channels',
    name: 'List Open Channels',
    category: 'Open Channels',
    description: 'Retrieve a list of open channels in the application.',
    params: [
      {
        name: 'limit',
        type: 'number',
        required: false,
        default: 10,
        description: 'Number of results to return per page.',
      },
    ],
    bodyFields: [],
    isDestructive: false,
  },
  {
    id: 'open-channels-get',
    method: 'GET',
    path: '/v3/open_channels/{channel_url}',
    name: 'Get Open Channel',
    category: 'Open Channels',
    description: 'Retrieve information about a specific open channel.',
    params: [
      {
        name: 'channel_url',
        type: 'string',
        required: true,
        description: 'The URL of the open channel.',
        isPathParam: true,
      },
    ],
    bodyFields: [],
    isDestructive: false,
  },
  {
    id: 'open-channels-update',
    method: 'PUT',
    path: '/v3/open_channels/{channel_url}',
    name: 'Update Open Channel',
    category: 'Open Channels',
    description: 'Update an existing open channel.',
    params: [
      {
        name: 'channel_url',
        type: 'string',
        required: true,
        description: 'The URL of the open channel to update.',
        isPathParam: true,
      },
    ],
    bodyFields: [
      {
        name: 'name',
        type: 'string',
        required: false,
        default: 'Updated Open Channel',
        description: 'New name of the open channel.',
      },
    ],
    isDestructive: false,
  },
  {
    id: 'open-channels-delete',
    method: 'DELETE',
    path: '/v3/open_channels/{channel_url}',
    name: 'Delete Open Channel',
    category: 'Open Channels',
    description: 'Delete an existing open channel.',
    params: [
      {
        name: 'channel_url',
        type: 'string',
        required: true,
        description: 'The URL of the open channel to delete.',
        isPathParam: true,
      },
    ],
    bodyFields: [],
    isDestructive: true,
  },
  {
    id: 'open-channels-list-participants',
    method: 'GET',
    path: '/v3/open_channels/{channel_url}/participants',
    name: 'List Participants',
    category: 'Open Channels',
    description: 'Retrieve a list of participants in an open channel.',
    params: [
      {
        name: 'channel_url',
        type: 'string',
        required: true,
        description: 'The URL of the open channel.',
        isPathParam: true,
      },
    ],
    bodyFields: [],
    isDestructive: false,
  },
  {
    id: 'open-channels-list-banned',
    method: 'GET',
    path: '/v3/open_channels/{channel_url}/ban',
    name: 'List Banned Users',
    category: 'Open Channels',
    description: 'Retrieve a list of banned users from an open channel.',
    params: [
      {
        name: 'channel_url',
        type: 'string',
        required: true,
        description: 'The URL of the open channel.',
        isPathParam: true,
      },
    ],
    bodyFields: [],
    isDestructive: false,
  },
  {
    id: 'open-channels-ban-user',
    method: 'POST',
    path: '/v3/open_channels/{channel_url}/ban',
    name: 'Ban User',
    category: 'Open Channels',
    description: 'Ban a user from an open channel.',
    params: [
      {
        name: 'channel_url',
        type: 'string',
        required: true,
        description: 'The URL of the open channel.',
        isPathParam: true,
      },
    ],
    bodyFields: [
      {
        name: 'user_id',
        type: 'string',
        required: true,
        default: 'test_api_user_1',
        description: 'The ID of the user to ban.',
      },
      {
        name: 'seconds',
        type: 'number',
        required: false,
        default: 1,
        description: 'Duration of the ban in seconds. Use -1 for permanent.',
      },
    ],
    isDestructive: true,
  },
  {
    id: 'open-channels-unban-user',
    method: 'DELETE',
    path: '/v3/open_channels/{channel_url}/ban/{banned_user_id}',
    name: 'Unban User',
    category: 'Open Channels',
    description: 'Unban a user from an open channel.',
    params: [
      {
        name: 'channel_url',
        type: 'string',
        required: true,
        description: 'The URL of the open channel.',
        isPathParam: true,
      },
      {
        name: 'banned_user_id',
        type: 'string',
        required: true,
        description: 'The ID of the banned user to unban.',
        isPathParam: true,
      },
    ],
    bodyFields: [],
    isDestructive: true,
  },
  {
    id: 'open-channels-list-muted',
    method: 'GET',
    path: '/v3/open_channels/{channel_url}/mute',
    name: 'List Muted Users',
    category: 'Open Channels',
    description: 'Retrieve a list of muted users in an open channel.',
    params: [
      {
        name: 'channel_url',
        type: 'string',
        required: true,
        description: 'The URL of the open channel.',
        isPathParam: true,
      },
    ],
    bodyFields: [],
    isDestructive: false,
  },
  {
    id: 'open-channels-mute-user',
    method: 'POST',
    path: '/v3/open_channels/{channel_url}/mute',
    name: 'Mute User',
    category: 'Open Channels',
    description: 'Mute a user in an open channel.',
    params: [
      {
        name: 'channel_url',
        type: 'string',
        required: true,
        description: 'The URL of the open channel.',
        isPathParam: true,
      },
    ],
    bodyFields: [
      {
        name: 'user_id',
        type: 'string',
        required: true,
        default: 'test_api_user_1',
        description: 'The ID of the user to mute.',
      },
      {
        name: 'seconds',
        type: 'number',
        required: false,
        default: 1,
        description: 'Duration of the mute in seconds. Use -1 for permanent.',
      },
    ],
    isDestructive: false,
  },
  {
    id: 'open-channels-unmute-user',
    method: 'DELETE',
    path: '/v3/open_channels/{channel_url}/mute/{muted_user_id}',
    name: 'Unmute User',
    category: 'Open Channels',
    description: 'Unmute a user in an open channel.',
    params: [
      {
        name: 'channel_url',
        type: 'string',
        required: true,
        description: 'The URL of the open channel.',
        isPathParam: true,
      },
      {
        name: 'muted_user_id',
        type: 'string',
        required: true,
        description: 'The ID of the muted user to unmute.',
        isPathParam: true,
      },
    ],
    bodyFields: [],
    isDestructive: true,
  },
];

// ---------------------------------------------------------------------------
// Group Channels
// ---------------------------------------------------------------------------
const groupChannelEndpoints: EndpointDef[] = [
  {
    id: 'group-channels-create',
    method: 'POST',
    path: '/v3/group_channels',
    name: 'Create Group Channel',
    category: 'Group Channels',
    description: 'Create a new group channel.',
    params: [],
    bodyFields: [
      {
        name: 'name',
        type: 'string',
        required: false,
        default: 'Test Group Channel',
        description: 'Name of the group channel.',
      },
      {
        name: 'user_ids',
        type: 'array',
        required: true,
        default: 'test_api_user_1,test_api_user_2',
        description: 'Array of user IDs to invite to the channel.',
      },
      {
        name: 'is_distinct',
        type: 'boolean',
        required: false,
        default: false,
        description: 'Whether the channel is distinct (reuse existing channel with same members).',
      },
    ],
    isDestructive: false,
  },
  {
    id: 'group-channels-list',
    method: 'GET',
    path: '/v3/group_channels',
    name: 'List Group Channels',
    category: 'Group Channels',
    description: 'Retrieve a list of group channels in the application.',
    params: [
      {
        name: 'limit',
        type: 'number',
        required: false,
        default: 10,
        description: 'Number of results to return per page.',
      },
      {
        name: 'members_include_in',
        type: 'string',
        required: false,
        description: 'Comma-separated user IDs to filter channels that include all specified users.',
      },
    ],
    bodyFields: [],
    isDestructive: false,
  },
  {
    id: 'group-channels-get',
    method: 'GET',
    path: '/v3/group_channels/{channel_url}',
    name: 'Get Group Channel',
    category: 'Group Channels',
    description: 'Retrieve information about a specific group channel.',
    params: [
      {
        name: 'channel_url',
        type: 'string',
        required: true,
        description: 'The URL of the group channel.',
        isPathParam: true,
      },
    ],
    bodyFields: [],
    isDestructive: false,
  },
  {
    id: 'group-channels-update',
    method: 'PUT',
    path: '/v3/group_channels/{channel_url}',
    name: 'Update Group Channel',
    category: 'Group Channels',
    description: 'Update an existing group channel.',
    params: [
      {
        name: 'channel_url',
        type: 'string',
        required: true,
        description: 'The URL of the group channel to update.',
        isPathParam: true,
      },
    ],
    bodyFields: [
      {
        name: 'name',
        type: 'string',
        required: false,
        default: 'Updated Group Channel',
        description: 'New name of the group channel.',
      },
    ],
    isDestructive: false,
  },
  {
    id: 'group-channels-delete',
    method: 'DELETE',
    path: '/v3/group_channels/{channel_url}',
    name: 'Delete Group Channel',
    category: 'Group Channels',
    description: 'Delete an existing group channel.',
    params: [
      {
        name: 'channel_url',
        type: 'string',
        required: true,
        description: 'The URL of the group channel to delete.',
        isPathParam: true,
      },
    ],
    bodyFields: [],
    isDestructive: true,
  },
  {
    id: 'group-channels-invite',
    method: 'POST',
    path: '/v3/group_channels/{channel_url}/invite',
    name: 'Invite Members',
    category: 'Group Channels',
    description: 'Invite one or more users to a group channel.',
    params: [
      {
        name: 'channel_url',
        type: 'string',
        required: true,
        description: 'The URL of the group channel.',
        isPathParam: true,
      },
    ],
    bodyFields: [
      {
        name: 'user_ids',
        type: 'array',
        required: true,
        default: 'test_api_user_1',
        description: 'Array of user IDs to invite.',
      },
    ],
    isDestructive: false,
  },
  {
    id: 'group-channels-leave',
    method: 'PUT',
    path: '/v3/group_channels/{channel_url}/leave',
    name: 'Leave Channel',
    category: 'Group Channels',
    description: 'Remove one or more users from a group channel.',
    params: [
      {
        name: 'channel_url',
        type: 'string',
        required: true,
        description: 'The URL of the group channel.',
        isPathParam: true,
      },
    ],
    bodyFields: [
      {
        name: 'user_ids',
        type: 'array',
        required: true,
        default: 'test_api_user_1',
        description: 'Array of user IDs to remove from the channel.',
      },
    ],
    isDestructive: true,
  },
  {
    id: 'group-channels-list-members',
    method: 'GET',
    path: '/v3/group_channels/{channel_url}/members',
    name: 'List Members',
    category: 'Group Channels',
    description: 'Retrieve a list of members in a group channel.',
    params: [
      {
        name: 'channel_url',
        type: 'string',
        required: true,
        description: 'The URL of the group channel.',
        isPathParam: true,
      },
      {
        name: 'limit',
        type: 'number',
        required: false,
        default: 10,
        description: 'Number of results to return per page.',
      },
    ],
    bodyFields: [],
    isDestructive: false,
  },
  {
    id: 'group-channels-send-message',
    method: 'POST',
    path: '/v3/group_channels/{channel_url}/messages',
    name: 'Send Message',
    category: 'Group Channels',
    description: 'Send a message to a group channel.',
    params: [
      {
        name: 'channel_url',
        type: 'string',
        required: true,
        description: 'The URL of the group channel.',
        isPathParam: true,
      },
    ],
    bodyFields: [
      {
        name: 'message_type',
        type: 'string',
        required: true,
        default: 'MESG',
        description: 'Type of the message.',
        enum: ['MESG', 'FILE', 'ADMM'],
      },
      {
        name: 'message',
        type: 'string',
        required: true,
        default: 'Hello from API tester',
        description: 'Content of the message.',
      },
      {
        name: 'user_id',
        type: 'string',
        required: true,
        default: 'test_api_user_1',
        description: 'The ID of the user sending the message.',
      },
    ],
    isDestructive: false,
  },
  {
    id: 'group-channels-list-messages',
    method: 'GET',
    path: '/v3/group_channels/{channel_url}/messages',
    name: 'List Messages',
    category: 'Group Channels',
    description: 'Retrieve a list of messages in a group channel.',
    params: [
      {
        name: 'channel_url',
        type: 'string',
        required: true,
        description: 'The URL of the group channel.',
        isPathParam: true,
      },
      {
        name: 'message_ts',
        type: 'number',
        required: true,
        default: 0,
        description: 'Reference timestamp for message retrieval in Unix milliseconds.',
      },
      {
        name: 'prev_limit',
        type: 'number',
        required: false,
        default: 15,
        description: 'Number of messages to retrieve before the reference timestamp.',
      },
      {
        name: 'next_limit',
        type: 'number',
        required: false,
        default: 15,
        description: 'Number of messages to retrieve after the reference timestamp.',
      },
    ],
    bodyFields: [],
    isDestructive: false,
  },
  {
    id: 'group-channels-delete-message',
    method: 'DELETE',
    path: '/v3/group_channels/{channel_url}/messages/{message_id}',
    name: 'Delete Message',
    category: 'Group Channels',
    description: 'Delete a specific message from a group channel.',
    params: [
      {
        name: 'channel_url',
        type: 'string',
        required: true,
        description: 'The URL of the group channel.',
        isPathParam: true,
      },
      {
        name: 'message_id',
        type: 'string',
        required: true,
        description: 'The ID of the message to delete.',
        isPathParam: true,
      },
    ],
    bodyFields: [],
    isDestructive: true,
  },
  {
    id: 'group-channels-ban-member',
    method: 'POST',
    path: '/v3/group_channels/{channel_url}/ban',
    name: 'Ban Member',
    category: 'Group Channels',
    description: 'Ban a member from a group channel.',
    params: [
      {
        name: 'channel_url',
        type: 'string',
        required: true,
        description: 'The URL of the group channel.',
        isPathParam: true,
      },
    ],
    bodyFields: [
      {
        name: 'user_id',
        type: 'string',
        required: true,
        default: 'test_api_user_1',
        description: 'The ID of the user to ban.',
      },
      {
        name: 'seconds',
        type: 'number',
        required: false,
        default: 1,
        description: 'Duration of the ban in seconds. Use -1 for permanent.',
      },
    ],
    isDestructive: true,
  },
  {
    id: 'group-channels-list-banned',
    method: 'GET',
    path: '/v3/group_channels/{channel_url}/ban',
    name: 'List Banned Members',
    category: 'Group Channels',
    description: 'Retrieve a list of banned members from a group channel.',
    params: [
      {
        name: 'channel_url',
        type: 'string',
        required: true,
        description: 'The URL of the group channel.',
        isPathParam: true,
      },
    ],
    bodyFields: [],
    isDestructive: false,
  },
  {
    id: 'group-channels-unban-member',
    method: 'DELETE',
    path: '/v3/group_channels/{channel_url}/ban/{banned_user_id}',
    name: 'Unban Member',
    category: 'Group Channels',
    description: 'Unban a member from a group channel.',
    params: [
      {
        name: 'channel_url',
        type: 'string',
        required: true,
        description: 'The URL of the group channel.',
        isPathParam: true,
      },
      {
        name: 'banned_user_id',
        type: 'string',
        required: true,
        description: 'The ID of the banned user to unban.',
        isPathParam: true,
      },
    ],
    bodyFields: [],
    isDestructive: true,
  },
  {
    id: 'group-channels-mute-member',
    method: 'POST',
    path: '/v3/group_channels/{channel_url}/mute',
    name: 'Mute Member',
    category: 'Group Channels',
    description: 'Mute a member in a group channel.',
    params: [
      {
        name: 'channel_url',
        type: 'string',
        required: true,
        description: 'The URL of the group channel.',
        isPathParam: true,
      },
    ],
    bodyFields: [
      {
        name: 'user_id',
        type: 'string',
        required: true,
        default: 'test_api_user_1',
        description: 'The ID of the user to mute.',
      },
      {
        name: 'seconds',
        type: 'number',
        required: false,
        default: 1,
        description: 'Duration of the mute in seconds. Use -1 for permanent.',
      },
    ],
    isDestructive: false,
  },
  {
    id: 'group-channels-list-muted',
    method: 'GET',
    path: '/v3/group_channels/{channel_url}/mute',
    name: 'List Muted Members',
    category: 'Group Channels',
    description: 'Retrieve a list of muted members in a group channel.',
    params: [
      {
        name: 'channel_url',
        type: 'string',
        required: true,
        description: 'The URL of the group channel.',
        isPathParam: true,
      },
    ],
    bodyFields: [],
    isDestructive: false,
  },
  {
    id: 'group-channels-unmute-member',
    method: 'DELETE',
    path: '/v3/group_channels/{channel_url}/mute/{muted_user_id}',
    name: 'Unmute Member',
    category: 'Group Channels',
    description: 'Unmute a member in a group channel.',
    params: [
      {
        name: 'channel_url',
        type: 'string',
        required: true,
        description: 'The URL of the group channel.',
        isPathParam: true,
      },
      {
        name: 'muted_user_id',
        type: 'string',
        required: true,
        description: 'The ID of the muted user to unmute.',
        isPathParam: true,
      },
    ],
    bodyFields: [],
    isDestructive: true,
  },
  {
    id: 'group-channels-freeze',
    method: 'PUT',
    path: '/v3/group_channels/{channel_url}/freeze',
    name: 'Freeze Channel',
    category: 'Group Channels',
    description: 'Freeze or unfreeze a group channel. When frozen, only operators can send messages.',
    params: [
      {
        name: 'channel_url',
        type: 'string',
        required: true,
        description: 'The URL of the group channel.',
        isPathParam: true,
      },
    ],
    bodyFields: [
      {
        name: 'freeze',
        type: 'boolean',
        required: true,
        default: false,
        description: 'Whether to freeze (true) or unfreeze (false) the channel.',
      },
    ],
    isDestructive: false,
  },
];

// ---------------------------------------------------------------------------
// Messages (generic channel_type endpoints)
// ---------------------------------------------------------------------------
const messageEndpoints: EndpointDef[] = [
  {
    id: 'messages-list',
    method: 'GET',
    path: '/v3/{channel_type}/{channel_url}/messages',
    name: 'List Messages',
    category: 'Messages',
    description: 'Retrieve a list of messages from a channel.',
    params: [
      {
        name: 'channel_type',
        type: 'string',
        required: true,
        description: 'Type of channel.',
        enum: ['open_channels', 'group_channels'],
        isPathParam: true,
      },
      {
        name: 'channel_url',
        type: 'string',
        required: true,
        description: 'The URL of the channel.',
        isPathParam: true,
      },
      {
        name: 'message_ts',
        type: 'number',
        required: true,
        default: 0,
        description: 'Reference timestamp for message retrieval in Unix milliseconds.',
      },
      {
        name: 'prev_limit',
        type: 'number',
        required: false,
        default: 15,
        description: 'Number of messages to retrieve before the reference timestamp.',
      },
      {
        name: 'next_limit',
        type: 'number',
        required: false,
        default: 15,
        description: 'Number of messages to retrieve after the reference timestamp.',
      },
    ],
    bodyFields: [],
    isDestructive: false,
  },
  {
    id: 'messages-send',
    method: 'POST',
    path: '/v3/{channel_type}/{channel_url}/messages',
    name: 'Send Message',
    category: 'Messages',
    description: 'Send a message to a channel.',
    params: [
      {
        name: 'channel_type',
        type: 'string',
        required: true,
        description: 'Type of channel.',
        enum: ['open_channels', 'group_channels'],
        isPathParam: true,
      },
      {
        name: 'channel_url',
        type: 'string',
        required: true,
        description: 'The URL of the channel.',
        isPathParam: true,
      },
    ],
    bodyFields: [
      {
        name: 'message_type',
        type: 'string',
        required: true,
        default: 'MESG',
        description: 'Type of the message.',
        enum: ['MESG', 'FILE', 'ADMM'],
      },
      {
        name: 'message',
        type: 'string',
        required: true,
        default: 'Hello from API tester',
        description: 'Content of the message.',
      },
      {
        name: 'user_id',
        type: 'string',
        required: true,
        default: 'test_api_user_1',
        description: 'The ID of the user sending the message.',
      },
    ],
    isDestructive: false,
  },
  {
    id: 'messages-get',
    method: 'GET',
    path: '/v3/{channel_type}/{channel_url}/messages/{message_id}',
    name: 'Get Message',
    category: 'Messages',
    description: 'Retrieve a specific message from a channel.',
    params: [
      {
        name: 'channel_type',
        type: 'string',
        required: true,
        description: 'Type of channel.',
        enum: ['open_channels', 'group_channels'],
        isPathParam: true,
      },
      {
        name: 'channel_url',
        type: 'string',
        required: true,
        description: 'The URL of the channel.',
        isPathParam: true,
      },
      {
        name: 'message_id',
        type: 'string',
        required: true,
        description: 'The ID of the message to retrieve.',
        isPathParam: true,
      },
    ],
    bodyFields: [],
    isDestructive: false,
  },
  {
    id: 'messages-update',
    method: 'PUT',
    path: '/v3/{channel_type}/{channel_url}/messages/{message_id}',
    name: 'Update Message',
    category: 'Messages',
    description: 'Update a specific message in a channel.',
    params: [
      {
        name: 'channel_type',
        type: 'string',
        required: true,
        description: 'Type of channel.',
        enum: ['open_channels', 'group_channels'],
        isPathParam: true,
      },
      {
        name: 'channel_url',
        type: 'string',
        required: true,
        description: 'The URL of the channel.',
        isPathParam: true,
      },
      {
        name: 'message_id',
        type: 'string',
        required: true,
        description: 'The ID of the message to update.',
        isPathParam: true,
      },
    ],
    bodyFields: [
      {
        name: 'message_type',
        type: 'string',
        required: true,
        default: 'MESG',
        description: 'Type of the message.',
        enum: ['MESG', 'FILE', 'ADMM'],
      },
      {
        name: 'message',
        type: 'string',
        required: false,
        default: 'Updated message from API tester',
        description: 'New content of the message.',
      },
    ],
    isDestructive: false,
    isPremium: true,
  },
  {
    id: 'messages-delete',
    method: 'DELETE',
    path: '/v3/{channel_type}/{channel_url}/messages/{message_id}',
    name: 'Delete Message',
    category: 'Messages',
    description: 'Delete a specific message from a channel.',
    params: [
      {
        name: 'channel_type',
        type: 'string',
        required: true,
        description: 'Type of channel.',
        enum: ['open_channels', 'group_channels'],
        isPathParam: true,
      },
      {
        name: 'channel_url',
        type: 'string',
        required: true,
        description: 'The URL of the channel.',
        isPathParam: true,
      },
      {
        name: 'message_id',
        type: 'string',
        required: true,
        description: 'The ID of the message to delete.',
        isPathParam: true,
      },
    ],
    bodyFields: [],
    isDestructive: true,
  },
  {
    id: 'messages-search',
    method: 'GET',
    path: '/v3/search/messages',
    name: 'Search Messages',
    category: 'Messages',
    description: 'Search for messages across channels.',
    params: [
      {
        name: 'query',
        type: 'string',
        required: true,
        default: 'hello',
        description: 'Search query string.',
      },
      {
        name: 'user_id',
        type: 'string',
        required: false,
        default: 'test_api_user_1',
        description: 'User ID to search messages from. Either user_id or channel_url is required.',
      },
      {
        name: 'channel_url',
        type: 'string',
        required: false,
        description: 'Limit search to a specific channel URL.',
      },
      {
        name: 'limit',
        type: 'number',
        required: false,
        default: 20,
        description: 'Number of results to return per page.',
      },
    ],
    bodyFields: [],
    isDestructive: false,
  },
];

// ---------------------------------------------------------------------------
// Moderation
// ---------------------------------------------------------------------------
const moderationEndpoints: EndpointDef[] = [
  {
    id: 'moderation-get-global-settings',
    method: 'GET',
    path: '/v3/applications/settings_global',
    name: 'Get Moderation Settings',
    category: 'Moderation',
    description: 'Retrieve global moderation settings including profanity filter, domain filter, and file filter.',
    params: [],
    bodyFields: [],
    isDestructive: false,
  },
  {
    id: 'moderation-update-global-settings',
    method: 'PUT',
    path: '/v3/applications/settings_global',
    name: 'Update Moderation Settings',
    category: 'Moderation',
    description: 'Update global moderation settings (empty body returns current settings without changes).',
    params: [],
    bodyFields: [],
    isDestructive: false,
  },
  {
    id: 'moderation-list-user-bans',
    method: 'GET',
    path: '/v3/users/{user_id}/ban',
    name: "List User's Bans",
    category: 'Moderation',
    description: 'Retrieve a list of channels from which a user is banned.',
    params: [
      {
        name: 'user_id',
        type: 'string',
        required: true,
        description: 'The unique ID of the user.',
        isPathParam: true,
      },
    ],
    bodyFields: [],
    isDestructive: false,
  },
  {
    id: 'moderation-list-user-mutes',
    method: 'GET',
    path: '/v3/users/{user_id}/mute',
    name: "List User's Mutes",
    category: 'Moderation',
    description: 'Retrieve a list of channels in which a user is muted.',
    params: [
      {
        name: 'user_id',
        type: 'string',
        required: true,
        description: 'The unique ID of the user.',
        isPathParam: true,
      },
    ],
    bodyFields: [],
    isDestructive: false,
  },
];

// ---------------------------------------------------------------------------
// Push Notifications
// ---------------------------------------------------------------------------
const pushNotificationEndpoints: EndpointDef[] = [
  {
    id: 'push-get-config',
    method: 'GET',
    path: '/v3/applications/push/fcm',
    name: 'Get Push Config (FCM)',
    category: 'Push Notifications',
    description: 'Retrieve the FCM push notification configuration for the application.',
    params: [],
    bodyFields: [],
    isDestructive: false,
  },
  {
    id: 'push-get-user-preference',
    method: 'GET',
    path: '/v3/users/{user_id}/push_preference',
    name: 'Get User Push Pref',
    category: 'Push Notifications',
    description: 'Retrieve the push notification preference for a specific user.',
    params: [
      {
        name: 'user_id',
        type: 'string',
        required: true,
        description: 'The unique ID of the user.',
        isPathParam: true,
      },
    ],
    bodyFields: [],
    isDestructive: false,
  },
  {
    id: 'push-update-user-preference',
    method: 'PUT',
    path: '/v3/users/{user_id}/push_preference',
    name: 'Update User Push Pref',
    category: 'Push Notifications',
    description: 'Update the push notification preference for a specific user.',
    params: [
      {
        name: 'user_id',
        type: 'string',
        required: true,
        description: 'The unique ID of the user.',
        isPathParam: true,
      },
    ],
    bodyFields: [
      {
        name: 'push_trigger_option',
        type: 'string',
        required: false,
        default: 'all',
        description: 'Push trigger option for the user.',
        enum: ['all', 'mention_only', 'off'],
      },
    ],
    isDestructive: false,
  },
];

// ---------------------------------------------------------------------------
// Webhooks
// ---------------------------------------------------------------------------
const webhookEndpoints: EndpointDef[] = [
  {
    id: 'webhooks-get-settings',
    method: 'GET',
    path: '/v3/applications/settings/webhook',
    name: 'Get Webhook Settings',
    category: 'Webhooks',
    description: 'Retrieve the webhook settings for the application.',
    params: [],
    bodyFields: [],
    isDestructive: false,
  },
  {
    id: 'webhooks-update-settings',
    method: 'PUT',
    path: '/v3/applications/settings/webhook',
    name: 'Update Webhook Settings',
    category: 'Webhooks',
    description: 'Update the webhook settings for the application.',
    params: [],
    bodyFields: [
      {
        name: 'enabled',
        type: 'boolean',
        required: true,
        default: true,
        description: 'Whether webhooks are enabled.',
      },
      {
        name: 'url',
        type: 'string',
        required: false,
        description: 'The webhook callback URL.',
      },
    ],
    isDestructive: false,
  },
];

// ---------------------------------------------------------------------------
// Data Export
// ---------------------------------------------------------------------------
const dataExportEndpoints: EndpointDef[] = [
  {
    id: 'data-export-request',
    method: 'POST',
    path: '/v3/export/{data_type}',
    name: 'Request Export',
    category: 'Data Export',
    description: 'Request a data export for the specified data type.',
    params: [
      {
        name: 'data_type',
        type: 'string',
        required: true,
        description: 'Type of data to export.',
        enum: ['messages', 'channels', 'users'],
        isPathParam: true,
      },
    ],
    bodyFields: [
      {
        name: 'start_ts',
        type: 'number',
        required: true,
        default: 1700000000,
        description: 'Start timestamp for the export range in Unix seconds.',
      },
      {
        name: 'end_ts',
        type: 'number',
        required: true,
        default: 1700086400,
        description: 'End timestamp for the export range in Unix seconds.',
      },
    ],
    isDestructive: false,
  },
  {
    id: 'data-export-list',
    method: 'GET',
    path: '/v3/export/{data_type}',
    name: 'List Exports',
    category: 'Data Export',
    description: 'Retrieve a list of data export requests.',
    params: [
      {
        name: 'data_type',
        type: 'string',
        required: true,
        description: 'Type of data export to list.',
        enum: ['messages', 'channels', 'users'],
        isPathParam: true,
      },
    ],
    bodyFields: [],
    isDestructive: false,
  },
  {
    id: 'data-export-get-status',
    method: 'GET',
    path: '/v3/export/{data_type}/{request_id}',
    name: 'Get Export Status',
    category: 'Data Export',
    description: 'Retrieve the status of a specific data export request.',
    params: [
      {
        name: 'data_type',
        type: 'string',
        required: true,
        description: 'Type of data export.',
        enum: ['messages', 'channels', 'users'],
        isPathParam: true,
      },
      {
        name: 'request_id',
        type: 'string',
        required: true,
        description: 'The ID of the export request.',
        isPathParam: true,
      },
    ],
    bodyFields: [],
    isDestructive: false,
  },
];

// ---------------------------------------------------------------------------
// Bot Interface
// ---------------------------------------------------------------------------
const botEndpoints: EndpointDef[] = [
  {
    id: 'bots-create',
    method: 'POST',
    path: '/v3/bots',
    name: 'Create Bot',
    category: 'Bot Interface',
    description: 'Create a new bot user in the application.',
    params: [],
    bodyFields: [
      {
        name: 'bot_userid',
        type: 'string',
        required: true,
        default: 'test_bot_1',
        description: 'Unique user ID for the bot.',
      },
      {
        name: 'bot_nickname',
        type: 'string',
        required: true,
        default: 'Test Bot',
        description: 'Display nickname for the bot.',
      },
      {
        name: 'bot_profile_url',
        type: 'string',
        required: false,
        description: 'Profile image URL for the bot.',
      },
      {
        name: 'bot_callback_url',
        type: 'string',
        required: true,
        default: 'https://example.com/bot-callback',
        description: 'Callback URL that receives events for the bot.',
      },
      {
        name: 'is_privacy_mode',
        type: 'boolean',
        required: true,
        default: false,
        description: 'Whether the bot only receives messages that mention it.',
      },
    ],
    isDestructive: false,
  },
  {
    id: 'bots-list',
    method: 'GET',
    path: '/v3/bots',
    name: 'List Bots',
    category: 'Bot Interface',
    description: 'Retrieve a list of all bots in the application.',
    params: [],
    bodyFields: [],
    isDestructive: false,
  },
  {
    id: 'bots-get',
    method: 'GET',
    path: '/v3/bots/{bot_userid}',
    name: 'Get Bot',
    category: 'Bot Interface',
    description: 'Retrieve information about a specific bot.',
    params: [
      {
        name: 'bot_userid',
        type: 'string',
        required: true,
        description: 'The user ID of the bot.',
        isPathParam: true,
      },
    ],
    bodyFields: [],
    isDestructive: false,
  },
  {
    id: 'bots-update',
    method: 'PUT',
    path: '/v3/bots/{bot_userid}',
    name: 'Update Bot',
    category: 'Bot Interface',
    description: 'Update an existing bot.',
    params: [
      {
        name: 'bot_userid',
        type: 'string',
        required: true,
        description: 'The user ID of the bot to update.',
        isPathParam: true,
      },
    ],
    bodyFields: [
      {
        name: 'bot_nickname',
        type: 'string',
        required: false,
        default: 'Updated Bot',
        description: 'New display nickname for the bot.',
      },
      {
        name: 'bot_profile_url',
        type: 'string',
        required: false,
        description: 'New profile image URL for the bot.',
      },
    ],
    isDestructive: false,
  },
  {
    id: 'bots-delete',
    method: 'DELETE',
    path: '/v3/bots/{bot_userid}',
    name: 'Delete Bot',
    category: 'Bot Interface',
    description: 'Delete a bot from the application.',
    params: [
      {
        name: 'bot_userid',
        type: 'string',
        required: true,
        description: 'The user ID of the bot to delete.',
        isPathParam: true,
      },
    ],
    bodyFields: [],
    isDestructive: true,
  },
  {
    id: 'bots-send-message',
    method: 'POST',
    path: '/v3/bots/{bot_userid}/send',
    name: 'Send Bot Message',
    category: 'Bot Interface',
    description: 'Send a message as a bot to a specific channel.',
    params: [
      {
        name: 'bot_userid',
        type: 'string',
        required: true,
        description: 'The user ID of the bot sending the message.',
        isPathParam: true,
      },
    ],
    bodyFields: [
      {
        name: 'message',
        type: 'string',
        required: true,
        default: 'Hello from bot',
        description: 'Content of the message to send.',
      },
      {
        name: 'channel_url',
        type: 'string',
        required: true,
        default: 'test_channel',
        description: 'The URL of the channel to send the message to.',
      },
    ],
    isDestructive: false,
    isPremium: true,
  },
];

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------
const analyticsEndpoints: EndpointDef[] = [
  {
    id: 'analytics-daily-active-users',
    method: 'GET',
    path: '/v3/applications/dau',
    name: 'Daily Active Users',
    category: 'Analytics',
    description: 'Retrieve the number of daily active users. Calculated every 30 minutes starting at 00:00 UTC.',
    params: [
      {
        name: 'date',
        type: 'string',
        required: false,
        default: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
        description: 'Date to query in YYYY-MM-DD format. Defaults to yesterday.',
      },
    ],
    bodyFields: [],
    isDestructive: false,
  },
  {
    id: 'analytics-monthly-active-users',
    method: 'GET',
    path: '/v3/applications/mau',
    name: 'Monthly Active Users',
    category: 'Analytics',
    description: 'Retrieve the number of monthly active users. Calculated after the last day of the month.',
    params: [
      {
        name: 'date',
        type: 'string',
        required: false,
        default: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
        description: 'Date to query in YYYY-MM-DD format.',
      },
    ],
    bodyFields: [],
    isDestructive: false,
  },
  {
    id: 'analytics-advanced-metrics',
    method: 'GET',
    path: '/v3/statistics/metric',
    name: 'Advanced Analytics Metrics',
    category: 'Analytics',
    description: 'Retrieve advanced analytics metrics (messages, new channels, active channels, new users, etc.).',
    params: [
      {
        name: 'metric_type',
        type: 'string',
        required: true,
        default: 'messages',
        description: 'Type of metric to retrieve.',
        enum: ['messages', 'messages_per_user', 'new_channels', 'active_channels', 'message_senders', 'message_viewers', 'new_users', 'deactivated_users', 'deleted_users'],
      },
      {
        name: 'time_dimension',
        type: 'string',
        required: true,
        default: 'daily',
        description: 'Time granularity for the metrics.',
        enum: ['daily', 'monthly'],
      },
      {
        name: 'start_year',
        type: 'number',
        required: true,
        default: new Date().getFullYear(),
        description: 'Start year for the query range.',
      },
      {
        name: 'start_month',
        type: 'number',
        required: true,
        default: new Date().getMonth() + 1,
        description: 'Start month (1-12).',
      },
      {
        name: 'start_day',
        type: 'number',
        required: true,
        default: 1,
        description: 'Start day of the month (1-31).',
      },
      {
        name: 'end_year',
        type: 'number',
        required: true,
        default: new Date().getFullYear(),
        description: 'End year for the query range.',
      },
      {
        name: 'end_month',
        type: 'number',
        required: true,
        default: new Date().getMonth() + 1,
        description: 'End month (1-12).',
      },
      {
        name: 'end_day',
        type: 'number',
        required: true,
        default: new Date().getDate(),
        description: 'End day of the month (1-31).',
      },
    ],
    bodyFields: [],
    isDestructive: false,
    isPremium: true,
  },
];

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
export const CATEGORIES: CategoryDef[] = [
  {
    name: 'Applications',
    icon: '\u2699\uFE0F',
    endpoints: applicationEndpoints,
  },
  {
    name: 'Users',
    icon: '\uD83D\uDC65',
    endpoints: userEndpoints,
  },
  {
    name: 'Open Channels',
    icon: '#\uFE0F\u20E3',
    endpoints: openChannelEndpoints,
  },
  {
    name: 'Group Channels',
    icon: '\uD83D\uDCAC',
    endpoints: groupChannelEndpoints,
  },
  {
    name: 'Messages',
    icon: '\uD83D\uDCE8',
    endpoints: messageEndpoints,
  },
  {
    name: 'Moderation',
    icon: '\uD83D\uDEE1\uFE0F',
    endpoints: moderationEndpoints,
  },
  {
    name: 'Push Notifications',
    icon: '\uD83D\uDD14',
    endpoints: pushNotificationEndpoints,
  },
  {
    name: 'Webhooks',
    icon: '\uD83D\uDD17',
    endpoints: webhookEndpoints,
  },
  {
    name: 'Data Export',
    icon: '\uD83D\uDCE5',
    endpoints: dataExportEndpoints,
  },
  {
    name: 'Bot Interface',
    icon: '\uD83E\uDD16',
    endpoints: botEndpoints,
  },
  {
    name: 'Analytics',
    icon: '\uD83D\uDCCA',
    endpoints: analyticsEndpoints,
  },
];

// ---------------------------------------------------------------------------
// Flat list of all endpoints
// ---------------------------------------------------------------------------
export const ALL_ENDPOINTS: EndpointDef[] = CATEGORIES.flatMap(
  (category) => category.endpoints
);
