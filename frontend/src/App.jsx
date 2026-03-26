import { useState } from "react";
import "./App.css";

export default function App() {
  const [formData, setFormData] = useState({
    name: "",
    destination: "",
    date: "",
    time: "",
  });

  const [isReady, setIsReady] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handlePrepare(e) {
    e.preventDefault();

    const { name, destination, date, time } = formData;

    if (!name || !destination || !date || !time) {
      setStatusMessage("Please fill out all fields before continuing.");
      setIsReady(false);
      return;
    }

    setStatusMessage("");
    setIsReady(true);
  }

  async function handleEmergencySend() {
    setIsSending(true);
    setStatusMessage("");

    try {
      const response = await fetch("http://localhost:3001/api/alert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to send alert.");
      }

      const data = await response.json();
      setStatusMessage(data.message || "Alert sent successfully.");
    } catch (error) {
      setStatusMessage("There was a problem sending the alert.");
    } finally {
      setIsSending(false);
    }
  }

  function handleReset() {
    setFormData({
      name: "",
      destination: "",
      date: "",
      time: "",
    });
    setIsReady(false);
    setStatusMessage("");
  }

  return (
    <div className="app">
      <div className="card">
        <h1 className="title">Group Alert System</h1>
        <p className="subtitle">
          Enter the trip details, then press the emergency button to notify the group.
        </p>

        {!isReady && (
          <form className="form" onSubmit={handlePrepare}>
            <label>
              Name
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
              />
            </label>

            <label>
              Where are you going?
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                placeholder="Enter destination"
              />
            </label>

            <label>
              Date
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
              />
            </label>

            <label>
              Time
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
              />
            </label>

            <button type="submit" className="prepare-button">
              Continue
            </button>
          </form>
        )}

        {isReady && (
          <div className="alert-section">
            <div className="summary-box">
              <p><strong>Name:</strong> {formData.name}</p>
              <p><strong>Destination:</strong> {formData.destination}</p>
              <p><strong>Date:</strong> {formData.date}</p>
              <p><strong>Time:</strong> {formData.time}</p>
            </div>

            <button
              className="red-button"
              onClick={handleEmergencySend}
              disabled={isSending}
            >
              {isSending ? "SENDING..." : "SEND ALERT"}
            </button>

            <button className="back-button" onClick={handleReset}>
              Edit Details
            </button>
          </div>
        )}

        {statusMessage && <p className="status-message">{statusMessage}</p>}
      </div>
    </div>
  );
}