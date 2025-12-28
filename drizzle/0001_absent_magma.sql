CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`instagramUsername` varchar(255) NOT NULL,
	`instagramProfileUrl` varchar(512) NOT NULL,
	`commentText` text NOT NULL,
	`postUrl` varchar(512) NOT NULL,
	`postDate` timestamp,
	`state` varchar(100) NOT NULL,
	`city` varchar(100) NOT NULL,
	`keywords` varchar(500),
	`sourceUrl` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `searches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`state` varchar(100) NOT NULL,
	`city` varchar(100) NOT NULL,
	`startDate` timestamp,
	`endDate` timestamp,
	`resultsCount` int DEFAULT 0,
	`searchQuery` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `searches_id` PRIMARY KEY(`id`)
);
