import React from 'react';

export default function ToastContainer({ toasts, removeToast }) {
  const iconMap = {
    success: 'fa-circle-check',
    danger: 'fa-circle-exclamation',
    info: 'fa-circle-info'
  };

  return (
    <aside id="toast-container" className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <i className={`fa-solid ${iconMap[toast.type] || 'fa-circle-info'} toast-icon`}></i>
          <div className="toast-content">
            <div className="toast-title">{toast.title}</div>
            <div className="toast-message">{toast.message}</div>
          </div>
          <button
            className="toast-close"
            onClick={() => removeToast(toast.id)}
            aria-label="Close notification"
          >
            &times;
          </button>
        </div>
      ))}
    </aside>
  );
}
