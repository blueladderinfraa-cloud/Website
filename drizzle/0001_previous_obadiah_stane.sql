CREATE TABLE `clientProjects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`projectId` int NOT NULL,
	`accessLevel` enum('view','full') NOT NULL DEFAULT 'view',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `clientProjects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dailyLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text,
	`images` json,
	`authorId` int,
	`authorName` varchar(255),
	`logDate` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dailyLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`clientId` int,
	`name` varchar(255) NOT NULL,
	`type` enum('contract','blueprint','invoice','other') NOT NULL DEFAULT 'other',
	`fileUrl` text NOT NULL,
	`fileKey` varchar(500),
	`fileSize` int,
	`uploadedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20),
	`company` varchar(255),
	`serviceType` enum('residential','commercial','industrial','infrastructure','general') DEFAULT 'general',
	`message` text,
	`area` int,
	`constructionType` enum('standard','premium','luxury'),
	`estimatedBudget` decimal(15,2),
	`status` enum('new','contacted','quoted','converted','closed') NOT NULL DEFAULT 'new',
	`source` varchar(100) DEFAULT 'website',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projectImages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`imageUrl` text NOT NULL,
	`caption` varchar(255),
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `projectImages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projectPhases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`status` enum('pending','in_progress','completed') NOT NULL DEFAULT 'pending',
	`sortOrder` int DEFAULT 0,
	`startDate` timestamp,
	`endDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projectPhases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`location` varchar(255),
	`clientName` varchar(255),
	`clientId` int,
	`status` enum('upcoming','ongoing','completed') NOT NULL DEFAULT 'upcoming',
	`category` enum('residential','commercial','industrial','infrastructure') NOT NULL DEFAULT 'residential',
	`featured` boolean DEFAULT false,
	`startDate` timestamp,
	`endDate` timestamp,
	`budget` decimal(15,2),
	`sqftBuilt` int,
	`progress` int DEFAULT 0,
	`beforeImage` text,
	`afterImage` text,
	`coverImage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`),
	CONSTRAINT `projects_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`shortDescription` text,
	`fullDescription` text,
	`icon` varchar(100),
	`image` text,
	`category` enum('residential','commercial','industrial','infrastructure') NOT NULL,
	`features` json,
	`isActive` boolean DEFAULT true,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `services_id` PRIMARY KEY(`id`),
	CONSTRAINT `services_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `siteContent` (
	`id` int AUTO_INCREMENT NOT NULL,
	`section` varchar(100) NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text,
	`type` enum('text','html','image','json') NOT NULL DEFAULT 'text',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `siteContent_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `siteStats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` int DEFAULT 0,
	`label` varchar(255),
	`suffix` varchar(50),
	`sortOrder` int DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `siteStats_id` PRIMARY KEY(`id`),
	CONSTRAINT `siteStats_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `subcontractorApplications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`companyName` varchar(255) NOT NULL,
	`contactName` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`address` text,
	`specializations` json,
	`yearsExperience` int,
	`licenseNumber` varchar(100),
	`licenseFileUrl` text,
	`licenseFileKey` varchar(500),
	`insuranceFileUrl` text,
	`insuranceFileKey` varchar(500),
	`portfolioUrl` text,
	`notes` text,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subcontractorApplications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tenderApplications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenderId` int NOT NULL,
	`subcontractorId` int,
	`companyName` varchar(255) NOT NULL,
	`contactName` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20),
	`proposedBudget` decimal(15,2),
	`proposalDetails` text,
	`attachmentUrl` text,
	`attachmentKey` varchar(500),
	`status` enum('submitted','under_review','shortlisted','awarded','rejected') NOT NULL DEFAULT 'submitted',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tenderApplications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tenders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`projectId` int,
	`category` enum('residential','commercial','industrial','infrastructure') NOT NULL,
	`budget` decimal(15,2),
	`deadline` timestamp,
	`requirements` text,
	`status` enum('open','closed','awarded') NOT NULL DEFAULT 'open',
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tenders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientName` varchar(255) NOT NULL,
	`clientTitle` varchar(255),
	`clientCompany` varchar(255),
	`clientImage` text,
	`content` text NOT NULL,
	`rating` int DEFAULT 5,
	`projectId` int,
	`featured` boolean DEFAULT false,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `testimonials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','client','subcontractor') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `company` varchar(255);