import { test, expect } from '@playwright/test'

const MARKDOWN =
  '# 제목\n\n**굵게** 와 ~~취소~~\n\n- [x] 완료\n- 항목\n\n| a | b |\n|---|---|\n| 1 | 2 |'

test.describe('마크다운 에디터', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('memo-card').first()).toBeVisible()
  })

  test('작성 중 실시간 미리보기가 표시된다', async ({ page }) => {
    await page.getByRole('button', { name: '새 메모' }).click()
    await page.locator('#content').fill(MARKDOWN)

    await expect(page.locator('.w-md-editor-preview h1')).toHaveText('제목')
  })

  test('에디터 미리보기와 뷰어에서 목록 기호가 표시된다', async ({ page }) => {
    await page.getByRole('button', { name: '새 메모' }).click()
    await page.locator('#title').fill('목록 테스트')
    await page.locator('#content').fill('- 하나\n- 둘\n\n1. 첫째\n2. 둘째')

    const preview = page.locator('.w-md-editor-preview')
    await expect(preview.locator('ul')).toHaveCSS('list-style-type', 'disc')
    await expect(preview.locator('ol')).toHaveCSS('list-style-type', 'decimal')

    await page.getByRole('button', { name: '저장하기' }).click()
    await page
      .getByTestId('memo-card')
      .filter({ hasText: '목록 테스트' })
      .click()

    const content = page.getByTestId('markdown-content')
    await expect(content.locator('ul')).toHaveCSS('list-style-type', 'disc')
    await expect(content.locator('ol')).toHaveCSS('list-style-type', 'decimal')
  })

  test('저장 후 상세 뷰어에서 마크다운이 렌더링된다', async ({ page }) => {
    await page.getByRole('button', { name: '새 메모' }).click()
    await page.locator('#title').fill('마크다운 테스트')
    await page.locator('#content').fill(MARKDOWN)
    await page.getByRole('button', { name: '저장하기' }).click()

    await page
      .getByTestId('memo-card')
      .filter({ hasText: '마크다운 테스트' })
      .click()

    const content = page.getByTestId('markdown-content')
    await expect(content.locator('h1')).toHaveText('제목')
    await expect(content.locator('strong')).toHaveText('굵게')
    await expect(content.locator('del')).toHaveText('취소')
    await expect(content.locator('table')).toBeVisible()
  })

  test('카드 미리보기에는 마크다운 기호가 노출되지 않는다', async ({
    page,
  }) => {
    await page.getByRole('button', { name: '새 메모' }).click()
    await page.locator('#title').fill('기호 테스트')
    await page.locator('#content').fill(MARKDOWN)
    await page.getByRole('button', { name: '저장하기' }).click()

    const preview = page
      .getByTestId('memo-card')
      .filter({ hasText: '기호 테스트' })
      .locator('p')
    await expect(preview).not.toContainText('#')
    await expect(preview).not.toContainText('**')
    await expect(preview).not.toContainText('---')
    await expect(preview).toContainText('굵게')
  })

  test('편집 시 마크다운 원문이 복원된다', async ({ page }) => {
    await page.getByRole('button', { name: '새 메모' }).click()
    await page.locator('#title').fill('복원 테스트')
    await page.locator('#content').fill(MARKDOWN)
    await page.getByRole('button', { name: '저장하기' }).click()

    await page
      .getByTestId('memo-card')
      .filter({ hasText: '복원 테스트' })
      .click()
    await page.getByTestId('viewer-edit-btn').click()

    await expect(page.locator('#content')).toHaveValue(MARKDOWN)
  })
})
