import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './ViewBook.css'
import { Document, Page, pdfjs } from 'react-pdf'
import { check_user_access } from '../../services/utils'
import { BASE_URL, fetchBook } from '../../services/api'

// ✅ Correctly set worker source for Create React App
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

function ViewBook() {
  const [numPages, setNumPages] = useState(null)
  const navigate = useNavigate()
  const { state } = useLocation()
  const accessToken = check_user_access(navigate)

  const book_id = state?.book_id
  const book_name = state?.book_name

  const onLoadSuccess = (pdf) => {
    setNumPages(pdf.numPages)
  }

  const handleDownload = async () => {
    try {
      const pdf = await fetchBook(accessToken, book_id)
      const url = URL.createObjectURL(pdf)
      const link = document.createElement('a')
      link.href = url
      link.download = 'MapYourFreedom.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading PDF:', error)
    }
  }

  const PDF_URL = `${BASE_URL}books/${book_id}/get_book/`

  const file = useMemo(() => ({
    url: PDF_URL,
    httpHeaders: {
      Authorization: accessToken,
    },
  }), [PDF_URL, accessToken])

  const options = useMemo(() => ({
    disableTextLayer: true,
  }), [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 's')) {
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="MYF-container" onContextMenu={(e) => e.preventDefault()}>
      {file ? (
        <>
          <div className="book-title-container">
            <p>{book_name}</p>
            <button onClick={handleDownload}>
              <i className="fa-solid fa-download" />
            </button>
          </div>

          <div className="document-container">
            <Document
              file={file}
              options={options}
              onLoadSuccess={onLoadSuccess}
              onLoadError={(error) =>
                console.log('Error loading document: ', error)
              }
            >
              {numPages > 0 &&
                [...Array(numPages)].map((_, index) => (
                  <Page
                    key={index + 1}
                    pageNumber={index + 1}
                    renderAnnotationLayer={false}
                    renderTextLayer={false}
                    className="pdf-page"
                  />
                ))}
            </Document>
          </div>
        </>
      ) : (
        <p>You do not have access to this book.</p>
      )}
    </div>
  )
}

export default ViewBook
