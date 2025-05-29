import { React, useState } from "react"
import "../../pages/RegistrationPage.css"
import { showErrorToast } from "../../services/utils"
import { register } from "../../services/api"
import { SyncLoader } from "react-spinners"

function SignUp( { modeHandler } ) {

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    password: "",
    re_password: "",
    gender: "M"
  });

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFields) => ({
      ...prevFields,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      console.log(formData)
      const is_created = await register(formData);
      if (is_created) {
        setIsLoading(false)
        setFormData({
          email: "",
          password: "",
          first_name: "",
          last_name: "",
          password: "",
          re_password: "",
          gender: ""
        })
        modeHandler()
      } else {
        setIsLoading(false);
        showErrorToast("Please check all fields to have correct data.")
      }
      
    } catch (error) {
      setIsLoading(false);
      showErrorToast("Failed to create an account.")
    }
  };

  return (
    <div className="form-container">
      <h5>Register</h5>
      <div className="form-field">
        <p>First Name</p>
        <input
          type="text"
          name="first_name"
          value={ formData.first_name }
          onChange={ handleFieldChange }
        />
      </div>
      <div className="form-field">
        <p>Last Name</p>
        <input
          type="text"
          name="last_name"
          value={ formData.last_name }
          onChange={ handleFieldChange }
        />
      </div>
      <div className="form-field">
        <p>Gender</p>
        <select
          type="text"
          name="gender"
          onChange={ handleFieldChange }
          value = { formData.gender }
        >
          <option key="M" value="M">Male</option>
          <option key="F" value="F">Female</option>
          <option key="O" value="O">Other</option>
        </select>
      </div>
      <div className="form-field">
        <p>Email</p>
        <input
          type="text"
          name="email"
          value={ formData.email }
          onChange={ handleFieldChange }
        />
      </div>
      <div className="form-field">
        <p>Password</p>
        <input
          type="password"
          name="password"
          value={ formData.password }
          onChange={ handleFieldChange }
        />
      </div>
      <div className="form-field">
        <p>Retype Password</p>
        <input
          type="password"
          name="re_password"
          value={ formData.re_password }
          onChange={ handleFieldChange }
        />
      </div>

      <button onClick={ handleSubmit }>{ isLoading? <SyncLoader size={4} speedMultiplier={0.75} margin={2} color="white" />: "Sign Up" }</button>

      <a onClick={ ()=>modeHandler() }>Already have an account? Sign In</a>
    </div>
  );
}

export default SignUp;
