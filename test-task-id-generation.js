const { createClient } = require('@supabase/supabase-js');

// You'll need to set these environment variables or replace with your actual values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_KEY';

if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseKey === 'YOUR_SUPABASE_KEY') {
  console.error('❌ Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTaskIdGeneration() {
  console.log('🔍 Testing task ID generation...');
  
  try {
    // Test 1: Check existing task IDs
    console.log('\n1. Checking existing task IDs...');
    const { data: existingTasks, error: tasksError } = await supabase
      .from('delivery_tasks')
      .select('task_id')
      .order('created_at', { ascending: false })
      .limit(5);

    if (tasksError) {
      console.error('❌ Error fetching existing tasks:', tasksError);
      return;
    }

    console.log('📋 Existing task IDs:');
    if (existingTasks && existingTasks.length > 0) {
      existingTasks.forEach(task => {
        console.log(`  - ${task.task_id}`);
      });
    } else {
      console.log('  No existing tasks found');
    }

    // Test 2: Generate multiple task IDs to test uniqueness
    console.log('\n2. Testing task ID generation...');
    
    const generatedIds = [];
    for (let i = 0; i < 3; i++) {
      try {
        // Simulate the generateTaskId function logic
        const { data: allTasks, error: fetchError } = await supabase
          .from('delivery_tasks')
          .select('task_id')
          .order('created_at', { ascending: false });

        if (fetchError) {
          console.error('❌ Error fetching tasks:', fetchError);
          continue;
        }

        let nextNumber = 1;
        if (allTasks && allTasks.length > 0) {
          let maxNumber = 0;
          for (const task of allTasks) {
            const match = task.task_id.match(/T(\d+)/);
            if (match) {
              const number = parseInt(match[1]);
              if (number > maxNumber) {
                maxNumber = number;
              }
            }
          }
          nextNumber = maxNumber + 1;
        }

        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const taskId = `T${String(nextNumber).padStart(3, '0')}-${timestamp}-${random}`;
        
        generatedIds.push(taskId);
        console.log(`✅ Generated task ID ${i + 1}: ${taskId}`);
        
        // Small delay to ensure different timestamps
        await new Promise(resolve => setTimeout(resolve, 10));
      } catch (error) {
        console.error(`❌ Error generating task ID ${i + 1}:`, error);
      }
    }

    // Test 3: Check for duplicates
    console.log('\n3. Checking for duplicates...');
    const uniqueIds = [...new Set(generatedIds)];
    if (uniqueIds.length === generatedIds.length) {
      console.log('✅ All generated task IDs are unique');
    } else {
      console.log('❌ Duplicate task IDs found');
    }

    console.log('\n🎉 Task ID generation test completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testTaskIdGeneration();

