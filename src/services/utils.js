import { toast } from "react-toastify";
import './utils.css'

export const showSuccessToast = (message) => {
  toast.success(message, {
    position: 'bottom-center',
    autoClose: 3000,
    hideProgressBar: true, // Show/hide progress bar
    newestOnTop: true,
    className: window.innerWidth < 900? 'toast-mobile-message': 'toast-message',
    closeButton: false,
    icon: false,
  })
}

export const showErrorToast = (message) => {
  toast.error(message, {
    position: 'bottom-center',
    autoClose: 3000,
    hideProgressBar: true,
    newestOnTop: true,
    className: window.innerWidth < 900? 'toast-mobile-message': 'toast-message',
    closeButton: false,
    icon: false
  })
}

export const check_user_access = (navigate) =>{
  const accessToken = localStorage.getItem("myfAccessToken")
  if (accessToken){
    return accessToken
  }

  navigate('/')
} 

