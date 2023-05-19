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
            <th>Serial No</th>
            <th>LUX</th>
            <th>CCT</th>
            <th>mEDI</th>
            <th>measurementscol</th>
            <th>GIndex(Light Pollution)</th>
            <th>Rodent(m-lux)</th>
            <th>Graphical Interphase</th>
            <th>measurementscol1</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item["Serial No"]}>
              <td>{item["Serial No"]}</td>
              <td>{item["LUX"]}</td>
              <td>{item["CCT"]}</td>
              <td>{item["mEDI"]}</td>
              <td>{item["measurementscol"]}</td>
              <td>{item["GIndex(Light Pollution)"]}</td>
              <td>{item["Rodent(m-lux)"]}</td>
              <td>{item["Graphical Interphase"]}</td>
              <td>{item["measurementscol1"]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );  
}

export default Welcome;



  
