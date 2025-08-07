"use client"

import { useState } from 'react';

interface CounterComp {
  initial: number
}

const Counter: React.FC<CounterComp> = ({ initial }) => {
  // Initialize state with the initial prop
  const [count, setCount] = useState(initial);

  // Function to increment the count
  const increment = () => {
    setCount(count + 1);
  };

  // Function to decrement the count
  const decrement = () => {
    setCount(count - 1);
  };

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>Decrement</button>
    </div>
  );
};

export default Counter;
