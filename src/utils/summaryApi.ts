const DEFAULT_ERROR = 'AI 요약 중 오류가 발생했습니다.'

export const MIN_SUMMARY_LENGTH = 20

export const requestSummary = async (
  content: string,
  title: string
): Promise<string> => {
  let response: Response
  try {
    response = await fetch('/api/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, title }),
    })
  } catch {
    throw new Error('네트워크 오류가 발생했습니다. 연결을 확인해 주세요.')
  }

  let data: { summary?: string; error?: string } = {}
  try {
    data = await response.json()
  } catch {
    // 본문이 JSON이 아니면 기본 에러 메시지를 사용
  }

  if (!response.ok || !data.summary) {
    throw new Error(data.error || DEFAULT_ERROR)
  }

  return data.summary
}
