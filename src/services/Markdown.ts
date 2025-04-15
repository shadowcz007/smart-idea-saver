import markdownit from 'markdown-it'
export const renderMarkdown = (markdown: string) => {
  const md = markdownit()
  const result = md.render(markdown)
  return result
}
