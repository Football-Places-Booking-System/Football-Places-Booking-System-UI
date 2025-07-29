
export interface BackendError {
  code: number;
  msg: string;
}

export enum ErrorCode {
  // ===== User Errors =====
  INVALID_USERNAME = 200,
  USERNAME_ALREADY_EXISTS = 201,
  INVALID_EMAIL = 202,
  EMAIL_ALREADY_EXISTS = 203,
  INVALID_PASSWORD = 204,
  INVALID_USER_ROLE = 205,
  INVALID_USER_STATUS = 206,
  USER_ALREADY_EXISTS = 207,
  USER_NOT_FOUND = 208,

  // ===== Team Errors =====
  INVALID_TEAM_NAME = 300,
  INVALID_TEAM_DESCRIPTION = 301,
  TEAM_NOT_FOUND = 302,
  TEAM_ALREADY_EXISTS = 303,

  // ===== Team Member Errors =====
  INVALID_TEAM_MEMBER_ROLE = 400,
  INVALID_TEAM_MEMBER_STATUS = 401,
  TEAM_MEMBER_ALREADY_EXISTS = 402,
  TEAM_MEMBER_NOT_FOUND = 403,
  INVALID_TEAM_STATUS = 404, 

  // ===== Place Errors =====
  INVALID_PLACE_NAME = 500,
  INVALID_PLACE_LOCATION = 501,
  INVALID_PLACE_TYPE = 502,
  PLACE_NOT_FOUND = 503,

  // ===== Booking Match Errors =====
  INVALID_BOOKING_START_TIME = 600,
  INVALID_BOOKING_END_TIME = 601,
  INVALID_MATCH_STATUS = 602,
  BOOKING_MATCH_NOT_FOUND = 603,

  // ===== Match Participant Errors =====
  INVALID_PARTICIPANT_STATUS = 700,
  MATCH_PARTICIPANT_NOT_FOUND = 701,

  // ===== Request Errors =====
  INVALID_REQUEST_TYPE = 800,
  INVALID_REQUEST_STATUS = 801,
  INVALID_REQUEST_MESSAGE = 802,
  REQUEST_NOT_FOUND = 803,

  // ===== Generic Errors =====
  NO_CONTENT = 900,
  NOT_FOUND = 901,
  NO_DATA = 902,
  UNAUTHORIZED = 903,
  FORBIDDEN = 904,
  INTERNAL_ERROR = 905
}

export const ErrorCodeMessages: { [key: number]: string } = {
  [ErrorCode.INVALID_USERNAME]: "Username is either empty or null",
  [ErrorCode.USERNAME_ALREADY_EXISTS]: "Username already exists",
  [ErrorCode.INVALID_EMAIL]: "Email is either empty or null",
  [ErrorCode.EMAIL_ALREADY_EXISTS]: "Email already exists",
  [ErrorCode.INVALID_PASSWORD]: "Password is either empty or null",
  [ErrorCode.INVALID_USER_ROLE]: "User role is invalid",
  [ErrorCode.INVALID_USER_STATUS]: "User status is invalid",
  [ErrorCode.USER_ALREADY_EXISTS]: "User already exists",
  [ErrorCode.USER_NOT_FOUND]: "User not found",

  [ErrorCode.INVALID_TEAM_NAME]: "Team name is either empty or null",
  [ErrorCode.INVALID_TEAM_DESCRIPTION]: "Team description is either empty or null",
  [ErrorCode.TEAM_NOT_FOUND]: "Team not found",
  [ErrorCode.TEAM_ALREADY_EXISTS]: "Team already exists",

  [ErrorCode.INVALID_TEAM_MEMBER_ROLE]: "Team member role is invalid",
  [ErrorCode.INVALID_TEAM_MEMBER_STATUS]: "Team member status is invalid",
  [ErrorCode.TEAM_MEMBER_ALREADY_EXISTS]: "User is already a team member",
  [ErrorCode.TEAM_MEMBER_NOT_FOUND]: "Team member not found",
  [ErrorCode.INVALID_TEAM_STATUS]: "Team status is invalid",

  [ErrorCode.INVALID_PLACE_NAME]: "Place name is either empty or null",
  [ErrorCode.INVALID_PLACE_LOCATION]: "Place location is either empty or null",
  [ErrorCode.INVALID_PLACE_TYPE]: "Place type is invalid",
  [ErrorCode.PLACE_NOT_FOUND]: "Place not found",

  [ErrorCode.INVALID_BOOKING_START_TIME]: "Booking start time is invalid",
  [ErrorCode.INVALID_BOOKING_END_TIME]: "Booking end time is invalid",
  [ErrorCode.INVALID_MATCH_STATUS]: "Booking match status is invalid",
  [ErrorCode.BOOKING_MATCH_NOT_FOUND]: "Booking match not found",

  [ErrorCode.INVALID_PARTICIPANT_STATUS]: "Participant status is invalid",
  [ErrorCode.MATCH_PARTICIPANT_NOT_FOUND]: "Match participant not found",

  [ErrorCode.INVALID_REQUEST_TYPE]: "Request type is invalid",
  [ErrorCode.INVALID_REQUEST_STATUS]: "Request status is invalid",
  [ErrorCode.INVALID_REQUEST_MESSAGE]: "Request message is either empty or null",
  [ErrorCode.REQUEST_NOT_FOUND]: "Request not found",

  [ErrorCode.NO_CONTENT]: "No content available",
  [ErrorCode.NOT_FOUND]: "Resource not found",
  [ErrorCode.NO_DATA]: "No data provided",
  [ErrorCode.UNAUTHORIZED]: "Unauthorized access",
  [ErrorCode.FORBIDDEN]: "Action is forbidden",
  [ErrorCode.INTERNAL_ERROR]: "Internal server error",
};