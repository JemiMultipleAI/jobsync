// Import all models to ensure they're registered with Mongoose
// This prevents "MissingSchemaError" when populating references
import "./User";
import "./Company";
import "./Job";
import "./Application";
import "./SavedJob";

// Re-export for convenience
export { default as User } from "./User";
export { default as Company } from "./Company";
export { default as Job } from "./Job";
export { default as Application } from "./Application";
export { default as SavedJob } from "./SavedJob";

// Re-export types
export type { IUser } from "./User";
export type { ICompany } from "./Company";
export type { IJob } from "./Job";
export type { IApplication } from "./Application";
export type { ISavedJob } from "./SavedJob";

