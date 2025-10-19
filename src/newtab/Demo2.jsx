import React from "react";
import "./NewTab.css";

export default function Demo2({ onBack }) {
  return (
    <section>
      <h2>Demo Page 2</h2>
      <p>This is another demo page.</p>
      <div>
        <button onClick={onBack}>Back</button>
      </div>
    </section>
  );
}
