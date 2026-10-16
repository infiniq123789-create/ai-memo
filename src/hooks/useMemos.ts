'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Memo, MemoFormData, MemoSummary } from '@/types/memo'
import {
  getMemosAction,
  createMemoAction,
  updateMemoAction,
  updateMemoSummaryAction,
  deleteMemoAction,
  clearMemosAction,
} from '@/app/actions/memoActions'

const toMessage = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback

export const useMemos = () => {
  const [memos, setMemos] = useState<Memo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // 메모 로드
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const loadedMemos = await getMemosAction()
        if (!cancelled) setMemos(loadedMemos)
      } catch (e) {
        console.error('Failed to load memos:', e)
        if (!cancelled) setError(toMessage(e, '메모를 불러오지 못했습니다.'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  // 메모 생성 (실패 시 undefined)
  const createMemo = useCallback(
    async (formData: MemoFormData): Promise<Memo | undefined> => {
      try {
        const newMemo = await createMemoAction(formData)
        setMemos(prev => [newMemo, ...prev])
        setError(null)
        return newMemo
      } catch (e) {
        console.error('Failed to create memo:', e)
        setError(toMessage(e, '메모를 저장하지 못했습니다.'))
        return undefined
      }
    },
    []
  )

  // 메모 업데이트 (실패 시 undefined)
  const updateMemo = useCallback(
    async (id: string, formData: MemoFormData): Promise<Memo | undefined> => {
      try {
        const updatedMemo = await updateMemoAction(id, formData)
        setMemos(prev =>
          prev.map(memo => (memo.id === id ? updatedMemo : memo))
        )
        setError(null)
        return updatedMemo
      } catch (e) {
        console.error('Failed to update memo:', e)
        setError(toMessage(e, '메모를 수정하지 못했습니다.'))
        return undefined
      }
    },
    []
  )

  // 요약 저장/삭제 (updatedAt은 갱신하지 않음)
  const updateMemoSummary = useCallback(
    async (
      id: string,
      summary: MemoSummary | null
    ): Promise<Memo | undefined> => {
      try {
        const updatedMemo = await updateMemoSummaryAction(id, summary)
        setMemos(prev =>
          prev.map(memo => (memo.id === id ? updatedMemo : memo))
        )
        setError(null)
        return updatedMemo
      } catch (e) {
        console.error('Failed to update summary:', e)
        setError(toMessage(e, '요약을 저장하지 못했습니다.'))
        return undefined
      }
    },
    []
  )

  // 메모 삭제
  const deleteMemo = useCallback(async (id: string): Promise<void> => {
    try {
      await deleteMemoAction(id)
      setMemos(prev => prev.filter(memo => memo.id !== id))
      setError(null)
    } catch (e) {
      console.error('Failed to delete memo:', e)
      setError(toMessage(e, '메모를 삭제하지 못했습니다.'))
    }
  }, [])

  // 메모 검색
  const searchMemos = useCallback((query: string): void => {
    setSearchQuery(query)
  }, [])

  // 카테고리 필터링
  const filterByCategory = useCallback((category: string): void => {
    setSelectedCategory(category)
  }, [])

  // 특정 메모 가져오기
  const getMemoById = useCallback(
    (id: string): Memo | undefined => {
      return memos.find(memo => memo.id === id)
    },
    [memos]
  )

  // 필터링된 메모 목록
  const filteredMemos = useMemo(() => {
    let filtered = memos

    // 카테고리 필터링
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(memo => memo.category === selectedCategory)
    }

    // 검색 필터링
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        memo =>
          memo.title.toLowerCase().includes(query) ||
          memo.content.toLowerCase().includes(query) ||
          memo.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    return filtered
  }, [memos, selectedCategory, searchQuery])

  // 모든 메모 삭제
  const clearAllMemos = useCallback(async (): Promise<void> => {
    try {
      await clearMemosAction()
      setMemos([])
      setSearchQuery('')
      setSelectedCategory('all')
      setError(null)
    } catch (e) {
      console.error('Failed to clear memos:', e)
      setError(toMessage(e, '메모를 모두 삭제하지 못했습니다.'))
    }
  }, [])

  // 통계 정보
  const stats = useMemo(() => {
    const totalMemos = memos.length
    const categoryCounts = memos.reduce(
      (acc, memo) => {
        acc[memo.category] = (acc[memo.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return {
      total: totalMemos,
      byCategory: categoryCounts,
      filtered: filteredMemos.length,
    }
  }, [memos, filteredMemos])

  return {
    // 상태
    memos: filteredMemos,
    allMemos: memos,
    loading,
    error,
    searchQuery,
    selectedCategory,
    stats,

    // 메모 CRUD
    createMemo,
    updateMemo,
    updateMemoSummary,
    deleteMemo,
    getMemoById,

    // 필터링 & 검색
    searchMemos,
    filterByCategory,

    // 유틸리티
    clearAllMemos,
    clearError,
  }
}
