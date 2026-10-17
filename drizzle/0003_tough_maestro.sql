CREATE TABLE `account_activations` (
	`hash` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`expires_at` text NOT NULL,
	`used` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `auth_accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `auth_identities` (
	`id` text PRIMARY KEY NOT NULL,
	`provider` text NOT NULL,
	`subject` text NOT NULL,
	`account_id` text NOT NULL,
	`email` text NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `auth_accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `identity_subject_unique` ON `auth_identities` (`provider`,`subject`);--> statement-breakpoint
CREATE UNIQUE INDEX `identity_account_provider_unique` ON `auth_identities` (`account_id`,`provider`);--> statement-breakpoint
CREATE TABLE `calendar_connections` (
	`account_id` text PRIMARY KEY NOT NULL,
	`google_subject` text NOT NULL,
	`email` text NOT NULL,
	`credentials` text NOT NULL,
	`calendar_id` text,
	`enabled` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL,
	`last_error` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `auth_accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `calendar_events` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`org_id` text NOT NULL,
	`task_id` text NOT NULL,
	`calendar_id` text NOT NULL,
	`event_id` text NOT NULL,
	`fingerprint` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `calendar_task_unique` ON `calendar_events` (`account_id`,`org_id`,`task_id`);--> statement-breakpoint
CREATE TABLE `calendar_jobs` (
	`org_id` text PRIMARY KEY NOT NULL,
	`revision` integer NOT NULL,
	`next_at` text NOT NULL,
	`lease_until` text DEFAULT '' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`last_error` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `oauth_transactions` (
	`hash` text PRIMARY KEY NOT NULL,
	`provider` text NOT NULL,
	`purpose` text NOT NULL,
	`account_id` text,
	`verifier` text NOT NULL,
	`nonce` text NOT NULL,
	`expires_at` text NOT NULL
);

--> statement-breakpoint
-- Preserve previously verified Google identities.
INSERT OR IGNORE INTO auth_identities(id,provider,subject,account_id,email) SELECT 'legacy-google-'||id,'google',google_subject,id,email FROM auth_accounts WHERE google_subject IS NOT NULL AND email_verified=1;
