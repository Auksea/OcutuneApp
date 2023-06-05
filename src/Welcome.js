import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Welcome.css'; // Import the Welcome.css file

function Welcome() {
  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  function handleExclamationClick(item) {
    setSelectedItem(item);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  return (
    <div className="welcome-container">
      <h1>Welcome</h1>
      <table className="data-table">
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
              <td>
                {item.LUX > 300 ? (
                  <button onClick={() => handleExclamationClick(item)}>
                    {item.LUX}!
                  </button>
                ) : (
                  item.LUX
                )}
              </td>
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

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Attention</h2>
            {selectedItem && (
              <p>
                You need to go outside because of the LUX higher than 100
              </p>
            )}
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}


export default Welcome;