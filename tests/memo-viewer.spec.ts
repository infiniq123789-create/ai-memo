import { test, expect } from '@playwright/test'

test.describe('메모 상세 보기 뷰어', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('memo-card').first()).toBeVisible()
  })

  test('카드 클릭 시 상세 모달이 열리고 내용이 표시된다', async ({ page }) => {
    const card = page.getByTestId('memo-card').first()
    const title = await card.locator('h3').innerText()

    await card.click()

    const viewer = page.getByTestId('memo-viewer')
    await expect(viewer).toBeVisible()
    await expect(viewer.getByRole('heading', { name: title })).toBeVisible()
    await expect(viewer.getByTestId('viewer-edit-btn')).toBeVisible()
    await expect(viewer.getByTestId('viewer-delete-btn')).toBeVisible()
  })

  test('ESC 키로 모달이 닫힌다', async ({ page }) => {
    await page.getByTestId('memo-card').first().click()
    await expect(page.getByTestId('memo-viewer')).toBeVisible()

    await page.keyboard.press('Escape')

    await expect(page.getByTestId('memo-viewer')).toBeHidden()
  })

  test('배경 클릭 시 닫히고 모달 내부 클릭 시에는 유지된다', async ({
    page,
  }) => {
    await page.getByTestId('memo-card').first().click()
    const viewer = page.getByTestId('memo-viewer')

    await viewer.getByRole('heading').click()
    await expect(viewer).toBeVisible()

    await page
      .getByTestId('memo-viewer-backdrop')
      .click({ position: { x: 5, y: 5 } })
    await expect(viewer).toBeHidden()
  })

  test('닫기 버튼으로 모달이 닫힌다', async ({ page }) => {
    await page.getByTestId('memo-card').first().click()

    await page.getByTestId('close-viewer-btn').click()

    await expect(page.getByTestId('memo-viewer')).toBeHidden()
  })

  test('편집 버튼 클릭 시 모달이 닫히고 편집 폼이 열린다', async ({ page }) => {
    const card = page.getByTestId('memo-card').first()
    const title = await card.locator('h3').innerText()

    await card.click()
    await page.getByTestId('viewer-edit-btn').click()

    await expect(page.getByTestId('memo-viewer')).toBeHidden()
    await expect(page.locator('form input').first()).toHaveValue(title)
  })

  test('삭제 확인창을 취소하면 메모와 모달이 유지된다', async ({ page }) => {
    const cards = page.getByTestId('memo-card')
    const before = await cards.count()

    await cards.first().click()
    page.once('dialog', dialog => dialog.dismiss())
    await page.getByTestId('viewer-delete-btn').click()

    await expect(page.getByTestId('memo-viewer')).toBeVisible()
    await expect(cards).toHaveCount(before)
  })

  test('삭제 확인창을 승인하면 메모가 삭제되고 모달이 닫힌다', async ({
    page,
  }) => {
    const cards = page.getByTestId('memo-card')
    const before = await cards.count()

    await cards.first().click()
    page.once('dialog', dialog => dialog.accept())
    await page.getByTestId('viewer-delete-btn').click()

    await expect(page.getByTestId('memo-viewer')).toBeHidden()
    await expect(cards).toHaveCount(before - 1)
  })

  test('카드의 편집 아이콘 클릭 시 상세 모달은 열리지 않는다', async ({
    page,
  }) => {
    await page.getByTestId('memo-card').first().getByTitle('편집').click()

    await expect(page.getByTestId('memo-viewer')).toBeHidden()
    await expect(page.locator('form')).toBeVisible()
  })
})
