// Import all models to ensure they're registered with Mongoose
// This prevents "MissingSchemaError" when populating references
import "./User";
import "./Company";
import "./Job";
import "./Application";
import "./SavedJob";
import "./Blog";
import "./Comment";
import "./CareerArticle";
import "./TrainingProgram";
import "./Chat";
import "./Offer";

// Re-export for convenience
export { default as User } from "./User";
export { default as Company } from "./Company";
export { default as Job } from "./Job";
export { default as Application } from "./Application";
export { default as SavedJob } from "./SavedJob";
export { default as Blog } from "./Blog";
export { default as Comment } from "./Comment";
export { default as CareerArticle } from "./CareerArticle";
export { default as TrainingProgram } from "./TrainingProgram";
export { Conversation, Message } from "./Chat";
export { default as Offer } from "./Offer";

// Re-export types
export type { IUser } from "./User";
export type { ICompany } from "./Company";
export type { IJob } from "./Job";
export type { IApplication } from "./Application";
export type { ISavedJob } from "./SavedJob";
export type { IBlog } from "./Blog";
export type { IComment } from "./Comment";
export type { ICareerArticle } from "./CareerArticle";
export type { ITrainingProgram } from "./TrainingProgram";
export type { IConversation, IMessage, IChatParticipant } from "./Chat";
export type { IOffer } from "./Offer";

