-- Add sample proof photos to completed delivery tasks
-- This script demonstrates how proof photos are stored in the JSONB array format

-- Update some completed tasks with sample proof photo URLs
-- Note: Replace these URLs with actual image URLs from your storage

-- Sample proof photos for completed tasks
UPDATE delivery_tasks 
SET proof_photos = '[
  "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop"
]'::jsonb
WHERE status = 'completed' 
AND task_id = 'T008-953922-632';

-- Add proof photos to another completed task
UPDATE delivery_tasks 
SET proof_photos = '[
  "https://images.unsplash.com/photo-1494412651409-8963ce7935a7?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=400&fit=crop"
]'::jsonb
WHERE status = 'completed' 
AND id IN (
  SELECT id FROM delivery_tasks 
  WHERE status = 'completed' 
  AND proof_photos IS NULL 
  LIMIT 1
);

-- Add single proof photo to another completed task
UPDATE delivery_tasks 
SET proof_photos = '[
  "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop"
]'::jsonb
WHERE status = 'completed' 
AND id IN (
  SELECT id FROM delivery_tasks 
  WHERE status = 'completed' 
  AND proof_photos IS NULL 
  LIMIT 1
);

-- Verify the updates
SELECT 
  task_id,
  title,
  status,
  proof_photos,
  jsonb_array_length(proof_photos) as photo_count
FROM delivery_tasks 
WHERE proof_photos IS NOT NULL 
AND jsonb_array_length(proof_photos) > 0
ORDER BY created_at DESC;

