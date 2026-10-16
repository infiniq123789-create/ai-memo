'use client'

import MDEditor from '@uiw/react-md-editor'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  height?: number
}

export default function MarkdownEditor({
  value,
  onChange,
  height = 280,
}: MarkdownEditorProps) {
  return (
    <div data-color-mode="light" data-testid="markdown-editor">
      <MDEditor
        value={value}
        onChange={val => onChange(val ?? '')}
        height={height}
        preview="live"
        textareaProps={{
          id: 'content',
          placeholder: '마크다운으로 메모 내용을 입력하세요',
        }}
      />
    </div>
  )
}
