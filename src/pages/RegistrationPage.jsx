import { React, useState, useEffect } from 'react'
import './RegistrationPage.css'
import { useNavigate } from 'react-router-dom'
import Login from '../components/Login/Login'
import SignUp from '../components/SignUp/SignUp'

function RegistrationPage() {
  const [mode, setMode] = useState(false)
  const modeHandler = ()=>setMode(!mode)
  const navigate = useNavigate()

  useEffect(()=>{
    const checkAccess = ()=>{
      const accessToken = localStorage.getItem('myfAccessToken')
      if (accessToken){
        navigate('/user-profile')
      }
    }

    checkAccess()
  })
  
  return (
    <div className='registration-container' >
      { mode? <SignUp modeHandler={ modeHandler }/>: <Login modeHandler={ modeHandler }/> }
    </div>
  )
}

export default RegistrationPage