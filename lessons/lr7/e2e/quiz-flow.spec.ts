import { test, expect } from '@playwright/test';

test.describe('Quiz Application E2E', () => {
  test('has correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Quiz/);
  });

  test('displays start button on main page', async ({ page }) => {
    await page.goto('/');
    const startButton = page.locator('button').filter({ hasText: /начать/i });
    await expect(startButton).toBeVisible();
  });

  test('shows quiz progress after starting', async ({ page }) => {
    await page.goto('/');
    
    // Нажать кнопку начала игры
    const startButton = page.locator('button').filter({ hasText: /начать/i });
    await startButton.click();
    
    // Проверить наличие прогресс-бара
    const progress = page.locator('[class*="progress"], [class*="Progress"]');
    await expect(progress).toBeVisible();
  });

  test('displays question text', async ({ page }) => {
    await page.goto('/');
    
    const startButton = page.locator('button').filter({ hasText: /начать/i });
    await startButton.click();
    
    // Проверить наличие текста вопроса
    const questionText = page.locator('h2, [class*="question"]');
    await expect(questionText).toBeVisible();
  });

  test('allows selecting answers for multiple choice', async ({ page }) => {
    await page.goto('/');
    
    const startButton = page.locator('button').filter({ hasText: /начать/i });
    await startButton.click();
    
    // Найти кнопки с вариантами ответов
    const optionButtons = page.locator('button').filter({ hasText: /^[A-D]/ });
    if (await optionButtons.count() > 0) {
      await optionButtons.first().click();
      
      // Проверить, что кнопка выбрана (есть галочка или изменен стиль)
      const selectedButton = optionButtons.first();
      await expect(selectedButton).toContainText('✓');
    }
  });

  test('allows typing in essay textarea', async ({ page }) => {
    await page.goto('/');
    
    const startButton = page.locator('button').filter({ hasText: /начать/i });
    await startButton.click();
    
    // Найти textarea для эссе
    const textarea = page.locator('textarea');
    if (await textarea.count() > 0) {
      await textarea.fill('Это тестовый ответ на вопрос эссе.');
      await expect(textarea).toHaveValue('Это тестовый ответ на вопрос эссе.');
    }
  });

  test('shows character count for essay', async ({ page }) => {
    await page.goto('/');
    
    const startButton = page.locator('button').filter({ hasText: /начать/i });
    await startButton.click();
    
    const textarea = page.locator('textarea');
    if (await textarea.count() > 0) {
      await textarea.fill('Тест');
      
      // Проверить счетчик символов
      const charCount = page.locator('text=/Символов:/');
      await expect(charCount).toBeVisible();
    }
  });
});