'use client'

import { useState, useCallback } from 'react'
import { useMemos } from '@/hooks/useMemos'
import { Memo, MemoFormData, MemoSummary } from '@/types/memo'
import MemoList from '@/components/MemoList'
import MemoForm from '@/components/MemoForm'
import MemoViewer from '@/components/MemoViewer'

export default function Home() {
  const {
    memos,
    loading,
    error,
    clearError,
    searchQuery,
    selectedCategory,
    stats,
    createMemo,
    updateMemo,
    updateMemoSummary,
    deleteMemo,
    searchMemos,
    filterByCategory,
  } = useMemos()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingMemo, setEditingMemo] = useState<Memo | null>(null)
  const [viewingMemo, setViewingMemo] = useState<Memo | null>(null)

  // 저장 성공 시에만 폼을 닫아 실패 시 입력 내용을 보존
  const handleCreateMemo = async (formData: MemoFormData) => {
    const created = await createMemo(formData)
    if (created) setIsFormOpen(false)
  }

  const handleUpdateMemo = async (formData: MemoFormData) => {
    if (!editingMemo) return
    const updated = await updateMemo(editingMemo.id, formData)
    if (updated) {
      setEditingMemo(null)
      setIsFormOpen(false)
    }
  }

  const handleEditMemo = (memo: Memo) => {
    setEditingMemo(memo)
    setIsFormOpen(true)
  }

  const handleViewMemo = (memo: Memo) => {
    setViewingMemo(memo)
  }

  const handleCloseViewer = useCallback(() => {
    setViewingMemo(null)
  }, [])

  const handleSummaryChange = useCallback(
    async (id: string, summary: MemoSummary | null) => {
      const updated = await updateMemoSummary(id, summary)
      if (updated) setViewingMemo(updated)
    },
    [updateMemoSummary]
  )

  const handleEditFromViewer =(memo: Memo) => {
    setViewingMemo(null)
    handleEditMemo(memo)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingMemo(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">📝 우람이</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                새 메모
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div
            role="alert"
            data-testid="error-banner"
            className="mb-4 flex items-center justify-between gap-3 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg"
          >
            <span>{error}</span>
            <button
              onClick={clearError}
              aria-label="오류 닫기"
              className="px-3 py-1 font-medium border border-red-300 rounded-lg hover:bg-red-100 transition-colors"
            >
              닫기
            </button>
          </div>
        )}
        <MemoList
          memos={memos}
          loading={loading}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          onSearchChange={searchMemos}
          onCategoryChange={filterByCategory}
          onEditMemo={handleEditMemo}
          onDeleteMemo={deleteMemo}
          onViewMemo={handleViewMemo}
          stats={stats}
        />
      </main>

      {/* 상세 보기 모달 */}
      <MemoViewer
        memo={viewingMemo}
        onClose={handleCloseViewer}
        onEdit={handleEditFromViewer}
        onDelete={deleteMemo}
        onSummaryChange={handleSummaryChange}
      />

      {/* 모달 폼 */}
      <MemoForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingMemo ? handleUpdateMemo : handleCreateMemo}
        editingMemo={editingMemo}
      />
    </div>
  )
}
