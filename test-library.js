// Test library functionality
const { convertCsvToTemplate, generateUUID, NameToIdMapper, colorByIndex, Phase, Section, Topic, Template } = require('./dist/index.js');

console.log('Testing library exports...');

// Test utility functions
console.log('generateUUID():', generateUUID());
console.log('colorByIndex(0):', colorByIndex(0));
console.log('colorByIndex(1):', colorByIndex(1));

// Test NameToIdMapper
const mapper = new NameToIdMapper();
console.log('mapper.getOrCreateId("test"):', mapper.getOrCreateId("test"));
console.log('mapper.getOrCreateId("test") again:', mapper.getOrCreateId("test")); // Should be same ID

console.log('✓ All library functions are accessible');