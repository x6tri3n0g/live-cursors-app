import React, { useState } from "react";

const Login = ({ onSubmit }) => {
  const [inputText, setInputText] = useState("");

  return (
    <main>
      <h1>Welcome to Live Collaboration</h1>
      <p>What should we call you?</p>
      <form onSubmit={() => onSubmit(inputText)}>
        <input
          type="text"
          value={inputText}
          placeholder="Enter your username"
          onChange={(e) => setInputText(e.currentTarget.value)}
        />
        <button type="submit">Login</button>
      </form>
    </main>
  );
};

export default Login;
