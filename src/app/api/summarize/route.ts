import { NextResponse } from 'next/server'

const MAX_CONTENT_LENGTH = 20000
const DEFAULT_MODEL = 'gemini-3.1-flash-lite'

const SYSTEM_PROMPT = `당신은 메모를 요약하는 도우미입니다.
- 원문의 언어와 상관없이 항상 한국어로 요약합니다.
- 메모가 짧으면 핵심을 한 줄로 요약합니다.
- 메모가 길면 핵심 포인트를 3~5개의 불릿("- ")으로 요약합니다.
- 원문에 없는 내용을 추가하지 않습니다.
- 요약 본문만 출력하고 서문이나 설명은 붙이지 않습니다.`

interface SummarizeRequestBody {
  content?: unknown
  title?: unknown
}

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[]
}

const errorResponse = (message: string, status: number) =>
  NextResponse.json({ error: message }, { status })

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return errorResponse('서버에 AI API 키가 설정되지 않았습니다.', 500)
  }

  let body: SummarizeRequestBody
  try {
    body = await request.json()
  } catch {
    return errorResponse('잘못된 요청입니다.', 400)
  }

  const content = typeof body.content === 'string' ? body.content.trim() : ''
  const title = typeof body.title === 'string' ? body.title.trim() : ''

  if (!content) {
    return errorResponse('요약할 메모 내용이 없습니다.', 400)
  }
  if (content.length > MAX_CONTENT_LENGTH) {
    return errorResponse('메모가 너무 길어 요약할 수 없습니다.', 413)
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL
  const prompt = title ? `제목: ${title}\n\n${content}` : content

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    )

    if (!response.ok) {
      console.error('Gemini API error status:', response.status)
      if (response.status === 429) {
        return errorResponse(
          '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
          429
        )
      }
      return errorResponse('AI 요약 중 오류가 발생했습니다.', 502)
    }

    const data: GeminiResponse = await response.json()
    const text = data.candidates?.[0]?.content?.parts
      ?.map(part => part.text ?? '')
      .join('')
      .trim()

    if (!text) {
      return errorResponse('요약 결과를 받지 못했습니다.', 502)
    }

    return NextResponse.json({ summary: text })
  } catch (error) {
    console.error('Summarize request failed:', error)
    return errorResponse('AI 요약 중 오류가 발생했습니다.', 502)
  }
}
