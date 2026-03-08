import { useState, useEffect } from 'react';

let toastFn = null;
export const toast = (msg, type = 'default') => toastFn && toastFn(msg, type);

export default function Toast() {
  const [msg, setMsg] = useState(null);
  const [type, setType] = useState('default');

  useEffect(() => {
    toastFn = (m, t) => {
      setMsg(m); setType(t);
      setTimeout(() => setMsg(null), 3000);
    };
  }, []);

  if (!msg) return null;
  return <div className={`toast ${type}`}>{msg}</div>;
}
