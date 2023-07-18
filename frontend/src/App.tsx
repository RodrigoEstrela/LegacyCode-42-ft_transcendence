import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const data = {
      name,
      email
    };

    axios.post('http://localhost:5000/auth/signup', data)
      .then(response => {
        console.log('Signup successful!', response.data);
      })
      .catch(error => {
        console.log('Error occurred during signup:', error);
      });
  };

  return (
    <div>
      <h1>User Registration</h1>

      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name:</label>
        <input type="text" id="name" name="name" value={name} onChange={e => setName(e.target.value)} required />
        <br />

        <label htmlFor="email">Email:</label>
        <input type="email" id="email" name="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <br />

        <input type="submit" value="Sign Up" />
      </form>
    </div>
  );
};

export default App;

