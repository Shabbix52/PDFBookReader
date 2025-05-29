import React from 'react'
import './Book.css'
import { useNavigate } from 'react-router-dom'
import { checkout, fetchBook } from '../../services/api'
import TheFrickingBook from '../../assets/images/myf.png'

function Book({ book }) {

    const navigate = useNavigate()

    const accessToken = localStorage.getItem("myfAccessToken")
    if (!accessToken){
        navigate('/')
    }
    
    const purchaseBook = async () =>{
        try{
            const checkout_url = await checkout(accessToken, book.id);
            if (checkout_url) window.location.href = checkout_url

        }catch(error){
            console.log(error)
        }
    }

    const readBook = async () =>{
        navigate('/pdf-reader', {
            state: {
                book_id: book.id,
                book_name: book.name
            }
        })
    }

    const handleDownload = async () => {
        try {
            // Fetch the PDF from the backend using view_book
            const pdf = await fetchBook(accessToken, book.id); // Assumes view_book returns a Blob
            console.log(pdf)
        
            // Create a temporary URL for the PDF Blob
            const url = URL.createObjectURL(pdf);
        
            // Create an anchor element for downloading
            const link = document.createElement('a');
            link.href = url;
            link.download = 'MapYourFreedom.pdf'; 
        
            // Append the link to the document, trigger the click, and remove it
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading PDF:', error);
        }
    }

    return (
        <div className="book">
            <div className="the-fricking-book">
                <img src={ TheFrickingBook } />
            </div>

            <h6>{ book.name }</h6>

            <button onClick={ book.has_book_access? readBook: purchaseBook }>
                { book.has_book_access? "Read Book": `Purchase Book ${(book.price/100).toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                })}`}
            </button>

            {book.has_book_access &&
                <button onClick={handleDownload}>
                    <p>Download Book</p>
                </button>
            }
        </div>
    )
}

export default Book