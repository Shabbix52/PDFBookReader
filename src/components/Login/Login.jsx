import { React, useState } from 'react'
import '../../pages/RegistrationPage.css'
import { useNavigate } from 'react-router-dom'
import { showErrorToast } from '../../services/utils'
import { login } from '../../services/api'
import { SyncLoader } from "react-spinners"

function Login({ modeHandler }) {

  const [isLoading, setIsLoading ] = useState(false)
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: "",
    password: ""  
  })

  const handleFieldChange = (e)=>{
    const { name, value } = e.target;
    setFormData((prevFields) => ({
      ...prevFields,
      [name]: value
    }));
  }

  const handleSubmit = async ()=>{
    try{
      setIsLoading(true)
      const accessToken =  await login( formData );
      if (accessToken){
        setIsLoading(false)
        navigate('/user-profile')

      }else{
        setIsLoading(false)
        showErrorToast("Please provide correct credentials.")
      }
    }catch(error){
      setIsLoading(false)
      console.log(error)
      showErrorToast("There was an error logging in. Please try again.")
    }
  }

  return (
    <div className='form-container'>
      <div className='form-field'>
        <p>Email</p>
        <input type="text" placeholder='Email' name='email' value={ formData.email } onChange={ handleFieldChange } />
      </div>

      <div className='form-field'>
        <p>Password</p>
        <input type="password" placeholder='Password' name='password' value={ formData.password } onChange={ handleFieldChange } />
      </div>

      <button onClick={ handleSubmit }>{ isLoading? <SyncLoader size={4} speedMultiplier={0.75} margin={2} color="white" />: 'Sign In' }</button>

      <a href='/'>Forgot Password?</a>

      <div className='register-option-container' >
        <p style={{ "fontWeight": "500" }}>New Account?</p>
        <button style={{ "maxWidth": "60%" }} onClick={ ()=>modeHandler() }  >Register</button>
      </div>
    </div>
  )
}

export default Login