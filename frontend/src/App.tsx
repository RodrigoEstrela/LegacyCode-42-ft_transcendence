import React, { useState } from 'react';
import axios from 'axios';

interface FormData {
  name: string;
  email: string;
}

function App() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: ''
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { name, email } = formData;

    // Create an object with the data to be sent in the POST request
    const data = {
      name,
      email
    };

    // Send the POST request to the backend using Axios
    axios
      .post('http://localhost:5000/auth/signup', data)
      .then(function (response) {
        console.log('Signup successful!', response.data);
        // Perform additional actions after successful signup
      })
      .catch(function (error) {
        console.log('Error occurred during signup:', error);
        // Handle the error appropriately
      });

    // Optionally, you can reset the form after submission
    setFormData({
      name: '',
      email: ''
    });
  };

  return (
    <div>
      <h1>User Registration</h1>

      <div>
        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          /><br /><br />

          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          /><br /><br />

          <input type="submit" value="Sign Up" />
        </form>
      </div>
    </div>
  );
}

export default App;

