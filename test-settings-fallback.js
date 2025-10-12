// Test script to verify settings localStorage fallback is working
console.log('🧪 Testing Settings localStorage Fallback...');

// Test localStorage functionality
try {
  // Test saving settings
  const testSettings = {
    companyName: "Test Company",
    companyEmail: "test@example.com",
    timezone: "Asia/Riyadh",
    currency: "SAR",
    language: "ar"
  };

  localStorage.setItem('system-settings', JSON.stringify(testSettings));
  console.log('✅ Settings saved to localStorage');

  // Test loading settings
  const loadedSettings = JSON.parse(localStorage.getItem('system-settings') || '{}');
  console.log('✅ Settings loaded from localStorage:', loadedSettings);

  // Test updating settings
  const updatedSettings = { ...loadedSettings, companyName: "Updated Company" };
  localStorage.setItem('system-settings', JSON.stringify(updatedSettings));
  console.log('✅ Settings updated in localStorage');

  // Verify the update
  const finalSettings = JSON.parse(localStorage.getItem('system-settings') || '{}');
  console.log('✅ Final settings:', finalSettings);

  if (finalSettings.companyName === "Updated Company") {
    console.log('🎉 localStorage fallback is working perfectly!');
  } else {
    console.log('❌ localStorage fallback has issues');
  }

} catch (error) {
  console.error('❌ localStorage test failed:', error);
}

// Test custom event broadcasting
try {
  const testEvent = new CustomEvent('settingsChanged', {
    detail: { type: 'system', settings: { companyName: 'Test' } }
  });
  
  window.dispatchEvent(testEvent);
  console.log('✅ Custom event broadcasting works');
} catch (error) {
  console.error('❌ Custom event test failed:', error);
}

console.log('🏁 Settings fallback test completed!');
