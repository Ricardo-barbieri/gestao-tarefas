CREATE TABLE `auth_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`user_id` text NOT NULL,
	`password_hash` text,
	`email_verified` integer DEFAULT 0 NOT NULL,
	`google_subject` text,
	`chatgpt_subject` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL,
	`approved_by` text,
	`approved_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `auth_accounts_email_unique` ON `auth_accounts` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `auth_accounts_user_id_unique` ON `auth_accounts` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `auth_accounts_google_subject_unique` ON `auth_accounts` (`google_subject`);--> statement-breakpoint
CREATE UNIQUE INDEX `auth_accounts_chatgpt_subject_unique` ON `auth_accounts` (`chatgpt_subject`);--> statement-breakpoint
CREATE TABLE `auth_sessions` (
	`hash` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `auth_accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `oauth_states` (
	`hash` text PRIMARY KEY NOT NULL,
	`verifier` text NOT NULL,
	`nonce` text NOT NULL,
	`expires_at` text NOT NULL
);
