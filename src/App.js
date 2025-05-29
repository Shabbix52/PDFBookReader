import './App.css';
import { ToastContainer } from 'react-toastify';
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import RegistrationPage from './pages/RegistrationPage'
import UserProfile from './components/UserProfile/UserProfile';
import ViewBook from './components/ViewBook/ViewBook';
// Add this import
import PDFBookReader from './components/ViewBook/PDFBookReader'; // adjust path as needed



function App() {
  return (
    <div className="app-container">
      <BrowserRouter>
        <div className='content'>
          <Routes>
            <Route path='/' element={ <RegistrationPage /> } />
            <Route path='user-profile/' element={ <UserProfile /> } />
            <Route path='view_book/' element={ <ViewBook /> } />
            <Route path="/pdf-reader" element={<PDFBookReader />} />
          </Routes>
          <ToastContainer/>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
