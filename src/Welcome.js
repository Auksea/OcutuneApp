import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Welcome.css'; // Import the Welcome.css file

function Welcome() {
  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

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

  function handleExclamationClick(item, measurement) {
    setSelectedItem(item);
    let modalMessage = '';
  
    switch (measurement) {
      case 'CCT':
        modalMessage = `Attention: The CCT value (${item.CCT}) is not within the desired range.`;
        break;
      case 'mEDI':
        modalMessage = `Attention: The mEDI value (${item.mEDI}) is not within the desired range.`;
        break;
      case 'GIndex_LightPollution':
        modalMessage = `Attention: The GIndex (Light Pollution) value (${item.GIndex_LightPollution}) is not within the desired range.`;
        break;
      case 'Rodent_Mlux':
        modalMessage = `Attention: The Rodent (m-lux) value (${item.Rodent_Mlux}) is not within the desired range.`;
        break;
      case 'DER':
        modalMessage = `Attention: The DER value (${item.DER}) is not within the desired range. Sleep promoting spectrum!`;
        break;
      default:
        modalMessage = 'Attention: The measurement is not within the desired range. Activating spectrum for circadian rhythm!';
        break;
    }
  
    setModalMessage(modalMessage);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  return (
    <div className="welcome-container">
    <div className="welcome-overlay"></div>
    <h1 className="welcome-heading">Welcome to Ocutune Database measurements</h1>
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Serial No</th>
            <th>LUX</th>
            <th>CCT</th>
            <th>mEDI</th>
            <th>GIndex(Light Pollution)</th>
            <th>Rodent(m-lux)</th>
            <th>DER</th> {/* Added DER column */}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item.SerialNo}>
              <td>{item.SerialNo}</td>
              <td>{item.LUX}</td>
              <td>
                {item.CCT <= 300 ? (
                  <button onClick={() => handleExclamationClick(item, 'CCT')}>
                    {item.CCT}!
                  </button>
                ) : (
                  item.CCT
                )}
              </td>
              <td>
                {item.mEDI > 1 ? (
                  <button onClick={() => handleExclamationClick(item, 'mEDI')}>
                    {item.mEDI}!
                  </button>
                ) : (
                  item.mEDI
                )}
              </td>
              <td>
                {item.GIndex_LightPollution > 1.5 ? (
                  <button onClick={() => handleExclamationClick(item, 'GIndex_LightPollution')}>
                    {item.GIndex_LightPollution}!
                  </button>
                ) : (
                  item.GIndex_LightPollution
                )}
              </td>
              <td>
                {item.Rodent_Mlux <= 0.1 ? (
                  <button onClick={() => handleExclamationClick(item, 'Rodent_Mlux')}>
                    {item.Rodent_Mlux}!
                  </button>
                ) : (
                  item.Rodent_Mlux
                )}
              </td>
              <td>
          {item.DER <= 0.3 ? (
            <button onClick={() => handleExclamationClick(item, 'DER')}>
              {item.DER}!
            </button>
          ) : item.DER >= 0.8 ? (
            <button onClick={() => handleExclamationClick(item, 'DER')}>
              {item.DER}!
            </button>
          ) : (
            item.DER
          )}
        </td>
              <td>
                <button onClick={() => handleDelete(item.SerialNo)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Attention</h2>
            {selectedItem && (
              <p>{modalMessage}</p>
            )}
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Welcome;
