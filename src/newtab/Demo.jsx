import React from "react";
import "./NewTab.css";

export default function Demo({ onBack }) {
  return (
    <section>
      <h2>Demo Page</h2>
      <p>This is a simple demo page.</p>
      <div>
        <button onClick={onBack}>Back</button>
      </div>
    </section>
  );
}
