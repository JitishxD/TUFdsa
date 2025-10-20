import React from "react";

const Header = ({ time, date, greeting, quote }) => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-5xl font-bold mb-3 text-indigo-400">{time}</h1>
      <p className="text-lg text-gray-400 mb-2">{date}</p>
      <h2 className="text-2xl font-semibold text-white mt-4">
        {greeting}, Coder! 👋
      </h2>
      <p className="text-gray-400 italic mt-3 text-sm">"{quote}"</p>
    </div>
  );
};

export default Header;
