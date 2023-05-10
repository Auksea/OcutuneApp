import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Welcome() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const response = await axios.get('http://localhost:3000/measurements');
      setData(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div>
      <h1>Welcome</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item["Serial No"]}>
              <td>{item["Serial No"]}</td>
              <td>{item["measurementscol"]}</td>
              <td>{item["LUX"]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Welcome;



  
