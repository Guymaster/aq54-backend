export const StatusCodes = {
    OK: 200,
    BAD_REQUEST: 400,
    RESOURCE_NOT_FOUND: 404,
    ACCESS_DENIED: 403,
    REQUEST_IS_BEING_TREATED: 100,
    REDIRECTED_PERMANENTLY: 301,
    REDIRECTED_TEMPORARLY: 302,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABALE: 503,
};

export const AggregationTypes = {
    HOURLY: "HOURLY",
    DAILY: "DAILY"
};

export const ReqExceptions = {
    INVALID_PATH: "REQ000",
    INVALID_BODY: "REQ001",
    INVALID_PARAMS: "REQ002"
};

export const AuthExceptions = {
    NOT_AUTHENTIFIED: "AUTH000"
};

export const RefExceptions = {
    RESOURCE_NOT_FOUND: "REF000"
};