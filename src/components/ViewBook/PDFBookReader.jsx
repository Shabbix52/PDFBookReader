import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2 } from 'lucide-react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { check_user_access } from '../../services/utils';
import { fetchBook } from '../../services/api';

// ✅ Use unpkg CDN with different version that supports dynamic imports better
GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.2.133/build/pdf.worker.min.js`;

const PDFBookReader = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const accessToken = check_user_access(navigate);
  
  // Get book data from router state (same as ViewBook.jsx)
  const bookId = state?.book_id;
  const bookTitle = state?.book_name || "Map Your Freedom";
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPageRendering, setIsPageRendering] = useState(false);
  const [error, setError] = useState(null);

  const canvasRef = useRef(null);
  const readerContainerRef = useRef(null);
  const activeRenderTask = useRef(null);

  useEffect(() => {
    const loadPDF = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (!accessToken) {
          throw new Error("No access token found");
        }

        if (!bookId) {
          throw new Error("No book ID provided");
        }

        console.log('Loading PDF with bookId:', bookId);
        console.log('Using accessToken:', accessToken);

        // Use your existing fetchBook function
        const pdfBlob = await fetchBook(accessToken, bookId);
        
        if (!pdfBlob) {
          throw new Error("Failed to fetch PDF from server");
        }

        console.log('PDF blob size:', pdfBlob.size);
        
        const pdfData = await pdfBlob.arrayBuffer();

        const loadingTask = getDocument({ 
          data: pdfData,
          // Add additional options for better compatibility
          cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
          cMapPacked: true
        });
        const doc = await loadingTask.promise;
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setCurrentPage(1);
        console.log('PDF loaded successfully, pages:', doc.numPages);
      } catch (err) {
        console.error("Error loading PDF:", err);
        setError(`Failed to load PDF: ${err.message}`);
        setPdfDoc(null);
        setTotalPages(0);
      } finally {
        setIsLoading(false);
      }
    };

    if (bookId && accessToken) {
      loadPDF();
    } else {
      setError("Missing book ID or access token");
      setIsLoading(false);
    }
  }, [bookId, accessToken]);

  const renderPage = useCallback(async (pageNumToRender) => {
    if (!pdfDoc || !canvasRef.current) return;

    // Cancel any ongoing render task
    if (activeRenderTask.current) {
      activeRenderTask.current.cancel();
      activeRenderTask.current = null;
    }

    setIsPageRendering(true);
    setError(null);

    try {
      const page = await pdfDoc.getPage(pageNumToRender);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      const viewport = page.getViewport({ scale: zoom });

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Clear canvas with white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport,
      };

      const task = page.render(renderContext);
      activeRenderTask.current = task;

      await task.promise;
      activeRenderTask.current = null;
    } catch (err) {
      activeRenderTask.current = null;
      if (err.name !== 'RenderingCancelledException') {
        console.error(`Error rendering page ${pageNumToRender}:`, err);
        setError(`Error rendering page ${pageNumToRender}: ${err.message}`);
      }
    } finally {
      setIsPageRendering(false);
    }
  }, [pdfDoc, zoom]);

  useEffect(() => {
    if (pdfDoc && currentPage > 0 && currentPage <= totalPages) {
      renderPage(currentPage);
    }
    return () => {
      if (activeRenderTask.current) {
        activeRenderTask.current.cancel();
        activeRenderTask.current = null;
      }
    };
  }, [pdfDoc, currentPage, totalPages, renderPage]);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages && !isPageRendering) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages, isPageRendering]);

  const prevPage = useCallback(() => {
    if (currentPage > 1 && !isPageRendering) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage, isPageRendering]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isPageRendering) return;
      
      switch (event.key) {
        case 'ArrowRight':
          event.preventDefault();
          nextPage();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          prevPage();
          break;
        case '+':
        case '=':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            handleZoomIn();
          }
          break;
        case '-':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            handleZoomOut();
          }
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [nextPage, prevPage, isPageRendering]);

  const handleZoomIn = () => {
    if (!isPageRendering) {
      setZoom(z => Math.min(z + 0.2, 3.0));
    }
  };

  const handleZoomOut = () => {
    if (!isPageRendering) {
      setZoom(z => Math.max(z - 0.2, 0.5));
    }
  };

  const goToPage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages && !isPageRendering) {
      setCurrentPage(pageNum);
    }
  };

  return (
    <div className="pdf-reader-container" ref={readerContainerRef}>
      <style>{`
        .pdf-reader-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: #f5f5f5;
        }
        
        .pdf-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 10px;
          background: white;
          border-bottom: 1px solid #ddd;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .pdf-controls button {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px 12px;
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .pdf-controls button:hover:not(:disabled) {
          background: #f0f0f0;
          border-color: #999;
        }
        
        .pdf-controls button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .pdf-controls span {
          font-weight: 500;
          margin: 0 10px;
        }
        
        .pdf-content {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: auto;
          padding: 20px;
        }
        
        .pdf-canvas {
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          border-radius: 4px;
          max-width: 100%;
          height: auto;
        }
        
        .loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
          gap: 10px;
          color: #666;
        }
        
        .error {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: #d32f2f;
          font-weight: 500;
        }
        
        .page-input {
          width: 60px;
          text-align: center;
          padding: 4px 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin: 0 5px;
        }
      `}</style>
      
      <div className="pdf-controls">
        <button onClick={prevPage} disabled={currentPage === 1 || isPageRendering}>
          <ChevronLeft size={18} />
        </button>
        
        <span>
          Page 
          <input 
            type="number" 
            className="page-input"
            value={currentPage} 
            min={1} 
            max={totalPages}
            onChange={(e) => {
              const pageNum = parseInt(e.target.value);
              if (!isNaN(pageNum)) {
                goToPage(pageNum);
              }
            }}
            disabled={isPageRendering}
          />
          of {totalPages}
        </span>
        
        <button onClick={nextPage} disabled={currentPage === totalPages || isPageRendering}>
          <ChevronRight size={18} />
        </button>
        
        <button onClick={handleZoomOut} disabled={isPageRendering || zoom <= 0.5}>
          <ZoomOut size={18} />
        </button>
        
        <span>{Math.round(zoom * 100)}%</span>
        
        <button onClick={handleZoomIn} disabled={isPageRendering || zoom >= 3.0}>
          <ZoomIn size={18} />
        </button>
      </div>

      <div className="pdf-content">
        {isLoading ? (
          <div className="loader">
            <Loader2 className="animate-spin" size={32} />
            <span>Loading PDF...</span>
          </div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <canvas ref={canvasRef} className="pdf-canvas" />
        )}
      </div>
    </div>
  );
};

export default PDFBookReader;