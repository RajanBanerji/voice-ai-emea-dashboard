// Maps endpoint IDs to their Sendbird documentation URLs
// Base: https://sendbird.com/docs/chat/platform-api/v3/

const DOCS_BASE = 'https://sendbird.com/docs/chat/platform-api/v3';

export const DOCS_URL_MAP: Record<string, string> = {
  // ── Applications ──────────────────────────────────────────────────────
  'applications-get-info':
    `${DOCS_BASE}/application/application-overview`,
  'applications-get-settings':
    `${DOCS_BASE}/application/setting-up-an-application/get-global-application-settings`,
  'applications-update-settings':
    `${DOCS_BASE}/application/setting-up-an-application/update-global-application-settings`,
  'applications-get-global-settings':
    `${DOCS_BASE}/application/setting-up-an-application/get-global-application-settings`,

  // ── Users ─────────────────────────────────────────────────────────────
  'users-create':
    `${DOCS_BASE}/user/creating-users/create-a-user`,
  'users-list':
    `${DOCS_BASE}/user/listing-users/list-users`,
  'users-get':
    `${DOCS_BASE}/user/listing-users/get-a-user`,
  'users-update':
    `${DOCS_BASE}/user/managing-users/update-a-user`,
  'users-delete':
    `${DOCS_BASE}/user/managing-users/delete-a-user`,
  'users-list-group-channels':
    `${DOCS_BASE}/user/managing-joined-group-channels/list-group-channels-by-user`,
  'users-get-unread-count':
    `${DOCS_BASE}/user/managing-unread-count/get-number-of-unread-messages`,
  'users-block':
    `${DOCS_BASE}/moderation/blocking-users/block-users`,
  'users-unblock':
    `${DOCS_BASE}/moderation/blocking-users/block-users`,
  'users-list-blocked':
    `${DOCS_BASE}/moderation/listing-blocked-and-blocking-users/list-blocked-and-blocking-users`,

  // ── Open Channels ─────────────────────────────────────────────────────
  'open-channels-create':
    `${DOCS_BASE}/channel/creating-a-channel/create-an-open-channel`,
  'open-channels-list':
    `${DOCS_BASE}/channel/listing-channels-in-an-application/list-open-channels`,
  'open-channels-get':
    `${DOCS_BASE}/channel/listing-channels-in-an-application/get-an-open-channel`,
  'open-channels-update':
    `${DOCS_BASE}/channel/managing-a-channel/update-an-open-channel`,
  'open-channels-delete':
    `${DOCS_BASE}/channel/managing-a-channel/update-an-open-channel`,
  'open-channels-list-participants':
    `${DOCS_BASE}/channel/listing-users/list-participants-of-an-open-channel`,
  'open-channels-list-banned':
    `${DOCS_BASE}/moderation/listing-banned-users/list-banned-members-in-a-group-channel`,
  'open-channels-ban-user':
    `${DOCS_BASE}/moderation/banning-a-user/ban-a-participant-from-an-open-channel`,
  'open-channels-unban-user':
    `${DOCS_BASE}/moderation/banning-a-user/unban-a-participant-from-an-open-channel`,
  'open-channels-list-muted':
    `${DOCS_BASE}/moderation/muting-a-user/mute-a-participant-in-an-open-channel`,
  'open-channels-mute-user':
    `${DOCS_BASE}/moderation/muting-a-user/mute-a-participant-in-an-open-channel`,
  'open-channels-unmute-user':
    `${DOCS_BASE}/moderation/muting-a-user/mute-a-participant-in-an-open-channel`,

  // ── Group Channels ────────────────────────────────────────────────────
  'group-channels-create':
    `${DOCS_BASE}/channel/creating-a-channel/create-a-group-channel`,
  'group-channels-list':
    `${DOCS_BASE}/channel/listing-channels-in-an-application/list-group-channels`,
  'group-channels-get':
    `${DOCS_BASE}/channel/listing-channels-in-an-application/get-a-group-channel`,
  'group-channels-update':
    `${DOCS_BASE}/channel/managing-a-channel/update-a-group-channel`,
  'group-channels-delete':
    `${DOCS_BASE}/channel/managing-a-channel/delete-a-group-channel`,
  'group-channels-invite':
    `${DOCS_BASE}/channel/inviting-a-user/invite-as-members-channel`,
  'group-channels-leave':
    `${DOCS_BASE}/channel/managing-a-channel/leave-a-channel`,
  'group-channels-list-members':
    `${DOCS_BASE}/channel/listing-users/list-members-of-a-group-channel`,
  'group-channels-send-message':
    `${DOCS_BASE}/message/messaging-basics/send-a-message`,
  'group-channels-list-messages':
    `${DOCS_BASE}/message/messaging-basics/list-messages`,
  'group-channels-delete-message':
    `${DOCS_BASE}/message/messaging-basics/delete-a-message`,
  'group-channels-ban-member':
    `${DOCS_BASE}/moderation/banning-a-user/ban-a-member-from-a-group-channel`,
  'group-channels-list-banned':
    `${DOCS_BASE}/moderation/listing-banned-users/list-banned-members-in-a-group-channel`,
  'group-channels-unban-member':
    `${DOCS_BASE}/moderation/banning-a-user/ban-a-member-from-a-group-channel`,
  'group-channels-mute-member':
    `${DOCS_BASE}/moderation/muting-a-user/mute-a-member-in-a-group-channel`,
  'group-channels-list-muted':
    `${DOCS_BASE}/moderation/muting-a-user/mute-a-member-in-a-group-channel`,
  'group-channels-unmute-member':
    `${DOCS_BASE}/moderation/muting-a-user/unmute-a-member-in-a-group-channel`,
  'group-channels-freeze':
    `${DOCS_BASE}/moderation/freezing-a-channel/freeze-a-group-channel`,

  // ── Messages ──────────────────────────────────────────────────────────
  'messages-list':
    `${DOCS_BASE}/message/messaging-basics/list-messages`,
  'messages-send':
    `${DOCS_BASE}/message/messaging-basics/send-a-message`,
  'messages-get':
    `${DOCS_BASE}/message/messaging-basics/get-a-message`,
  'messages-update':
    `${DOCS_BASE}/message/messaging-basics/update-a-message`,
  'messages-delete':
    `${DOCS_BASE}/message/messaging-basics/delete-a-message`,
  'messages-search':
    `${DOCS_BASE}/message/message-search/search-messages`,

  // ── Moderation ────────────────────────────────────────────────────────
  'moderation-get-global-settings':
    `${DOCS_BASE}/application/setting-up-an-application/get-global-application-settings`,
  'moderation-update-global-settings':
    `${DOCS_BASE}/application/setting-up-an-application/update-global-application-settings`,
  'moderation-list-user-bans':
    `${DOCS_BASE}/moderation/listing-banned-users/list-channels-where-a-user-is-banned`,
  'moderation-list-user-mutes':
    `${DOCS_BASE}/moderation/listing-muted-users/list-muted-users-in-channels-by-a-custom-channel-type`,

  // ── Push Notifications ────────────────────────────────────────────────
  'push-get-config':
    `${DOCS_BASE}/push-notifications/managing-fcm-configurations/add-an-fcm-push-configuration`,
  'push-get-user-preference':
    `${DOCS_BASE}/user/configuring-notification-preferences/get-push-notification-preferences`,
  'push-update-user-preference':
    `${DOCS_BASE}/user/configuring-notification-preferences/update-push-notification-preferences`,

  // ── Webhooks ──────────────────────────────────────────────────────────
  'webhooks-get-settings':
    `${DOCS_BASE}/webhook/webhook-overview`,
  'webhooks-update-settings':
    `${DOCS_BASE}/webhook/webhook-overview`,

  // ── Data Export ────────────────────────────────────────────────────────
  'data-export-request':
    `${DOCS_BASE}/data-export/scheduling-data-exports/register-and-schedule-a-data-export`,
  'data-export-list':
    `${DOCS_BASE}/data-export/listing-data-exports/list-data-exports-by-message-channel-or-user`,
  'data-export-get-status':
    `${DOCS_BASE}/data-export/listing-data-exports/get-a-data-export`,

  // ── Bot Interface ─────────────────────────────────────────────────────
  'bots-create':
    `${DOCS_BASE}/bot/creating-a-bot/create-a-bot`,
  'bots-list':
    `${DOCS_BASE}/bot/listing-bots/list-bots`,
  'bots-get':
    `${DOCS_BASE}/bot/listing-bots/list-bots`,
  'bots-update':
    `${DOCS_BASE}/bot/managing-a-bot/update-a-bot`,
  'bots-delete':
    `${DOCS_BASE}/bot/managing-a-bot/delete-a-bot`,
  'bots-send-message':
    `${DOCS_BASE}/bot/sending-a-bot-message/send-a-bot-message`,

  // ── Analytics ─────────────────────────────────────────────────────────
  'analytics-daily-active-users':
    `${DOCS_BASE}/statistics/daus-and-maus/get-number-of-daily-active-users`,
  'analytics-monthly-active-users':
    `${DOCS_BASE}/statistics/daus-and-maus/get-number-of-monthly-active-users`,
  'analytics-advanced-metrics':
    `${DOCS_BASE}/statistics/statistics-overview`,
};

/** Category-level fallback documentation URLs */
export const CATEGORY_DOCS_MAP: Record<string, string> = {
  'Applications':        `${DOCS_BASE}/application/application-overview`,
  'Users':               `${DOCS_BASE}/user/user-overview`,
  'Open Channels':       `${DOCS_BASE}/channel/channel-overview`,
  'Group Channels':      `${DOCS_BASE}/channel/channel-overview`,
  'Messages':            `${DOCS_BASE}/message/messaging-basics/send-a-message`,
  'Moderation':          `${DOCS_BASE}/moderation/moderation-overview`,
  'Push Notifications':  `${DOCS_BASE}/push-notifications/managing-fcm-configurations/add-an-fcm-push-configuration`,
  'Webhooks':            `${DOCS_BASE}/webhook/webhook-overview`,
  'Data Export':         `${DOCS_BASE}/data-export/data-export-overview`,
  'Bot Interface':       `${DOCS_BASE}/bot/creating-a-bot/create-a-bot`,
  'Analytics':           `${DOCS_BASE}/statistics/statistics-overview`,
};

/**
 * Get the docs URL for a given endpoint.
 * Falls back to category-level docs if no specific URL is mapped.
 */
export function getDocsUrl(endpointId: string, category: string): string {
  return DOCS_URL_MAP[endpointId] || CATEGORY_DOCS_MAP[category] || `${DOCS_BASE}/overview`;
}
