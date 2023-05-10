import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, signInWithEmailAndPassword } from "./firebase";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const signInWithEmailAndPasswordHandler = async (event, email, password) => {
    event.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/welcome");
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
      </form>
    </div>
  );
}

export default Login;










