import { useEffect, useState } from "react";
import { apiUrl } from "../api";

export default function RespondAlert() {
  const [latestAlert, setLatestAlert] = useState(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    async function fetchLatestAlert() {
      try {
        const response = await fetch(apiUrl("/api/alerts/latest"));
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error
              ? `${data.message || "Failed to load latest alert."} (${data.error})`
              : data.message || "Failed to load latest alert."
          );
        }

        setLatestAlert(data.alert);
      } catch (error) {
        setStatusMessage(error.message || "Could not load the latest alert.");
      } finally {
        setLoading(false);
      }
    }

    fetchLatestAlert();
  }, []);

  async function sendResponse(answer) {
    if (!name.trim()) {
      setStatusMessage("Please enter your name first.");
      return;
    }

    if (!latestAlert) {
      setStatusMessage("No alert is available.");
      return;
    }

    setSending(true);
    setStatusMessage("");

    try {
      const response = await fetch(apiUrl("/api/alerts/respond"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          alertId: latestAlert.id,
          name: name.trim(),
          response: answer,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error
            ? `${data.message || "Failed to send response."} (${data.error})`
            : data.message || "Failed to send response."
        );
      }

      setStatusMessage(data.message || `Response recorded: ${answer}`);
    } catch (error) {
      setStatusMessage(error.message || "There was a problem sending your response.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="app">
      <div className="card">
        <h1 className="title">Respond to Latest Alert</h1>
        <p className="subtitle">
          Confirm whether you are going downtown or not for the most recent alert.
        </p>

        {loading && <p className="status-message">Loading latest alert...</p>}

        {!loading && latestAlert && (
          <div className="response-page-content">
            <div className="summary-box">
              <p><strong>From:</strong> {latestAlert.name}</p>
              <p><strong>Destination:</strong> {latestAlert.destination}</p>
              <p><strong>Date:</strong> {latestAlert.date}</p>
              <p><strong>Time:</strong> {latestAlert.time}</p>
            </div>

            <div className="name-entry">
              <label>
                Your Name
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                />
              </label>
            </div>

            <div className="response-buttons">
              <button
                className="yes-button"
                onClick={() => sendResponse("yes")}
                disabled={sending}
              >
                {sending ? "SENDING..." : "YES"}
              </button>

              <button
                className="no-button"
                onClick={() => sendResponse("no")}
                disabled={sending}
              >
                {sending ? "SENDING..." : "NO"}
              </button>
            </div>
          </div>
        )}

        {!loading && !latestAlert && !statusMessage && (
          <p className="status-message">No recent alert found.</p>
        )}

        {statusMessage && <p className="status-message">{statusMessage}</p>}
      </div>
    </div>
  );
}
