'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownRendererProps {
  content: string
}

const MARKDOWN_STYLES = [
  'text-sm leading-relaxed text-gray-700 break-words',
  '[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:text-gray-900',
  '[&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-gray-900',
  '[&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1 [&_h3]:text-gray-900',
  '[&_p]:my-2',
  '[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2',
  '[&_.contains-task-list]:list-none [&_.contains-task-list]:pl-0 [&_.task-list-item_input]:mr-2',
  '[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2',
  '[&_li>ul]:my-0 [&_li>ol]:my-0 [&_ul_ul]:list-[circle]',
  '[&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:text-gray-500 [&_blockquote]:my-2',
  '[&_a]:text-blue-600 [&_a]:underline',
  '[&_code]:bg-gray-100 [&_code]:px-1 [&_code]:rounded [&_code]:text-xs',
  '[&_pre]:bg-gray-100 [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-2 [&_pre]:leading-normal',
  '[&_pre_code]:bg-transparent [&_pre_code]:p-0',
  '[&_table]:border-collapse [&_table]:my-2',
  '[&_th]:border [&_th]:border-gray-300 [&_th]:px-3 [&_th]:py-1 [&_th]:bg-gray-50',
  '[&_td]:border [&_td]:border-gray-300 [&_td]:px-3 [&_td]:py-1',
  '[&_hr]:my-4 [&_hr]:border-gray-200',
].join(' ')

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className={MARKDOWN_STYLES} data-testid="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noreferrer noopener">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
