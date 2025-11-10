-- Fix chat_messages table schema to match the code expectations
-- This script adds the missing columns and migrates data if needed

-- Step 1: Add representative_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' AND column_name = 'representative_id'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN representative_id TEXT;
        RAISE NOTICE 'Added representative_id column to chat_messages table';
    END IF;
END $$;

-- Step 2: Add content column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' AND column_name = 'content'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN content TEXT;
        RAISE NOTICE 'Added content column to chat_messages table';
    END IF;
END $$;

-- Step 3: Add sender_type column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' AND column_name = 'sender_type'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN sender_type TEXT CHECK (sender_type IN ('representative', 'admin', 'system'));
        RAISE NOTICE 'Added sender_type column to chat_messages table';
    END IF;
END $$;

-- Step 4: Add created_at column if it doesn't exist (use timestamp as fallback)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN created_at TIMESTAMP WITH TIME ZONE;
        -- Copy data from timestamp to created_at if timestamp exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'chat_messages' AND column_name = 'timestamp'
        ) THEN
            UPDATE chat_messages SET created_at = timestamp WHERE created_at IS NULL;
        ELSE
            UPDATE chat_messages SET created_at = NOW() WHERE created_at IS NULL;
        END IF;
        RAISE NOTICE 'Added created_at column to chat_messages table';
    END IF;
END $$;

-- Step 5: Add updated_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added updated_at column to chat_messages table';
    END IF;
END $$;

-- Step 6: Add metadata column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' AND column_name = 'metadata'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN metadata JSONB;
        RAISE NOTICE 'Added metadata column to chat_messages table';
    END IF;
END $$;

-- Step 7: Migrate existing data from old columns to new columns
-- If message column exists, copy to content
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' AND column_name = 'message'
    ) THEN
        UPDATE chat_messages 
        SET content = message 
        WHERE content IS NULL OR content = '';
        RAISE NOTICE 'Migrated data from message to content column';
    END IF;
END $$;

-- Step 8: Migrate sender_id to representative_id if sender_role is 'representative'
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' 
        AND column_name = 'sender_id' 
        AND EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'chat_messages' AND column_name = 'sender_role'
        )
    ) THEN
        UPDATE chat_messages 
        SET representative_id = sender_id 
        WHERE sender_role = 'representative' 
        AND (representative_id IS NULL OR representative_id = '');
        RAISE NOTICE 'Migrated sender_id to representative_id for representative messages';
    END IF;
END $$;

-- Step 9: Set sender_type based on sender_role
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' 
        AND column_name = 'sender_role'
        AND EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'chat_messages' AND column_name = 'sender_type'
        )
    ) THEN
        UPDATE chat_messages 
        SET sender_type = CASE 
            WHEN sender_role = 'representative' THEN 'representative'
            WHEN sender_role = 'admin' THEN 'admin'
            WHEN sender_role = 'bot' THEN 'system'
            ELSE 'admin'
        END
        WHERE sender_type IS NULL;
        RAISE NOTICE 'Migrated sender_role to sender_type';
    END IF;
END $$;

-- Step 10: Make representative_id NOT NULL if we have data, otherwise allow NULL for now
-- (We'll handle this in application logic for admin messages)
DO $$
BEGIN
    -- For now, we'll allow NULL for representative_id since admin messages might not have it
    -- But we should have it for representative messages
    RAISE NOTICE 'representative_id is allowed to be NULL for admin/system messages';
END $$;

-- Step 11: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_representative_id ON chat_messages(representative_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_type ON chat_messages(sender_type);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_representative_created ON chat_messages(representative_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_is_read ON chat_messages(is_read);

-- Step 12: Update message_type constraint to include new types
DO $$
BEGIN
    -- Drop old constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'chat_messages' 
        AND constraint_name = 'chat_messages_message_type_check'
    ) THEN
        ALTER TABLE chat_messages DROP CONSTRAINT chat_messages_message_type_check;
        RAISE NOTICE 'Dropped old message_type constraint';
    END IF;
    
    -- Add new constraint
    ALTER TABLE chat_messages 
    ADD CONSTRAINT chat_messages_message_type_check 
    CHECK (message_type IN ('text', 'image', 'file', 'location', 'user', 'bot'));
    RAISE NOTICE 'Added new message_type constraint';
END $$;

-- Summary
DO $$
BEGIN
    RAISE NOTICE 'Chat messages table schema update completed!';
    RAISE NOTICE 'New columns: representative_id, content, sender_type, created_at, updated_at, metadata';
    RAISE NOTICE 'Indexes created for: representative_id, sender_type, created_at, is_read';
END $$;

