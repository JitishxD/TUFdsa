import React from "react";

const RemoteUpdateToast = ({ show }) => {
  if (!show) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-30 bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-lg">
      🔁 Random problem updated from another window
    </div>
  );
};

export default RemoteUpdateToast;
