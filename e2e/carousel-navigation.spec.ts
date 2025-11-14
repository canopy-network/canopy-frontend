import { test, expect } from "@playwright/test";

test.describe("Chain Carousel Navigation Suite", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage before each test
    await page.goto("/");
  });

  test.describe("Carousel Display and Navigation", () => {
    test("should display the carousel with chains", async ({ page }) => {
      // Wait for the carousel to be visible
      const carousel = page.locator("#highlighted-projects");
      await expect(carousel).toBeVisible({ timeout: 15000 });

      // Wait for the carousel content to load (project cards)
      const chainLinks = carousel.locator('a[href^="/chain/"]');
      await expect(chainLinks.first()).toBeVisible({ timeout: 15000 });
    });

    test("should have at least 3 chains in the carousel", async ({ page }) => {
      const carousel = page.locator("#highlighted-projects");
      await expect(carousel).toBeVisible({ timeout: 15000 });

      // Find the carousel dots/indicators
      const dotsContainer = carousel.locator("div.flex.justify-center");
      const dots = dotsContainer.locator("button");
      const dotsCount = await dots.count();

      // Verify we have at least 3 chains
      expect(dotsCount).toBeGreaterThanOrEqual(3);
    });

    test("should navigate between chains using carousel dots", async ({
      page,
    }) => {
      const carousel = page.locator("#highlighted-projects");
      await expect(carousel).toBeVisible({ timeout: 15000 });

      // Find the carousel dots/indicators
      const dotsContainer = carousel.locator("div.flex.justify-center");
      const dots = dotsContainer.locator("button");
      const dotsCount = await dots.count();

      // Wait for dots to be visible
      if (dotsCount > 1) {
        await expect(dots.first()).toBeVisible({ timeout: 5000 });
      }

      // Verify we have at least 3 chains
      expect(dotsCount).toBeGreaterThanOrEqual(3);

      // Navigate through at least 3 chains (indices 0, 1, 2)
      const chainsToNavigate = Math.min(3, dotsCount);

      for (let i = 0; i < chainsToNavigate; i++) {
        const dot = dots.nth(i);

        // Click the dot to navigate to this chain
        await dot.click();

        // Wait for the transition to complete (carousel uses 500ms transition)
        await page.waitForTimeout(600);

        // Verify the clicked dot is now active (has the active styling with bg-white)
        const activeDotSpan = dot.locator("span");
        await expect(activeDotSpan).toHaveClass(/bg-white/, { timeout: 1000 });

        // Verify the previous active dot is no longer active (if not the first)
        if (i > 0) {
          const previousDot = dots.nth(i - 1);
          const previousDotSpan = previousDot.locator("span");
          const previousClasses = await previousDotSpan.getAttribute("class");
          expect(previousClasses).not.toContain("bg-white");
        }
      }
    });
  });

  test.describe("Chain Details Navigation", () => {
    test("should navigate to chain details when clicking on the third chain", async ({
      page,
    }) => {
      const carousel = page.locator("#highlighted-projects");
      await expect(carousel).toBeVisible({ timeout: 15000 });

      // Wait for carousel content
      const chainLinks = carousel.locator('a[href^="/chain/"]');
      await expect(chainLinks.first()).toBeVisible({ timeout: 15000 });

      // Find the carousel dots
      const dotsContainer = carousel.locator("div.flex.justify-center");
      const dots = dotsContainer.locator("button");
      const dotsCount = await dots.count();

      // Verify we have at least 3 chains
      expect(dotsCount).toBeGreaterThanOrEqual(3);

      // Navigate to the third chain (index 2)
      const thirdChainDot = dots.nth(2);
      await thirdChainDot.click();
      await page.waitForTimeout(600);

      // Verify the third dot is active
      const thirdDotSpan = thirdChainDot.locator("span");
      await expect(thirdDotSpan).toHaveClass(/bg-white/, { timeout: 1000 });

      // Find the third chain's link (the currently visible/active chain card)
      const chainLink = carousel
        .locator('a[href^="/chain/"]')
        .filter({
          has: page.locator("h2"),
        })
        .first();

      // Get the href to verify navigation
      const href = await chainLink.getAttribute("href");
      expect(href).toBeTruthy();
      expect(href).toMatch(/^\/chain\//);

      // Extract chain ID from href for verification
      const chainId = href?.replace("/chain/", "").replace("/", "");

      // Get the chain name from the h2 for verification
      const chainName = await chainLink.locator("h2").textContent();
      expect(chainName).toBeTruthy();

      // Click on the chain link
      await chainLink.click();

      // Wait for navigation to chain details page
      await page.waitForURL(new RegExp(`/chain/${chainId}`), {
        timeout: 15000,
      });

      // Verify we're on the chain details page
      const chainDetails = page.locator("#chain-details");
      await expect(chainDetails).toBeVisible({ timeout: 15000 });

      // Verify the URL is correct
      expect(page.url()).toContain(`/chain/${chainId}`);

      // Verify the chain details header is visible
      const chainDetailsHeader = page
        .locator("#chain-details")
        .locator("header, h1, h2")
        .first();
      await expect(chainDetailsHeader).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("End-to-End Carousel Flow", () => {
    test("The user can scroll between the chains on the slider and click on a chain to load chain details", async ({
      page,
    }) => {
      // Wait for the carousel to be visible
      const carousel = page.locator("#highlighted-projects");
      await expect(carousel).toBeVisible({ timeout: 15000 });

      // Wait for the carousel content to load
      const chainLinks = carousel.locator('a[href^="/chain/"]');
      await expect(chainLinks.first()).toBeVisible({ timeout: 15000 });

      // Find the carousel dots/indicators
      const dotsContainer = carousel.locator("div.flex.justify-center");
      const dots = dotsContainer.locator("button");
      const dotsCount = await dots.count();

      // Wait for dots to be visible if there are multiple projects
      if (dotsCount > 1) {
        await expect(dots.first()).toBeVisible({ timeout: 5000 });
      }

      // Verify we have at least 3 chains to navigate through
      expect(dotsCount).toBeGreaterThanOrEqual(3);

      // Navigate through at least 3 chains (indices 0, 1, 2)
      const chainsToNavigate = Math.min(3, dotsCount);

      for (let i = 0; i < chainsToNavigate; i++) {
        const dot = dots.nth(i);

        // Click the dot to navigate to this chain
        await dot.click();

        // Wait for the transition to complete
        await page.waitForTimeout(600);

        // Verify the clicked dot is now active
        const activeDotSpan = dot.locator("span");
        await expect(activeDotSpan).toHaveClass(/bg-white/, { timeout: 1000 });

        // Verify the previous active dot is no longer active
        if (i > 0) {
          const previousDot = dots.nth(i - 1);
          const previousDotSpan = previousDot.locator("span");
          const previousClasses = await previousDotSpan.getAttribute("class");
          expect(previousClasses).not.toContain("bg-white");
        }
      }

      // Navigate to the third chain (index 2) to ensure it's visible
      const thirdChainDot = dots.nth(2);
      await thirdChainDot.click();
      await page.waitForTimeout(600);

      // Verify the third dot is active
      const thirdDotSpan = thirdChainDot.locator("span");
      await expect(thirdDotSpan).toHaveClass(/bg-white/, { timeout: 1000 });

      // Find the third chain's link
      const chainLink = carousel
        .locator('a[href^="/chain/"]')
        .filter({
          has: page.locator("h2"),
        })
        .first();

      // Get the href and chain ID
      const href = await chainLink.getAttribute("href");
      expect(href).toBeTruthy();
      expect(href).toMatch(/^\/chain\//);

      const chainId = href?.replace("/chain/", "").replace("/", "");
      const chainName = await chainLink.locator("h2").textContent();
      expect(chainName).toBeTruthy();

      // Click on the chain link
      await chainLink.click();

      // Wait for navigation to chain details page
      await page.waitForURL(new RegExp(`/chain/${chainId}`), {
        timeout: 15000,
      });

      // Verify we're on the chain details page
      const chainDetails = page.locator("#chain-details");
      await expect(chainDetails).toBeVisible({ timeout: 15000 });

      // Verify the URL is correct
      expect(page.url()).toContain(`/chain/${chainId}`);

      // Verify the chain details header is visible
      const chainDetailsHeader = page
        .locator("#chain-details")
        .locator("header, h1, h2")
        .first();
      await expect(chainDetailsHeader).toBeVisible({ timeout: 5000 });
    });
  });
});
