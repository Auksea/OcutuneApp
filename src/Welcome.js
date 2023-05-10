import React, { useState, useEffect } from 'react';

function Welcome() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const response = await fetch('http://localhost:3000/measurements');
    const jsonData = await response.json();
    setData(jsonData);
  }

  return (
    <div>
      <h1>Welcome</h1>
      <ul>
        {data.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default Welcome;


  
