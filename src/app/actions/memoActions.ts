'use server'

import { v4 as uuidv4 } from 'uuid'
import { Memo, MemoFormData, MemoSummary } from '@/types/memo'
import { createSupabaseClient } from '@/utils/supabase'

const TABLE = 'memos'

// DB 행 (snake_case)
interface MemoRow {
  id: string
  title: string
  content: string
  category: string
  tags: string[] | null
  created_at: string
  updated_at: string
  summary: MemoSummary | null
}

// timestamptz 문자열을 ISO 형식으로 정규화 (요약의 sourceUpdatedAt 비교용)
const toIso = (value: string): string => new Date(value).toISOString()

const toMemo = (row: MemoRow): Memo => {
  const memo: Memo = {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category,
    tags: row.tags ?? [],
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  }
  if (row.summary) memo.summary = row.summary
  return memo
}

// 메모 전체 조회 (최신순)
export async function getMemosAction(): Promise<Memo[]> {
  const { data, error } = await createSupabaseClient()
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch memos:', error.message)
    throw new Error('메모를 불러오지 못했습니다.')
  }
  return (data as MemoRow[]).map(toMemo)
}

// 메모 생성
export async function createMemoAction(formData: MemoFormData): Promise<Memo> {
  const now = new Date().toISOString()
  const { data, error } = await createSupabaseClient()
    .from(TABLE)
    .insert({
      id: uuidv4(),
      title: formData.title,
      content: formData.content,
      category: formData.category,
      tags: formData.tags,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to create memo:', error.message)
    throw new Error('메모를 저장하지 못했습니다.')
  }
  return toMemo(data as MemoRow)
}

// 메모 수정
export async function updateMemoAction(
  id: string,
  formData: MemoFormData
): Promise<Memo> {
  const { data, error } = await createSupabaseClient()
    .from(TABLE)
    .update({
      title: formData.title,
      content: formData.content,
      category: formData.category,
      tags: formData.tags,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Failed to update memo:', error.message)
    throw new Error('메모를 수정하지 못했습니다.')
  }
  return toMemo(data as MemoRow)
}

// 요약 저장/삭제 (updated_at은 갱신하지 않음)
export async function updateMemoSummaryAction(
  id: string,
  summary: MemoSummary | null
): Promise<Memo> {
  const { data, error } = await createSupabaseClient()
    .from(TABLE)
    .update({ summary })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Failed to update summary:', error.message)
    throw new Error('요약을 저장하지 못했습니다.')
  }
  return toMemo(data as MemoRow)
}

// 메모 삭제
export async function deleteMemoAction(id: string): Promise<void> {
  const { error } = await createSupabaseClient()
    .from(TABLE)
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Failed to delete memo:', error.message)
    throw new Error('메모를 삭제하지 못했습니다.')
  }
}

// 전체 메모 삭제
export async function clearMemosAction(): Promise<void> {
  const { error } = await createSupabaseClient()
    .from(TABLE)
    .delete()
    .not('id', 'is', null)

  if (error) {
    console.error('Failed to clear memos:', error.message)
    throw new Error('메모를 모두 삭제하지 못했습니다.')
  }
}
