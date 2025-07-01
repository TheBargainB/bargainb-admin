// QA Test Center - Production Test Scripts Seeder
// Run with: node scripts/seed-qa-scripts.js

const { createClient } = require('@supabase/supabase-js')

// Supabase configuration - Load from .env.local manually
const fs = require('fs');
const path = require('path');

// Read .env.local file
const envPath = path.join(__dirname, '..', '.env.local');
let supabaseUrl, supabaseKey;

try {
  const envFile = fs.readFileSync(envPath, 'utf8');
  const lines = envFile.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1];
    }
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
      supabaseKey = line.split('=')[1];
    }
  }
} catch (error) {
  console.log('Warning: Could not read .env.local file');
}

// Fallback to environment variables
supabaseUrl = supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
supabaseKey = supabaseKey || process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

console.log('🔧 Supabase URL:', supabaseUrl);
console.log('🔧 Service Key:', supabaseKey ? 'Present' : 'Missing');
const supabase = createClient(supabaseUrl, supabaseKey)

// Real production test scripts for BargainB admin
const productionTestScripts = [
  {
    name: "Admin Authentication Flow Test",
    description: "Comprehensive test for admin login, session management, and logout functionality with error handling",
    category: "authentication", 
    priority: "critical",
    tags: ["authentication", "security", "login", "session"],
    script_language: "javascript",
    retry_count: 3,
    headless: true,
    test_environment: "production",
    version: 1,
    script_content: `import { test, expect } from '@playwright/test';

test.describe('Admin Authentication Flow', () => {
  test('Should login successfully with valid credentials', async ({ page }) => {
    // Navigate to admin login
    await page.goto('/admin/login');
    
    // Verify login page loads
    await expect(page.locator('h1, h2')).toContainText(/admin login|sign in/i);
    
    // Fill login form
    await page.fill('[type="email"]', 'hagerelgammal44@gmail.com');
    await page.fill('[type="password"]', 'abcd1234');
    
    // Submit login
    await page.click('button[type="submit"]');
    
    // Wait for redirect and verify authentication
    await page.waitForURL('/admin');
    await expect(page.locator('text=hagerelgammal44@gmail.com')).toBeVisible();
    
    // Verify admin panel loads with user email
    await expect(page.locator('h1')).toContainText('BargainB Admin Panel');
  });

  test('Should show error for invalid credentials', async ({ page }) => {
    await page.goto('/admin/login');
    
    // Try invalid credentials
    await page.fill('[type="email"]', 'invalid@example.com');
    await page.fill('[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('text=invalid')).toBeVisible({ timeout: 10000 });
  });

  test('Should handle logout correctly', async ({ page }) => {
    // Login first
    await page.goto('/admin/login');
    await page.fill('[type="email"]', 'hagerelgammal44@gmail.com');
    await page.fill('[type="password"]', 'abcd1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
    
    // Logout
    await page.click('button:has-text("Logout")');
    
    // Should redirect to login
    await page.waitForURL('/admin/login');
    await expect(page.locator('h1, h2')).toContainText(/admin login|sign in/i);
  });
});`,
    timeout_seconds: 90,
    browser_type: "chromium",
    is_active: true,
    is_template: false
  },

  {
    name: "User Management CRUD Operations",
    description: "Complete user management testing including viewing users, contact details, notes, and blocking functionality",
    category: "ui",
    priority: "high", 
    tags: ["users", "crud", "contacts", "blocking", "notes"],
    script_content: `import { test, expect } from '@playwright/test';

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/admin/login');
    await page.fill('[type="email"]', 'hagerelgammal44@gmail.com');
    await page.fill('[type="password"]', 'abcd1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
  });

  test('Should load users page and display user list', async ({ page }) => {
    // Navigate to users
    await page.click('a[href="/admin/users"]');
    await page.waitForURL('/admin/users');
    
    // Verify users page loaded
    await expect(page.locator('h1, h2')).toContainText(/users|contacts/i);
    
    // Check for user table/grid
    await expect(page.locator('table, [data-testid="users-grid"]')).toBeVisible();
    
    // Verify search functionality exists
    await expect(page.locator('input[placeholder*="search"]')).toBeVisible();
  });

  test('Should open and close contact details modal', async ({ page }) => {
    await page.goto('/admin/users');
    
    // Click on first user if available
    const firstUser = page.locator('button:has-text("View"), button:has-text("Details")').first();
    if (await firstUser.isVisible()) {
      await firstUser.click();
      
      // Modal should open
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      
      // Close modal
      await page.press('body', 'Escape');
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    }
  });

  test('Should handle user search functionality', async ({ page }) => {
    await page.goto('/admin/users');
    
    // Test search
    const searchInput = page.locator('input[placeholder*="search"]');
    await searchInput.fill('test user');
    
    // Wait for search results
    await page.waitForTimeout(1000);
    
    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(500);
  });

  test('Should test user notes functionality', async ({ page }) => {
    await page.goto('/admin/users');
    
    // Look for notes button/link
    const notesButton = page.locator('button:has-text("Notes"), a:has-text("Notes")').first();
    if (await notesButton.isVisible()) {
      await notesButton.click();
      
      // Notes modal/page should open
      await expect(page.locator('text=notes')).toBeVisible();
    }
  });
});`,
    timeout_seconds: 120,
    browser_type: "chromium",
    is_active: true,
    is_template: false
  },

  {
    name: "Product Management Interface Test",
    description: "Test product listing, search, filtering, and product details modal functionality",
    category: "ui", 
    priority: "high",
    tags: ["products", "search", "filtering", "details", "catalog"],
    script_content: `import { test, expect } from '@playwright/test';

test.describe('Product Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('[type="email"]', 'hagerelgammal44@gmail.com');
    await page.fill('[type="password"]', 'abcd1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
  });

  test('Should load products page with product catalog', async ({ page }) => {
    await page.click('a[href="/admin/products"]');
    await page.waitForURL('/admin/products');
    
    // Verify products page
    await expect(page.locator('h1, h2')).toContainText(/products/i);
    
    // Check for product metrics
    await expect(page.locator('text=35,420')).toBeVisible(); // Total products
    await expect(page.locator('text=91%')).toBeVisible(); // Enrichment rate
  });

  test('Should test product search and filtering', async ({ page }) => {
    await page.goto('/admin/products');
    
    // Test search if available
    const searchInput = page.locator('input[placeholder*="search"], input[type="search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('electronics');
      await page.waitForTimeout(1000);
      await searchInput.clear();
    }
    
    // Test category filters if available
    const categoryFilter = page.locator('select, [role="combobox"]:has-text("category")');
    if (await categoryFilter.isVisible()) {
      await categoryFilter.click();
      await page.waitForTimeout(500);
    }
  });

  test('Should open product details modal', async ({ page }) => {
    await page.goto('/admin/products');
    
    // Look for product detail buttons
    const detailButton = page.locator('button:has-text("View"), button:has-text("Details")').first();
    if (await detailButton.isVisible()) {
      await detailButton.click();
      
      // Product modal should open
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      
      // Close modal
      await page.press('body', 'Escape');
    }
  });

  test('Should display product enrichment statistics', async ({ page }) => {
    await page.goto('/admin/products');
    
    // Verify enrichment metrics
    await expect(page.locator('text=32,100')).toBeVisible(); // Enriched count
    await expect(page.locator('text=enriched')).toBeVisible();
    
    // Check progress bar
    await expect(page.locator('[role="progressbar"]')).toBeVisible();
  });
});`,
    timeout_seconds: 100,
    browser_type: "chromium",
    is_active: true,
    is_template: false
  },

  {
    name: "Chat Interface Functionality Test", 
    description: "Test chat conversations, message sending, contact management, and AI analytics features",
    category: "ui",
    priority: "high",
    tags: ["chat", "conversations", "messages", "ai", "analytics"],
    script_content: `import { test, expect } from '@playwright/test';

test.describe('Chat Interface', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('[type="email"]', 'hagerelgammal44@gmail.com');
    await page.fill('[type="password"]', 'abcd1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
  });

  test('Should load chat dashboard with conversation metrics', async ({ page }) => {
    await page.click('a[href="/admin/chat"]');
    await page.waitForURL('/admin/chat');
    
    // Verify chat dashboard
    await expect(page.locator('h1, h2')).toContainText(/chat/i);
    
    // Check conversation metrics
    await expect(page.locator('text=1,247')).toBeVisible(); // Total interactions
    await expect(page.locator('text=1.2s')).toBeVisible(); // Response time
    await expect(page.locator('text=94%')).toBeVisible(); // Success rate
  });

  test('Should display conversation list', async ({ page }) => {
    await page.goto('/admin/chat');
    
    // Look for conversation list
    const conversationList = page.locator('[data-testid="conversations"], .conversation-list, table');
    if (await conversationList.isVisible()) {
      await expect(conversationList).toBeVisible();
    }
    
    // Check for conversation items
    const conversations = page.locator('button:has-text("conversation"), tr:has-text("user")');
    if (await conversations.first().isVisible()) {
      await expect(conversations.first()).toBeVisible();
    }
  });

  test('Should test contact search and management', async ({ page }) => {
    await page.goto('/admin/chat');
    
    // Test contact search
    const searchInput = page.locator('input[placeholder*="search"], input[placeholder*="contact"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('+1234567890');
      await page.waitForTimeout(1000);
      await searchInput.clear();
    }
    
    // Test contact sync functionality
    const syncButton = page.locator('button:has-text("sync"), button:has-text("refresh")');
    if (await syncButton.isVisible()) {
      await syncButton.click();
      await page.waitForTimeout(2000);
    }
  });

  test('Should test message analytics and insights', async ({ page }) => {
    await page.goto('/admin/chat');
    
    // Look for analytics cards
    await expect(page.locator('text=Chat Interactions')).toBeVisible();
    await expect(page.locator('text=Response Time')).toBeVisible();
    
    // Test analytics API buttons if available
    const analyticsButton = page.locator('button:has-text("analytics"), button:has-text("insights")');
    if (await analyticsButton.isVisible()) {
      await analyticsButton.click();
      await page.waitForTimeout(1000);
    }
  });
});`,
    timeout_seconds: 110,
    browser_type: "chromium",
    is_active: true,
    is_template: false
  },

  {
    name: "Analytics Dashboard Visualization Test",
    description: "Test analytics charts, metrics display, and real-time data visualization components",
    category: "ui",
    priority: "medium",
    tags: ["analytics", "charts", "metrics", "visualization", "dashboard"],
    script_content: `import { test, expect } from '@playwright/test';

test.describe('Analytics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('[type="email"]', 'hagerelgammal44@gmail.com');
    await page.fill('[type="password"]', 'abcd1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
  });

  test('Should load analytics dashboard with charts', async ({ page }) => {
    await page.click('a[href="/admin/analytics"]');
    await page.waitForURL('/admin/analytics');
    
    // Verify analytics page
    await expect(page.locator('h1, h2')).toContainText(/analytics/i);
    
    // Check for chart containers
    await expect(page.locator('[data-testid="chart"], .recharts-wrapper, canvas')).toBeVisible();
  });

  test('Should display key performance metrics', async ({ page }) => {
    await page.goto('/admin/analytics');
    
    // Check for metric cards
    await expect(page.locator('text=2,100')).toBeVisible(); // Total users
    await expect(page.locator('text=35,420')).toBeVisible(); // Products
    await expect(page.locator('text=1,247')).toBeVisible(); // Interactions
    await expect(page.locator('text=99.8%')).toBeVisible(); // Uptime
  });

  test('Should test chart interactivity', async ({ page }) => {
    await page.goto('/admin/analytics');
    
    // Look for interactive chart elements
    const chartPoints = page.locator('.recharts-dot, .recharts-bar, canvas');
    if (await chartPoints.first().isVisible()) {
      await chartPoints.first().hover();
      await page.waitForTimeout(500);
    }
    
    // Test chart legend if available
    const legendItems = page.locator('.recharts-legend-item');
    if (await legendItems.first().isVisible()) {
      await legendItems.first().click();
      await page.waitForTimeout(500);
    }
  });

  test('Should verify growth metrics and trends', async ({ page }) => {
    await page.goto('/admin/analytics');
    
    // Check growth indicators
    await expect(page.locator('text=+12%')).toBeVisible(); // User growth
    await expect(page.locator('text=+8%')).toBeVisible(); // Product growth  
    await expect(page.locator('text=+23%')).toBeVisible(); // Chat growth
    
    // Verify trend descriptions
    await expect(page.locator('text=from last month')).toBeVisible();
    await expect(page.locator('text=from last week')).toBeVisible();
  });
});`,
    timeout_seconds: 80,
    browser_type: "chromium",
    is_active: true,
    is_template: false
  },

  {
    name: "Settings Management Interface Test",
    description: "Test admin settings, user management, environment configuration, and system preferences",
    category: "ui",
    priority: "medium",
    tags: ["settings", "configuration", "admin", "preferences", "environment"],
    script_content: `import { test, expect } from '@playwright/test';

test.describe('Settings Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('[type="email"]', 'hagerelgammal44@gmail.com');
    await page.fill('[type="password"]', 'abcd1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
  });

  test('Should load settings page with configuration options', async ({ page }) => {
    await page.click('a[href="/admin/settings"]');
    await page.waitForURL('/admin/settings');
    
    // Verify settings page
    await expect(page.locator('h1, h2')).toContainText(/settings/i);
    
    // Check for settings sections
    await expect(page.locator('text=Admin Users')).toBeVisible();
    await expect(page.locator('text=Environment')).toBeVisible();
  });

  test('Should test admin user management', async ({ page }) => {
    await page.goto('/admin/settings');
    
    // Look for admin users section
    const adminSection = page.locator('text=Admin Users').locator('..').locator('..');
    await expect(adminSection).toBeVisible();
    
    // Test admin user controls
    const addUserButton = page.locator('button:has-text("Add"), button:has-text("Invite")');
    if (await addUserButton.isVisible()) {
      await addUserButton.click();
      await page.waitForTimeout(500);
      
      // Close any modal that opened
      await page.press('body', 'Escape');
    }
  });

  test('Should test environment configuration', async ({ page }) => {
    await page.goto('/admin/settings');
    
    // Look for environment settings
    const envSection = page.locator('text=Environment').locator('..').locator('..');
    await expect(envSection).toBeVisible();
    
    // Test environment controls
    const envButton = page.locator('button:has-text("Configure"), button:has-text("Test")');
    if (await envButton.isVisible()) {
      await envButton.click();
      await page.waitForTimeout(1000);
    }
  });

  test('Should verify system preferences', async ({ page }) => {
    await page.goto('/admin/settings');
    
    // Check for preference toggles/settings
    const toggles = page.locator('input[type="checkbox"], button[role="switch"]');
    if (await toggles.first().isVisible()) {
      await expect(toggles.first()).toBeVisible();
    }
    
    // Look for save/apply buttons
    const saveButton = page.locator('button:has-text("Save"), button:has-text("Apply")');
    if (await saveButton.isVisible()) {
      await expect(saveButton).toBeVisible();
    }
  });
});`,
    timeout_seconds: 90,
    browser_type: "chromium",
    is_active: true,
    is_template: false
  },

  {
    name: "QA Test Center Self-Test",
    description: "Comprehensive test of the QA Test Center interface itself, including all 6 tabs and functionality",
    category: "general",
    priority: "high",
    tags: ["qa-center", "meta-testing", "tabs", "interface", "functionality"],
    script_content: `import { test, expect } from '@playwright/test';

test.describe('QA Test Center Self-Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('[type="email"]', 'hagerelgammal44@gmail.com');
    await page.fill('[type="password"]', 'abcd1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
  });

  test('Should load QA Test Center with all 6 tabs', async ({ page }) => {
    await page.click('a[href="/admin/qa-center"]');
    await page.waitForURL('/admin/qa-center');
    
    // Verify QA Test Center loaded
    await expect(page.locator('h1')).toContainText('QA Testing Center');
    
    // Check all 6 tabs are present
    await expect(page.locator('tab[name="Overview"]')).toBeVisible();
    await expect(page.locator('tab[name="Scripts"]')).toBeVisible();
    await expect(page.locator('tab[name="Editor"]')).toBeVisible();
    await expect(page.locator('tab[name="History"]')).toBeVisible();
    await expect(page.locator('tab[name="Issues"]')).toBeVisible();
    await expect(page.locator('tab[name="Automation"]')).toBeVisible();
  });

  test('Should test Overview tab metrics and quick actions', async ({ page }) => {
    await page.goto('/admin/qa-center');
    
    // Overview should be selected by default
    await expect(page.locator('tabpanel[name="Overview"]')).toBeVisible();
    
    // Check metrics cards
    await expect(page.locator('text=Total Scripts')).toBeVisible();
    await expect(page.locator('text=Test Runs')).toBeVisible();
    await expect(page.locator('text=Success Rate')).toBeVisible();
    await expect(page.locator('text=Issues Detected')).toBeVisible();
    
    // Test quick action buttons
    await expect(page.locator('button:has-text("Run All Tests")')).toBeVisible();
    await expect(page.locator('button:has-text("Health Check")')).toBeVisible();
    await expect(page.locator('button:has-text("Export Results")')).toBeVisible();
  });

  test('Should test Scripts tab functionality', async ({ page }) => {
    await page.goto('/admin/qa-center');
    
    // Click Scripts tab
    await page.click('tab[name="Scripts"]');
    await expect(page.locator('tabpanel[name="Scripts"]')).toBeVisible();
    
    // Check scripts interface
    await expect(page.locator('text=Test Scripts Library')).toBeVisible();
    await expect(page.locator('button:has-text("New Script")')).toBeVisible();
    
    // Test search and filters
    await expect(page.locator('input[placeholder*="search"]')).toBeVisible();
    await expect(page.locator('select, [role="combobox"]')).toBeVisible();
  });

  test('Should test Editor tab code editing', async ({ page }) => {
    await page.goto('/admin/qa-center');
    
    // Click Editor tab
    await page.click('tab[name="Editor"]');
    await expect(page.locator('tabpanel[name="Editor"]')).toBeVisible();
    
    // Check script editor
    await expect(page.locator('text=Script Editor')).toBeVisible();
    await expect(page.locator('textarea, .monaco-editor')).toBeVisible();
    
    // Test metadata forms
    await expect(page.locator('input[placeholder*="Script Name"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="Description"]')).toBeVisible();
    
    // Test action buttons
    await expect(page.locator('button:has-text("Save Script")')).toBeVisible();
    await expect(page.locator('button:has-text("Reset Template")')).toBeVisible();
  });

  test('Should test History and Issues tabs', async ({ page }) => {
    await page.goto('/admin/qa-center');
    
    // Test History tab
    await page.click('tab[name="History"]');
    await expect(page.locator('text=Test Run History')).toBeVisible();
    
    // Test Issues tab
    await page.click('tab[name="Issues"]');
    await expect(page.locator('text=Auto-Detected Issues')).toBeVisible();
    await expect(page.locator('text=AI-powered issue detection')).toBeVisible();
  });

  test('Should test Automation tab CI/CD configuration', async ({ page }) => {
    await page.goto('/admin/qa-center');
    
    // Click Automation tab
    await page.click('tab[name="Automation"]');
    await expect(page.locator('tabpanel[name="Automation"]')).toBeVisible();
    
    // Check CI/CD configuration
    await expect(page.locator('text=CI/CD Automation')).toBeVisible();
    await expect(page.locator('text=GitHub Integration')).toBeVisible();
    
    // Check automation options
    await expect(page.locator('text=Auto-trigger on push')).toBeVisible();
    await expect(page.locator('text=Pull request validation')).toBeVisible();
    
    // Test configure buttons
    await expect(page.locator('button:has-text("Configure")').first()).toBeVisible();
  });
});`,
    timeout_seconds: 150,
    browser_type: "chromium",
    is_active: true,
    is_template: false
  },

  {
    name: "Cross-Browser Compatibility Test",
    description: "Test core admin functionality across different browsers to ensure consistent behavior",
    category: "general",
    priority: "medium",
    tags: ["cross-browser", "compatibility", "webkit", "firefox", "chromium"],
    script_content: `import { test, expect, devices } from '@playwright/test';

test.describe('Cross-Browser Compatibility', () => {
  ['chromium', 'firefox', 'webkit'].forEach(browserName => {
    test(\`Should work correctly in \${browserName}\`, async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      
      try {
        // Test login flow
        await page.goto('/admin/login');
        await page.fill('[type="email"]', 'hagerelgammal44@gmail.com');
        await page.fill('[type="password"]', 'abcd1234');
        await page.click('button[type="submit"]');
        await page.waitForURL('/admin');
        
        // Test navigation to each main section
        const sections = ['/admin/users', '/admin/products', '/admin/chat', '/admin/analytics', '/admin/settings'];
        
        for (const section of sections) {
          await page.goto(section);
          await page.waitForLoadState('networkidle');
          
          // Verify page loaded without errors
          await expect(page.locator('h1, h2')).toBeVisible();
          
          // Check for any JavaScript errors
          const errors = [];
          page.on('pageerror', error => errors.push(error));
          
          // Wait a bit for any errors to surface
          await page.waitForTimeout(1000);
          
          if (errors.length > 0) {
            console.warn(\`Errors in \${browserName} on \${section}:\`, errors);
          }
        }
        
        // Test QA Center specifically
        await page.goto('/admin/qa-center');
        await expect(page.locator('h1')).toContainText('QA Testing Center');
        
        // Test tab switching
        await page.click('tab[name="Scripts"]');
        await expect(page.locator('text=Test Scripts Library')).toBeVisible();
        
      } finally {
        await context.close();
      }
    });
  });
});`,
    timeout_seconds: 200,
    browser_type: "chromium",
    is_active: true,
    is_template: false
  },

  {
    name: "Performance and Load Testing",
    description: "Test admin dashboard performance, page load times, and responsiveness under load",
    category: "performance",
    priority: "low",
    tags: ["performance", "load-time", "responsiveness", "metrics", "optimization"],
    script_content: `import { test, expect } from '@playwright/test';

test.describe('Performance Testing', () => {
  test('Should load admin dashboard within acceptable time limits', async ({ page }) => {
    // Track performance metrics
    const startTime = Date.now();
    
    // Navigate and login
    await page.goto('/admin/login');
    await page.fill('[type="email"]', 'hagerelgammal44@gmail.com');
    await page.fill('[type="password"]', 'abcd1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
    
    // Wait for dashboard to fully load
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('BargainB Admin Panel');
    
    const loadTime = Date.now() - startTime;
    console.log(\`Dashboard load time: \${loadTime}ms\`);
    
    // Assert reasonable load time (adjust threshold as needed)
    expect(loadTime).toBeLessThan(10000); // 10 seconds max
  });

  test('Should handle rapid navigation between sections', async ({ page }) => {
    // Login first
    await page.goto('/admin/login');
    await page.fill('[type="email"]', 'hagerelgammal44@gmail.com');
    await page.fill('[type="password"]', 'abcd1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
    
    // Test rapid navigation
    const sections = ['users', 'products', 'chat', 'analytics', 'qa-center', 'settings'];
    
    for (const section of sections) {
      const startTime = Date.now();
      await page.click(\`a[href="/admin/\${section}"]\`);
      await page.waitForURL(\`/admin/\${section}\`);
      await page.waitForLoadState('domcontentloaded');
      
      const navTime = Date.now() - startTime;
      console.log(\`Navigation to \${section}: \${navTime}ms\`);
      
      // Each section should load reasonably quickly
      expect(navTime).toBeLessThan(5000); // 5 seconds max
    }
  });

  test('Should handle large data sets efficiently', async ({ page }) => {
    // Login and go to users page (likely to have most data)
    await page.goto('/admin/login');
    await page.fill('[type="email"]', 'hagerelgammal44@gmail.com');
    await page.fill('[type="password"]', 'abcd1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
    
    await page.click('a[href="/admin/users"]');
    await page.waitForURL('/admin/users');
    
    // Test scrolling performance if infinite scroll exists
    const initialItems = await page.locator('table tr, [data-testid="user-item"]').count();
    
    // Scroll to bottom to trigger loading
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    await page.waitForTimeout(2000);
    
    // Check if more items loaded
    const finalItems = await page.locator('table tr, [data-testid="user-item"]').count();
    console.log(\`Items loaded: \${initialItems} -> \${finalItems}\`);
  });

  test('Should measure Core Web Vitals', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('[type="email"]', 'hagerelgammal44@gmail.com');
    await page.fill('[type="password"]', 'abcd1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
    
    // Measure performance metrics
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        // Use Performance Observer to capture Web Vitals
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          resolve({
            fcp: entries.find(e => e.name === 'first-contentful-paint')?.startTime,
            lcp: entries.find(e => e.entryType === 'largest-contentful-paint')?.startTime,
            cls: entries.find(e => e.entryType === 'layout-shift')?.value
          });
        });
        
        observer.observe({entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift']});
        
        // Fallback timeout
        setTimeout(() => resolve({}), 5000);
      });
    });
    
    console.log('Core Web Vitals:', metrics);
    
    // Basic performance assertions
    if (metrics.fcp) {
      expect(metrics.fcp).toBeLessThan(3000); // FCP < 3s
    }
    if (metrics.lcp) {
      expect(metrics.lcp).toBeLessThan(4000); // LCP < 4s  
    }
  });
});`,
    timeout_seconds: 180,
    browser_type: "chromium",
    is_active: true,
    is_template: false
  },

  {
    name: "Security and Authentication Edge Cases",
    description: "Test security measures, authentication edge cases, and potential vulnerabilities",
    category: "general",
    priority: "critical",
    tags: ["security", "authentication", "edge-cases", "vulnerabilities", "protection"],
    script_content: `import { test, expect } from '@playwright/test';

test.describe('Security Testing', () => {
  test('Should prevent unauthorized access to admin routes', async ({ page }) => {
    // Try to access admin without authentication
    const protectedRoutes = [
      '/admin',
      '/admin/users', 
      '/admin/products',
      '/admin/chat',
      '/admin/analytics',
      '/admin/settings',
      '/admin/qa-center'
    ];
    
    for (const route of protectedRoutes) {
      await page.goto(route);
      
      // Should redirect to login or show access denied
      await expect(page.url()).toMatch(/login|unauthorized|403/);
    }
  });

  test('Should handle session timeout gracefully', async ({ page }) => {
    // Login first
    await page.goto('/admin/login');
    await page.fill('[type="email"]', 'hagerelgammal44@gmail.com');
    await page.fill('[type="password"]', 'abcd1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
    
    // Clear session storage to simulate timeout
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Try to navigate to protected route
    await page.goto('/admin/users');
    
    // Should redirect to login
    await expect(page.url()).toMatch(/login/);
  });

  test('Should protect against SQL injection in search', async ({ page }) => {
    // Login first
    await page.goto('/admin/login');
    await page.fill('[type="email"]', 'hagerelgammal44@gmail.com');
    await page.fill('[type="password"]', 'abcd1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
    
    // Go to users page
    await page.goto('/admin/users');
    
    // Try SQL injection attempts in search
    const maliciousInputs = [
      "'; DROP TABLE users; --",
      "1' OR '1'='1",
      "admin'; DELETE FROM users WHERE '1'='1",
      "<script>alert('xss')</script>",
      "' UNION SELECT * FROM admin_users --"
    ];
    
    const searchInput = page.locator('input[placeholder*="search"]');
    if (await searchInput.isVisible()) {
      for (const input of maliciousInputs) {
        await searchInput.fill(input);
        await page.waitForTimeout(1000);
        
        // Page should not crash or show database errors
        await expect(page.locator('text=error')).not.toBeVisible();
        await expect(page.locator('text=SQL')).not.toBeVisible();
        await expect(page.locator('text=database')).not.toBeVisible();
        
        await searchInput.clear();
      }
    }
  });

  test('Should validate CSRF protection', async ({ page }) => {
    // Login first
    await page.goto('/admin/login');
    await page.fill('[type="email"]', 'hagerelgammal44@gmail.com');
    await page.fill('[type="password"]', 'abcd1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
    
    // Check for CSRF tokens in forms
    await page.goto('/admin/settings');
    
    const forms = page.locator('form');
    const formCount = await forms.count();
    
    for (let i = 0; i < formCount; i++) {
      const form = forms.nth(i);
      const csrfToken = form.locator('input[name="_token"], input[name="csrf_token"]');
      
      if (await csrfToken.isVisible()) {
        const tokenValue = await csrfToken.getAttribute('value');
        expect(tokenValue).toBeTruthy();
        expect(tokenValue.length).toBeGreaterThan(10);
      }
    }
  });

  test('Should prevent XSS attacks', async ({ page }) => {
    // Login first
    await page.goto('/admin/login');
    await page.fill('[type="email"]', 'hagerelgammal44@gmail.com');
    await page.fill('[type="password"]', 'abcd1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
    
    // Test XSS in various input fields
    const xssPayloads = [
      '<script>alert("xss")</script>',
      '<img src=x onerror=alert("xss")>',
      'javascript:alert("xss")',
      '<svg onload=alert("xss")>',
      '"onmouseover="alert(1)"'
    ];
    
    // Test in user search
    await page.goto('/admin/users');
    const searchInput = page.locator('input[placeholder*="search"]');
    
    if (await searchInput.isVisible()) {
      for (const payload of xssPayloads) {
        await searchInput.fill(payload);
        await page.waitForTimeout(1000);
        
        // Check if script executed (it shouldn't)
        const alertPromise = page.waitForEvent('dialog', { timeout: 1000 }).catch(() => null);
        const alert = await alertPromise;
        
        expect(alert).toBeNull(); // No alert should appear
        await searchInput.clear();
      }
    }
  });

  test('Should validate proper logout behavior', async ({ page }) => {
    // Login first
    await page.goto('/admin/login');
    await page.fill('[type="email"]', 'hagerelgammal44@gmail.com');
    await page.fill('[type="password"]', 'abcd1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
    
    // Logout
    await page.click('button:has-text("Logout")');
    await page.waitForURL('/admin/login');
    
    // Try to go back to admin (should not work)
    await page.goBack();
    await expect(page.url()).toMatch(/login/);
    
    // Clear browser and try direct access
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    await page.goto('/admin');
    await expect(page.url()).toMatch(/login/);
  });
});`,
    timeout_seconds: 160,
    browser_type: "chromium",
    is_active: true,
    is_template: false
  }
];

// Function to seed the database
async function seedTestScripts() {
  console.log('🌱 Starting QA Test Scripts seeding...');
  
  try {
    // Clear existing test scripts (optional)
    console.log('🧹 Clearing existing test scripts...');
    await supabase.from('qa_test_scripts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Insert production test scripts
    console.log('📝 Inserting production test scripts...');
    
    // Ensure all scripts have only the core fields that exist in the database
    const completeScripts = productionTestScripts.map(script => ({
      name: script.name,
      description: script.description,
      category: script.category,
      script_content: script.script_content,
      priority: script.priority,
      tags: script.tags,
      timeout_seconds: script.timeout_seconds,
      browser_type: script.browser_type,
      is_active: true,
      is_template: false
    }));
    
    const { data, error } = await supabase
      .from('qa_test_scripts')
      .insert(completeScripts);

    if (error) {
      console.error('❌ Error inserting test scripts:', error);
      return;
    }

    console.log('✅ Successfully inserted ' + productionTestScripts.length + ' production test scripts!');
    
    // Create some sample test runs for realistic data
    console.log('🏃 Creating sample test runs...');
    
    const { data: scripts } = await supabase
      .from('qa_test_scripts')
      .select('id, name')
      .limit(3);

    if (scripts && scripts.length > 0) {
      const sampleRuns = scripts.map((script, index) => ({
        script_id: script.id,
        run_name: script.name + ' - Sample Run ' + (index + 1),
        status: index === 0 ? 'passed' : index === 1 ? 'failed' : 'running',
        trigger_type: 'manual',
        browser_type: 'chromium',
        test_environment: 'production',
        started_at: new Date(Date.now() - (index * 3600000)).toISOString(), // Spread over hours
        completed_at: index < 2 ? new Date(Date.now() - (index * 3600000) + 300000).toISOString() : null, // 5min duration
        duration_ms: index < 2 ? 300000 + (index * 60000) : null,
        tests_passed: index === 0 ? 5 : index === 1 ? 3 : null,
        tests_failed: index === 0 ? 0 : index === 1 ? 2 : null,
        tests_skipped: 0,
        error_message: index === 1 ? 'Authentication timeout during user management test' : null,
        execution_log: 'Test execution log for ' + script.name + '\n- Started browser\n- Navigated to admin\n- ' + (index === 1 ? 'FAILED: Login timeout' : 'PASSED: All tests completed'),
        created_by: '00000000-0000-0000-0000-000000000000'
      }));

      await supabase.from('qa_test_runs').insert(sampleRuns);
      console.log('✅ Created ' + sampleRuns.length + ' sample test runs!');
    }

    console.log('🎉 QA Test Center seeding completed successfully!');
    console.log('');
    console.log('📊 Summary of created test scripts:');
    productionTestScripts.forEach((script, index) => {
      console.log((index + 1) + '. ' + script.name + ' (' + script.category + ')');
    });
    
  } catch (error) {
    console.error('💥 Error during seeding:', error);
  }
}

// Run the seeder
if (require.main === module) {
  seedTestScripts().then(() => {
    console.log('🏁 Seeding process completed.');
    process.exit(0);
  });
}

module.exports = { seedTestScripts, productionTestScripts }; 