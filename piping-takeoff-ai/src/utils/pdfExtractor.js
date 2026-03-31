// PDF Text Extraction using PDF.js
// Extracts all text content from a PDF file for AI analysis

export async function extractTextFromPDF(file) {
  // Dynamically import pdfjs-dist
  const pdfjsLib = await import('pdfjs-dist')
  
  // Set worker source - using CDN for simplicity
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.mjs`

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        
        let fullText = ''
        const numPages = pdf.numPages
        
        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
          const page = await pdf.getPage(pageNum)
          const textContent = await page.getTextContent()
          const pageText = textContent.items
            .map(item => item.str)
            .join(' ')
          fullText += `\n--- PAGE ${pageNum} ---\n${pageText}`
        }
        
        resolve({
          text: fullText,
          pages: numPages,
          fileName: file.name
        })
      } catch (err) {
        reject(new Error(`Failed to parse PDF: ${err.message}`))
      }
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}

// Convert file to base64 for Anthropic Vision API (for scanned PDFs)
export async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target.result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}
