DROP INDEX `calendar_task_unique`;--> statement-breakpoint
ALTER TABLE `calendar_events` ADD `google_subject` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `calendar_task_unique` ON `calendar_events` (`account_id`,`org_id`,`task_id`,`google_subject`);