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

  async function handleDelete(serialNo) {
    try {
      await axios.delete(`http://localhost:3000/measurements/${serialNo}`);
      fetchData(); // Fetch the updated data after successful deletion
    } catch (error) {
      console.error(error);
    }
  }  

  return (
    <div>
      <h1>Welcome</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
      <tr>
        <th style={{ textAlign: 'center', padding: '8px', border: '1px solid black' }}>Serial No</th>
        <th style={{ textAlign: 'center', padding: '8px', border: '1px solid black' }}>LUX</th>
        <th style={{ textAlign: 'center', padding: '8px', border: '1px solid black' }}>CCT</th>
        <th style={{ textAlign: 'center', padding: '8px', border: '1px solid black' }}>mEDI</th>
        <th style={{ textAlign: 'center', padding: '8px', border: '1px solid black' }}>GIndex(Light Pollution)</th>
        <th style={{ textAlign: 'center', padding: '8px', border: '1px solid black' }}>Rodent(m-lux)</th>
        <th style={{ textAlign: 'center', padding: '8px', border: '1px solid black' }}>Actions</th> {/* Added delete button header */}
      </tr>
    </thead>

    <tbody>
      {data.map(item => (
        <tr key={item.SerialNo}>
          <td style={{ textAlign: 'center', padding: '8px', border: '1px solid black' }}>{item.SerialNo}</td>
          <td style={{ textAlign: 'center', padding: '8px', border: '1px solid black' }}>{item.LUX}</td>
          <td style={{ textAlign: 'center', padding: '8px', border: '1px solid black' }}>{item.CCT}</td>
          <td style={{ textAlign: 'center', padding: '8px', border: '1px solid black' }}>{item.mEDI}</td>
          <td style={{ textAlign: 'center', padding: '8px', border: '1px solid black' }}>{item.GIndex_LightPollution}</td>
          <td style={{ textAlign: 'center', padding: '8px', border: '1px solid black' }}>{item.Rodent_Mlux}</td>
          <td style={{ textAlign: 'center', padding: '8px', border: '1px solid black' }}>
            <button onClick={() => handleDelete(item.SerialNo)}>Delete</button>
          </td> {/* Added delete button */}
        </tr>
      ))}
    </tbody>
      </table>
    </div>
  );
}

export default Welcome;



  
