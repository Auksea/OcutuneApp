import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Welcome.css'; // Import the Welcome.css file

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

  async function handleDelete(serialNo) {
    try {
      await axios.delete(`http://localhost:3000/measurements/${serialNo}`);
      fetchData(); // Fetch the updated data after successful deletion
    } catch (error) {
      console.error(error);
    }
  }  

  return (
    <div className="welcome-container"> {/* Use the "welcome-container" class */}
      <h1>Welcome</h1>
      <table className="data-table"> {/* Use the "data-table" class */}
        <thead>
          <tr>
            <th>Serial No</th>
            <th>LUX</th>
            <th>CCT</th>
            <th>mEDI</th>
            <th>GIndex(Light Pollution)</th>
            <th>Rodent(m-lux)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item.SerialNo}>
              <td>{item.SerialNo}</td>
              <td>{item.LUX}</td>
              <td>{item.CCT}</td>
              <td>{item.mEDI}</td>
              <td>{item.GIndex_LightPollution}</td>
              <td>{item.Rodent_Mlux}</td>
              <td>
                <button onClick={() => handleDelete(item.SerialNo)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Welcome;



  
