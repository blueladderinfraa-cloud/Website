CREATE TABLE `clientProjects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`clientId` integer NOT NULL,
	`projectId` integer NOT NULL,
	`accessLevel` text DEFAULT 'view' NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `dailyLogs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`projectId` integer NOT NULL,
	`title` text NOT NULL,
	`content` text,
	`images` text,
	`authorId` integer,
	`authorName` text,
	`logDate` integer NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`projectId` integer NOT NULL,
	`clientId` integer,
	`name` text NOT NULL,
	`type` text DEFAULT 'other' NOT NULL,
	`fileUrl` text NOT NULL,
	`fileKey` text,
	`fileSize` integer,
	`uploadedBy` integer,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `inquiries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`company` text,
	`serviceType` text DEFAULT 'general',
	`message` text,
	`area` integer,
	`constructionType` text,
	`estimatedBudget` text,
	`status` text DEFAULT 'new' NOT NULL,
	`source` text DEFAULT 'website',
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `projectImages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`projectId` integer NOT NULL,
	`imageUrl` text NOT NULL,
	`caption` text,
	`sortOrder` integer DEFAULT 0,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `projectPhases` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`projectId` integer NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`sortOrder` integer DEFAULT 0,
	`startDate` integer,
	`endDate` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`location` text,
	`clientName` text,
	`clientId` integer,
	`status` text DEFAULT 'upcoming' NOT NULL,
	`category` text DEFAULT 'residential' NOT NULL,
	`featured` integer DEFAULT false,
	`startDate` integer,
	`endDate` integer,
	`budget` text,
	`sqftBuilt` integer,
	`progress` integer DEFAULT 0,
	`beforeImage` text,
	`afterImage` text,
	`coverImage` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `projects_slug_unique` ON `projects` (`slug`);--> statement-breakpoint
CREATE TABLE `services` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`shortDescription` text,
	`fullDescription` text,
	`icon` text,
	`image` text,
	`category` text NOT NULL,
	`features` text,
	`isActive` integer DEFAULT true,
	`sortOrder` integer DEFAULT 0,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `services_slug_unique` ON `services` (`slug`);--> statement-breakpoint
CREATE TABLE `siteContent` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`section` text NOT NULL,
	`key` text NOT NULL,
	`value` text,
	`type` text DEFAULT 'text' NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `siteStats` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`value` integer DEFAULT 0,
	`label` text,
	`suffix` text,
	`sortOrder` integer DEFAULT 0,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `siteStats_key_unique` ON `siteStats` (`key`);--> statement-breakpoint
CREATE TABLE `subcontractorApplications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer,
	`companyName` text NOT NULL,
	`contactName` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`address` text,
	`specializations` text,
	`yearsExperience` integer,
	`licenseNumber` text,
	`licenseFileUrl` text,
	`licenseFileKey` text,
	`insuranceFileUrl` text,
	`insuranceFileKey` text,
	`portfolioUrl` text,
	`notes` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tenderApplications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenderId` integer NOT NULL,
	`subcontractorId` integer,
	`companyName` text NOT NULL,
	`contactName` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`proposedBudget` text,
	`proposalDetails` text,
	`attachmentUrl` text,
	`attachmentKey` text,
	`status` text DEFAULT 'submitted' NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tenders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`projectId` integer,
	`category` text NOT NULL,
	`budget` text,
	`deadline` integer,
	`requirements` text,
	`status` text DEFAULT 'open' NOT NULL,
	`isActive` integer DEFAULT true,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`clientName` text NOT NULL,
	`clientTitle` text,
	`clientCompany` text,
	`clientImage` text,
	`content` text NOT NULL,
	`rating` integer DEFAULT 5,
	`projectId` integer,
	`featured` integer DEFAULT false,
	`isActive` integer DEFAULT true,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`openId` text NOT NULL,
	`name` text,
	`email` text,
	`phone` text,
	`loginMethod` text,
	`role` text DEFAULT 'user' NOT NULL,
	`company` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`lastSignedIn` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_openId_unique` ON `users` (`openId`);