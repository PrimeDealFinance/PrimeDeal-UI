import React, { useState, useEffect } from 'react';


// http://164.92.181.210/api/positions


const ExampleComponent = () => {
  const [pools, setPools] = useState([]);

  const fetchData = async () => {
    try {
      const response = await fetch('http://164.92.181.210/api/pools');
      if (!response.ok) {
        console.log(response)
        
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Ошибка при получении данных:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchData()
      .then(data => {
        if (data) {
          setPools(data);
        }
      });
  }, []);

  return (
    <div>
      <h1>Pools</h1>
      <ul>
        {pools.map((pool, index) => (
          <li key={index}>{pool}</li>
        ))}
      </ul>
    </div>
  );
};

export default ExampleComponent;