import PDFBookReader from '../components/PDFBookReader';

const BookPage = () => {
  const token = localStorage.getItem('access_token'); // or from Redux/AuthContext
  const bookId = 5; // Example ID

  return (
    <div>
      <h2>Book Viewer</h2>
      <PDFBookReader bookId={bookId} token={token} />
    </div>
  );
};

export default BookPage;
