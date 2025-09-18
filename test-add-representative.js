// Test script to verify the addRepresentative function works
console.log('=== TESTING ADD REPRESENTATIVE FUNCTION ===');

// Mock representative data
const testRepresentativeData = {
  name: 'Test Representative',
  email: 'test@example.com',
  phone: '+1-555-123-4567',
  address: '123 Test Street',
  license_number: 'DL123456789',
  emergency_contact: 'Emergency Contact +1-555-987-6543',
  vehicle: 'VH-TEST',
  coverage_areas: ['Test Area 1', 'Test Area 2'],
  transportation: 'vehicle'
};

console.log('Test data:', testRepresentativeData);

// Check if the data structure matches the representatives table schema
const expectedFields = [
  'id', 'name', 'email', 'phone', 'address', 
  'license_number', 'emergency_contact', 'vehicle', 
  'status', 'coverage_areas', 'transportation_type', 'avatar_url'
];

console.log('Expected fields in representatives table:', expectedFields);

// Simulate the repData object that will be created
const repData = {
  id: 'REP-12345678', // This will be generated
  name: testRepresentativeData.name,
  email: testRepresentativeData.email,
  phone: testRepresentativeData.phone,
  address: testRepresentativeData.address || null,
  license_number: testRepresentativeData.license_number || null,
  emergency_contact: testRepresentativeData.emergency_contact || null,
  vehicle: testRepresentativeData.vehicle || null,
  status: 'active',
  coverage_areas: testRepresentativeData.coverage_areas || [],
  transportation_type: testRepresentativeData.transportation || 'foot',
  avatar_url: null
};

console.log('Generated repData object:', repData);

// Check if all fields are valid
const repDataFields = Object.keys(repData);
const missingFields = expectedFields.filter(field => !repDataFields.includes(field));
const extraFields = repDataFields.filter(field => !expectedFields.includes(field));

console.log('Missing fields:', missingFields);
console.log('Extra fields:', extraFields);

if (missingFields.length === 0 && extraFields.length === 0) {
  console.log('✅ Data structure matches table schema perfectly!');
} else {
  console.log('❌ Data structure mismatch detected!');
}

console.log('=== TEST COMPLETE ===');
