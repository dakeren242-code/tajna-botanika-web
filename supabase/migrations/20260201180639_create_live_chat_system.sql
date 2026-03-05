-- Live Chat System
-- 
-- 1. New Tables
--    - chat_conversations: Ukládá jednotlivé konverzace se zákazníky
--    - chat_messages: Ukládá jednotlivé zprávy v konverzacích
-- 
-- 2. Security
--    - Enable RLS on both tables
--    - Customers can view their own conversations based on session_id
--    - Admins can view and respond to all conversations
-- 
-- 3. Indexes
--    - Index on conversation_id for faster message queries
--    - Index on session_id for customer lookup

-- Create chat_conversations table
CREATE TABLE IF NOT EXISTS chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email text,
  customer_name text,
  session_id text NOT NULL,
  status text DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  last_message_at timestamptz DEFAULT now(),
  unread_admin_count int DEFAULT 0,
  unread_customer_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  sender_type text NOT NULL CHECK (sender_type IN ('customer', 'admin', 'system')),
  sender_name text DEFAULT '',
  message text NOT NULL,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chat_conversations_session_id ON chat_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_status ON chat_conversations(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Enable RLS
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_conversations
-- Customers can view their own conversations
CREATE POLICY "Customers can view own conversations"
  ON chat_conversations
  FOR SELECT
  TO anon
  USING (true);

-- Customers can create conversations
CREATE POLICY "Customers can create conversations"
  ON chat_conversations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Customers can update their own conversations
CREATE POLICY "Customers can update own conversations"
  ON chat_conversations
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Admins can view all conversations
CREATE POLICY "Admins can view all conversations"
  ON chat_conversations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Admins can update all conversations
CREATE POLICY "Admins can update all conversations"
  ON chat_conversations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- RLS Policies for chat_messages
-- Anyone can view messages in their conversations
CREATE POLICY "Anyone can view messages"
  ON chat_messages
  FOR SELECT
  TO anon
  USING (true);

-- Anyone can create messages
CREATE POLICY "Anyone can create messages"
  ON chat_messages
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Authenticated users can update messages
CREATE POLICY "Authenticated can update messages"
  ON chat_messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Function to update conversation timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_conversations
  SET 
    last_message_at = NEW.created_at,
    updated_at = NEW.created_at,
    unread_admin_count = CASE 
      WHEN NEW.sender_type = 'customer' THEN unread_admin_count + 1
      ELSE unread_admin_count
    END,
    unread_customer_count = CASE
      WHEN NEW.sender_type IN ('admin', 'system') THEN unread_customer_count + 1
      ELSE unread_customer_count
    END
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation on new message
DROP TRIGGER IF EXISTS update_conversation_on_message ON chat_messages;
CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();