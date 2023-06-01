import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, signInWithEmailAndPassword } from "./firebase";
import "./Login.css";
import axios from 'axios';
import Welcome from './Welcome';


function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();

  const signInWithEmailAndPasswordHandler = async (event, email, password) => {
    event.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoggedIn(true);
    } catch (error) {
      setError("Username or password is incorrect");
      console.error("Username or password is incorrect", error);
    }
  };  

  const onChangeHandler = (event) => {
    const { name, value } = event.currentTarget;
    if (name === 'userEmail') {
      setEmail(value);
    } else if (name === 'userPassword') {
      setPassword(value);
    }
  };

  return (
    <div className="login-container">
        {!loggedIn && (
          <form className="login-form">
            <h1>Please Log in</h1>
            <label htmlFor="userEmail">Email:</label>
            <input
              type="email"
              name="userEmail"
              value={email}
              placeholder="Email"
              onChange={onChangeHandler}
            />
            <label htmlFor="userPassword">Password:</label>
            <input
              type="password"
              name="userPassword"
              value={password}
              placeholder="Password"
              onChange={onChangeHandler}
            />
            <button className="login-button" onClick={(event) => {signInWithEmailAndPasswordHandler(event, email, password)}}>
              Login
            </button>
            {error && (
              <div>
                {error && <p className="login-error">{error}</p>}
              </div>
            )}
          </form>
        )}
        {loggedIn && <Welcome />}
    </div>
  );
}

export default Login;











