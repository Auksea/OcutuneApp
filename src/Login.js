import React, { useState, useEffect, useHistory } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { auth, signInWithEmailAndPassword } from "./firebase";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const history = useHistory();

  const signInWithEmailAndPasswordHandler = (event, email, password) => {
    event.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        history.push("/welcome");
      })
      .catch(error => {
        setError("Username or password is incorrect");
        console.error("Username or password is incorrect", error);
      });
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
    <div className="container">
      <form>
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
        <button onClick={(event) => {signInWithEmailAndPasswordHandler(event, email, password)}}>
          Login
        </button>
        {error && (
          <div>
            <p>{error}</p>
          </div>
        )}
        <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
      </form>
    </div>
  );
}

export default Login;






