'use client'

import { useEffect } from 'react'
import { Memo, MemoSummary } from '@/types/memo'
import { useSummary } from '@/hooks/useSummary'
import { MIN_SUMMARY_LENGTH } from '@/utils/summaryApi'
import MarkdownRenderer from './MarkdownRenderer'

interface SummarySectionProps {
  memo: Memo
  onSummaryChange: (id: string, summary: MemoSummary | null) => void
}

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export default function SummarySection({
  memo,
  onSummaryChange,
}: SummarySectionProps) {
  const { status, error, generate, reset } = useSummary(onSummaryChange)

  // 다른 메모로 바뀌면 로딩/에러 상태 초기화
  useEffect(() => {
    reset()
  }, [memo.id, reset])

  const summary = memo.summary
  const isLoading = status === 'loading'
  const isTooShort = memo.content.trim().length < MIN_SUMMARY_LENGTH
  const isStale = summary !== undefined && summary.sourceUpdatedAt !== memo.updatedAt

  const handleGenerate = () => {
    void generate(memo)
  }

  const primaryButtonClass =
    'px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600'
  const secondaryButtonClass =
    'px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

  return (
    <section
      className="px-6 py-4 border-b border-gray-200 bg-gray-50"
      aria-label="AI 요약"
      data-testid="summary-section"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-gray-900">✨ AI 요약</p>
        <div className="flex items-center gap-2">
          {summary ? (
            <>
              <button
                onClick={handleGenerate}
                disabled={isLoading || isTooShort}
                aria-label="다시 요약"
                data-testid="resummarize-btn"
                className={secondaryButtonClass}
              >
                다시 요약
              </button>
              <button
                onClick={() => onSummaryChange(memo.id, null)}
                disabled={isLoading}
                aria-label="요약 삭제"
                data-testid="delete-summary-btn"
                className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                요약 삭제
              </button>
            </>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={isLoading || isTooShort}
              aria-label="AI 요약"
              data-testid="summarize-btn"
              className={primaryButtonClass}
            >
              AI 요약
            </button>
          )}
        </div>
      </div>

      {isTooShort && !summary && (
        <p className="mt-2 text-xs text-gray-500">
          메모 내용이 너무 짧아 요약할 수 없습니다. ({MIN_SUMMARY_LENGTH}자 이상)
        </p>
      )}

      {isLoading && (
        <div
          className="mt-3 flex items-center gap-2 text-sm text-gray-600"
          data-testid="summary-loading"
        >
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
          요약 중...
        </div>
      )}

      {status === 'error' && error && (
        <div
          role="alert"
          className="mt-3 flex items-center justify-between gap-3 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg"
          data-testid="summary-error"
        >
          <span>{error}</span>
          <button
            onClick={handleGenerate}
            aria-label="재시도"
            data-testid="summary-retry-btn"
            className="px-3 py-1 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-100 transition-colors"
          >
            재시도
          </button>
        </div>
      )}

      {summary && (
        <div className="mt-3">
          {isStale && (
            <p
              className="mb-2 px-2 py-1 inline-block text-xs font-medium text-amber-800 bg-amber-100 rounded-md"
              data-testid="summary-stale-badge"
            >
              메모가 수정되었습니다. 다시 요약해 보세요
            </p>
          )}
          <div data-testid="summary-text">
            <MarkdownRenderer content={summary.text} />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            요약 생성: {formatDate(summary.generatedAt)}
          </p>
        </div>
      )}
    </section>
  )
}
