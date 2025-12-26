/**
 * Enumeration of available user roles in the system.
 *
 * @readonly
 * @enum {string}
 */
export const UserRolesEnum = {
    /** System administrator with full access */
    ADMIN: "admin",

    /** Administrator with project-level privileges */
    PROJECT_ADMIN: "project_admin",

    /** Regular project member */
    MEMBER: "member",
};

/**
 * List of allowed user role values.
 *
 * Useful for validation and schema enums.
 *
 * @type {string[]}
 */
export const AvailableUserRole = Object.values(UserRolesEnum);

/**
 * Enumeration of task statuses.
 *
 * @readonly
 * @enum {string}
 */
export const TaskStatusEnum = {
    /** Task is yet to be started */
    TODO: "todo",

    /** Task is currently in progress */
    IN_PROGRESS: "in_progress",

    /** Task has been completed */
    DONE: "done",
};

/**
 * List of allowed task status values.
 *
 * Useful for validation and schema enums.
 *
 * @type {string[]}
 */
export const AvailableTaskStatus = Object.values(TaskStatusEnum);
