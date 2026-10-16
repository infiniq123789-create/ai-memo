'use client'

import { useState, useCallback } from 'react'
import { Memo, MemoSummary } from '@/types/memo'
import { requestSummary } from '@/utils/summaryApi'

type SummaryStatus = 'idle' | 'loading' | 'error'

export const useSummary = (
  onSaved: (id: string, summary: MemoSummary) => void
) => {
  const [status, setStatus] = useState<SummaryStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(
    async (memo: Memo): Promise<void> => {
      setStatus('loading')
      setError(null)
      try {
        const text = await requestSummary(memo.content, memo.title)
        onSaved(memo.id, {
          text,
          generatedAt: new Date().toISOString(),
          sourceUpdatedAt: memo.updatedAt,
        })
        setStatus('idle')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'AI 요약에 실패했습니다.')
        setStatus('error')
      }
    },
    [onSaved]
  )

  const reset = useCallback(() => {
    setStatus('idle')
    setError(null)
  }, [])

  return { status, error, generate, reset }
}
