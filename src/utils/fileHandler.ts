/**
 * 文件处理工具
 */
export async function processFile(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        if (!content) {
          reject(new Error('文件内容为空'))
          return
        }
        
        // 按行分割，过滤空行和只包含空白字符的行
        const lines = content
          .split(/\r?\n/)
          .map(line => line.trim())
          .filter(line => line.length > 0)
        
        if (lines.length === 0) {
          reject(new Error('文件内容为空'))
          return
        }
        
        resolve(lines)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }
    
    reader.readAsText(file, 'UTF-8')
  })
}

/**
 * 验证文件
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // 校验文件类型
  if (!file.name.toLowerCase().endsWith('.txt')) {
    return { valid: false, error: '只能上传txt文件！' }
  }
  
  // 校验文件大小（5MB = 5 * 1024 * 1024 字节）
  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: '文件大小不能超过5MB！' }
  }
  
  return { valid: true }
}

/**
 * 保存上传的文件信息到 localStorage
 */
export function saveUploadedFile(fileName: string, sentences: string[]) {
  localStorage.setItem('uploadedFileName', fileName)
  localStorage.setItem('uploadedSentences', JSON.stringify(sentences))
}

/**
 * 从 localStorage 加载上传的文件信息
 */
export function loadUploadedFile(): { fileName: string; sentences: string[] } | null {
  const fileName = localStorage.getItem('uploadedFileName')
  const sentencesStr = localStorage.getItem('uploadedSentences')
  
  if (fileName && sentencesStr) {
    try {
      const sentences = JSON.parse(sentencesStr) as string[]
      return { fileName, sentences }
    } catch {
      return null
    }
  }
  
  return null
}

/**
 * 清除上传的文件信息
 */
export function clearUploadedFile() {
  localStorage.removeItem('uploadedFileName')
  localStorage.removeItem('uploadedSentences')
}

