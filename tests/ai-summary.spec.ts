import { test, expect, Page } from '@playwright/test'

const now = '2025-01-01T00:00:00.000Z'

const seedMemos = [
  {
    id: 'long-memo',
    title: '긴 메모',
    content:
      '이번 주 프로젝트 회의에서 일정과 담당자를 정리했다. 다음 주까지 API 설계를 마무리해야 한다.',
    category: 'work',
    tags: [],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'short-memo',
    title: '짧은 메모',
    content: '우유 사기',
    category: 'personal',
    tags: [],
    createdAt: now,
    updatedAt: now,
  },
]

const MOCK_SUMMARY = '- 일정과 담당자 정리\n- API 설계 마무리 필요'

const mockSummarize = async (page: Page, delayMs = 0) => {
  await page.route('**/api/summarize', async route => {
    if (delayMs) await new Promise(resolve => setTimeout(resolve, delayMs))
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ summary: MOCK_SUMMARY }),
    })
  })
}

const openMemo = async (page: Page, title: string) => {
  await page.getByTestId('memo-card').filter({ hasText: title }).click()
  await expect(page.getByTestId('memo-viewer')).toBeVisible()
}

test.describe('메모 AI 요약', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(memos => {
      if (!localStorage.getItem('memo-app-memos')) {
        localStorage.setItem('memo-app-memos', JSON.stringify(memos))
      }
    }, seedMemos)
    await page.goto('/')
    await expect(page.getByTestId('memo-card').first()).toBeVisible()
  })

  test('요약을 생성하면 표시되고 새로고침 후에도 유지된다', async ({ page }) => {
    await mockSummarize(page)
    await openMemo(page, '긴 메모')

    await page.getByTestId('summarize-btn').click()
    await expect(page.getByTestId('summary-text')).toContainText(
      'API 설계 마무리 필요'
    )
    await expect(page.getByTestId('summary-stale-badge')).toBeHidden()

    await page.reload()
    await openMemo(page, '긴 메모')
    await expect(page.getByTestId('summary-text')).toContainText(
      'API 설계 마무리 필요'
    )
  })

  test('요약 후 메모를 수정하면 오래됨 안내가 표시되고 다시 요약하면 사라진다', async ({
    page,
  }) => {
    await mockSummarize(page)
    await openMemo(page, '긴 메모')
    await page.getByTestId('summarize-btn').click()
    await expect(page.getByTestId('summary-text')).toBeVisible()

    await page.getByTestId('viewer-edit-btn').click()
    await page.locator('#title').fill('긴 메모 수정')
    await page.getByRole('button', { name: '수정하기' }).click()

    await openMemo(page, '긴 메모 수정')
    await expect(page.getByTestId('summary-stale-badge')).toBeVisible()

    await page.getByTestId('resummarize-btn').click()
    await expect(page.getByTestId('summary-stale-badge')).toBeHidden()
    await expect(page.getByTestId('summary-text')).toBeVisible()
  })

  test('요약을 삭제할 수 있다', async ({ page }) => {
    await mockSummarize(page)
    await openMemo(page, '긴 메모')
    await page.getByTestId('summarize-btn').click()
    await expect(page.getByTestId('summary-text')).toBeVisible()

    await page.getByTestId('delete-summary-btn').click()

    await expect(page.getByTestId('summary-text')).toBeHidden()
    await expect(page.getByTestId('summarize-btn')).toBeVisible()
  })

  test('API 오류 시 에러가 표시되고 재시도할 수 있다', async ({ page }) => {
    let calls = 0
    await page.route('**/api/summarize', async route => {
      calls += 1
      if (calls === 1) {
        await route.fulfill({
          status: 502,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'AI 요약 중 오류가 발생했습니다.' }),
        })
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ summary: MOCK_SUMMARY }),
        })
      }
    })
    await openMemo(page, '긴 메모')

    await page.getByTestId('summarize-btn').click()
    await expect(page.getByTestId('summary-error')).toContainText(
      'AI 요약 중 오류가 발생했습니다.'
    )

    await page.getByTestId('summary-retry-btn').click()
    await expect(page.getByTestId('summary-text')).toBeVisible()
    await expect(page.getByTestId('summary-error')).toBeHidden()
  })

  test('요약 중에는 로딩이 표시되고 버튼이 비활성화된다', async ({ page }) => {
    await mockSummarize(page, 800)
    await openMemo(page, '긴 메모')

    await page.getByTestId('summarize-btn').click()
    await expect(page.getByTestId('summary-loading')).toBeVisible()
    await expect(page.getByTestId('summarize-btn')).toBeDisabled()

    await expect(page.getByTestId('summary-text')).toBeVisible()
  })

  test('내용이 너무 짧은 메모는 요약 버튼이 비활성화된다', async ({ page }) => {
    await openMemo(page, '짧은 메모')

    await expect(page.getByTestId('summarize-btn')).toBeDisabled()
  })
})
