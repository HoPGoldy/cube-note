export const ACCESS_TOKEN_SCOPES = [
  "article:read",
  "article:write",
  "tag:read",
  "tag:write",
  "attachment:read",
  "attachment:write",
] as const;

export type AccessTokenScope = (typeof ACCESS_TOKEN_SCOPES)[number];

export const DEFAULT_SCOPES: AccessTokenScope[] = [
  "article:read",
  "article:write",
  "tag:read",
  "tag:write",
  "attachment:read",
  "attachment:write",
];
