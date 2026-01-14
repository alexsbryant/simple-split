-- Enable Realtime for notifications table
-- This allows Supabase Realtime subscriptions to work

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Configure replica identity to send old values on UPDATE (needed for UPDATE event filtering)
ALTER TABLE notifications REPLICA IDENTITY FULL;
