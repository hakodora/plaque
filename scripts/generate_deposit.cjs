const fs = require('fs')
const path = require('path')

function listFiles(dir, exts) {
  const result = []
  if (!fs.existsSync(dir)) return result
  const items = fs.readdirSync(dir)
  for (const item of items) {
    const p = path.join(dir, item)
    const stat = fs.statSync(p)
    if (stat.isDirectory()) {
      result.push(...listFiles(p, exts))
    } else {
      const ext = path.extname(p).toLowerCase()
      if (exts.includes(ext)) result.push(p)
    }
  }
  return result
}

function readLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    return content.split(/\r?\n/)
  } catch (e) {
    return []
  }
}

function padLines(lines, minLines) {
  const res = lines.slice()
  while (res.length < minLines) res.push('')
  return res
}

function paginateFromHeadAndTail(lines, pagesEach, linesPerPage) {
  const totalLinesNeeded = pagesEach * linesPerPage
  const head = padLines(lines.slice(0, totalLinesNeeded), totalLinesNeeded)
  const tailStart = Math.max(lines.length - totalLinesNeeded, 0)
  const tail = padLines(lines.slice(tailStart), totalLinesNeeded)
  const pages = []
  for (let i = 0; i < pagesEach; i++) {
    const start = i * linesPerPage
    const slice = head.slice(start, start + linesPerPage)
    pages.push(slice)
  }
  for (let i = 0; i < pagesEach; i++) {
    const start = i * linesPerPage
    const slice = tail.slice(start, start + linesPerPage)
    pages.push(slice)
  }
  return pages
}

function writePages(outPath, title, pages) {
  const lines = []
  lines.push(title)
  for (let i = 0; i < pages.length; i++) {
    lines.push('')
    lines.push('---- 第 ' + (i + 1) + ' 页 ----')
    const page = pages[i]
    for (let j = 0; j < page.length; j++) {
      const num = (j + 1).toString().padStart(2, '0')
      lines.push(num + ' ' + page[j])
    }
  }
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8')
}

function aggregateSourceLines(root) {
  const dirs = [
    path.join(root, 'api', 'services'),
    path.join(root, 'api', 'routes'),
    path.join(root, 'api'),
    path.join(root, 'src', 'components'),
    path.join(root, 'src', 'pages'),
  ]
  const exts = ['.ts', '.tsx', '.js']
  const files = []
  for (const d of dirs) files.push(...listFiles(d, exts))
  const lines = []
  for (const f of files) {
    lines.push('// 文件: ' + path.relative(root, f))
    const ls = readLines(f)
    for (const l of ls) lines.push(l)
  }
  return lines
}

function readManualLines(root) {
  const manual = path.join(root, 'USER_MANUAL.md')
  const readme = path.join(root, 'README.md')
  let lines = []
  if (fs.existsSync(manual)) lines = readLines(manual)
  else if (fs.existsSync(readme)) lines = readLines(readme)
  return lines
}

function main() {
  const root = process.cwd()
  const pagesEach = 30
  const linesPerPage = 50
  const sourceLines = aggregateSourceLines(root)
  const sourcePages = paginateFromHeadAndTail(sourceLines, pagesEach, linesPerPage)
  writePages(path.join(root, 'docs', 'copyright', '源代码节选_自动生成.txt'), '软件名称：DentalAI Pro\n版本：v1.0.0\n材料类型：源程序节选（前30页+后30页，每页50行）', sourcePages)
  const docLines = readManualLines(root)
  const docPages = paginateFromHeadAndTail(docLines, pagesEach, linesPerPage)
  writePages(path.join(root, 'docs', 'copyright', '说明文档节选_自动生成.txt'), '软件名称：DentalAI Pro\n版本：v1.0.0\n材料类型：说明文档节选（前30页+后30页，每页50行）', docPages)
  console.log('已生成：docs/copyright/源代码节选_自动生成.txt')
  console.log('已生成：docs/copyright/说明文档节选_自动生成.txt')
}

main()