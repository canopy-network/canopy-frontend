/**
 * @fileoverview API Client Test Functions
 *
 * This file contains test functions to verify the API client is working correctly.
 * These can be called from the browser console or used in development.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 * @since 2024-01-01
 */

import {
  healthApi,
  chainsApi,
  templatesApi,
  isApiHealthy,
  getApiStatus,
} from "./index";

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

/**
 * Test API health endpoint
 */
export async function testHealthEndpoint() {
  console.log("🔍 Testing API health endpoint...");

  try {
    const response = await healthApi.checkHealth();
    console.log("✅ Health check successful:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("❌ Health check failed:", error);
    return { success: false, error };
  }
}

/**
 * Test chains endpoint
 */
export async function testChainsEndpoint() {
  console.log("🔍 Testing chains endpoint...");

  try {
    const response = await chainsApi.getChains({ limit: 5 });
    console.log("✅ Chains fetch successful:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("❌ Chains fetch failed:", error);
    return { success: false, error };
  }
}

/**
 * Test templates endpoint
 */
export async function testTemplatesEndpoint() {
  console.log("🔍 Testing templates endpoint...");

  try {
    const response = await templatesApi.getTemplates({ limit: 5 });
    console.log("✅ Templates fetch successful:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("❌ Templates fetch failed:", error);
    return { success: false, error };
  }
}

/**
 * Test API status with detailed information
 */
export async function testApiStatus() {
  console.log("🔍 Testing API status...");

  try {
    const status = await getApiStatus();
    console.log("✅ API status check successful:", status);
    return { success: true, data: status };
  } catch (error) {
    console.error("❌ API status check failed:", error);
    return { success: false, error };
  }
}

/**
 * Run all API tests
 */
export async function runAllTests() {
  console.log("🚀 Running all API tests...\n");

  const results = {
    health: await testHealthEndpoint(),
    chains: await testChainsEndpoint(),
    templates: await testTemplatesEndpoint(),
    status: await testApiStatus(),
  };

  const successCount = Object.values(results).filter((r) => r.success).length;
  const totalCount = Object.keys(results).length;

  console.log(`\n📊 Test Results: ${successCount}/${totalCount} tests passed`);

  if (successCount === totalCount) {
    console.log("🎉 All tests passed! API client is working correctly.");
  } else {
    console.log("⚠️  Some tests failed. Check the errors above.");
  }

  return results;
}

// ============================================================================
// BROWSER CONSOLE HELPERS
// ============================================================================

/**
 * Make test functions available in browser console
 */
if (typeof window !== "undefined") {
  (window as any).apiTests = {
    testHealthEndpoint,
    testChainsEndpoint,
    testTemplatesEndpoint,
    testApiStatus,
    runAllTests,
  };

  console.log("🧪 API test functions available in window.apiTests");
  console.log("Try: window.apiTests.runAllTests()");
}
