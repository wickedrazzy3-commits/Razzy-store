'use client';
import { useState } from 'react';
export default function DemoBank() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [msg, setMsg] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  // Randomly generated educational transaction history
  const [transactions] = useState(() => {
    const types = ['Deposit', 'Withdrawal', 'Payment', 'Refund'];
    return Array.from({ length: 10 }, (_, i) => ({
      id: `DEMO-${i}-${Date.now()}`,
      type: types[Math.floor(Math.random() * types.length)],
      amount: Math.floor(Math.random() * 900) + 100,
      status: Math.random() > 0.2 ? 'Completed' : 'Pending',
      date: new Date(
        Date.now() - Math.floor(Math.random() * 30) * 86400000
      ).toLocaleDateString(),
    }));
  });
  const getSupabase = async () => {
    try {
      const m = await import('../lib/supabase');
      return m.supabase;
    } catch {
      return null;
    }
  };
  // Login
  const login = async () => {
    setMsg('Checking...');
    const sb = await getSupabase();
    if (!sb) {
      setMsg('Connect Supabase first');
      return;
    }
    const r = await sb
      .from('demo_users')
      .select('*')
      .eq('username', username.trim())
      .eq('password', password.trim())
      .single();
    if (r.error || !r.data) {
      setMsg('Wrong login!');
      return;
    }
    setUser(r.data);
    setMsg('');
  };
  // Refresh account balance
  const refresh = async () => {
    if (!user) return;
    const sb = await getSupabase();
    if (!sb) {
      setMsg('Supabase connection failed');
      return;
    }
    const r = await sb
      .from('demo_users')
      .select('*')
      .eq('id', user.id)
      .single();
    if (r.error || !r.data) {
      setMsg('Could not refresh balance');
      return;
    }
    setUser(r.data);
    setMsg('Balance refreshed successfully');
  };
  // Simulated deposit
  const deposit = async () => {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setMsg('Enter a valid deposit amount');
      return;
    }
    if (Math.round(value * 100) !== value * 100) {
      setMsg('Use no more than 2 decimal places');
      return;
    }
    setLoading(true);
    setMsg('');
    try {
      const sb = await getSupabase();
      if (!sb) {
        setMsg('Connect Supabase first');
        return;
      }
      const current = await sb
        .from('demo_users')
        .select('id, balance')
        .eq('id', user.id)
        .single();
      if (current.error || !current.data) {
        setMsg('Unable to retrieve account balance');
        return;
      }
      const balance = Number(current.data.balance || 0);
      if (!Number.isFinite(balance) || balance < 0) {
        setMsg('Invalid account balance');
        return;
      }
      const newBalance = Number((balance + value).toFixed(2));
      const result = await sb
        .from('demo_users')
        .update({ balance: newBalance })
        .eq('id', user.id)
        .select('*')
        .single();
      if (result.error || !result.data) {
        setMsg('Deposit failed');
        return;
      }
      setUser(result.data);
      setAmount('');
      setMsg(
        `Demo deposit successful: $${value.toFixed(2)}`
      );
    } catch {
      setMsg('Something went wrong');
    } finally {
      setLoading(false);
    }
  };
  // Login screen
  if (!user) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#0f172a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            background: 'white',
            padding: 24,
            borderRadius: 16,
            width: 360,
            maxWidth: '100%',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 26, letterSpacing: 1 }}>
              ZENOBANK
            </h2>
            <p style={{ fontSize: 13, color: '#444', marginTop: 6 }}>
              Login here
            </p>
          </div>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            autoComplete="username"
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 8,
              border: '1px solid #ddd',
              marginTop: 12,
              boxSizing: 'border-box',
            }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 8,
              border: '1px solid #ddd',
              marginTop: 8,
              boxSizing: 'border-box',
            }}
          />
          <button
            onClick={login}
            style={{
              width: '100%',
              background: 'black',
              color: 'white',
              padding: 12,
              borderRadius: 8,
              border: 0,
              marginTop: 16,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Login
          </button>
          {msg && (
            <div
              role="status"
              style={{
                marginTop: 10,
                fontSize: 12,
                color: 'red',
                textAlign: 'center',
              }}
            >
              {msg}
            </div>
          )}
          <div
            style={{
              marginTop: 14,
              fontSize: 10,
              color: '#888',
              textAlign: 'center',
            }}
          >
            Zenobank educational simulation
          </div>
        </div>
      </div>
    );
  }
  // Dashboard
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f1f5f9',
        padding: 16,
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          background: 'white',
          padding: 20,
          borderRadius: 16,
          marginTop: 12,
          maxWidth: 520,
          marginInline: 'auto',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        }}
      >
        {/* Account heading */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div>
            <h3 style={{ margin: 0 }}>ZENOBANK</h3>
            <b>Hi, {user.username}</b>
            <br />
            <span style={{ fontSize: 11, color: '#666' }}>
              Account #{user.id}
            </span>
          </div>
          <button
            onClick={() => {
              setUser(null);
              setPassword('');
              setMsg('');
            }}
            style={{
              background: '#eee',
              border: 0,
              padding: '8px 12px',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
        {/* Account balance */}
        <div
          style={{
            marginTop: 16,
            background: '#0f172a',
            color: 'white',
            padding: 20,
            borderRadius: 12,
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            AVAILABLE BALANCE
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 800,
              marginTop: 8,
              overflowWrap: 'anywhere',
            }}
          >
            $
            {Number(user.balance || 0).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
        {/* Deposit and withdrawal options */}
        <div style={{ marginTop: 22 }}>
          <h3 style={{ marginBottom: 12 }}>
            Deposit or Withdraw
          </h3>
          <label
            htmlFor="deposit-amount"
            style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 6,
            }}
          >
            Amount (USD)
          </label>
          <input
            id="deposit-amount"
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            style={{
              width: '100%',
              padding: 13,
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              boxSizing: 'border-box',
              fontSize: 16,
            }}
          />
          <div
            style={{
              display: 'flex',
              gap: 10,
              marginTop: 12,
            }}
          >
            <button
              disabled={loading}
              onClick={deposit}
              style={{
                flex: 1,
                background: '#059669',
                color: 'white',
                padding: 13,
                border: 0,
                borderRadius: 8,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Processing...' : '+ Deposit'}
            </button>
            <button
              onClick={() => {
                window.open(
                  'https://t.me/zenobank1',
                  '_blank',
                  'noopener,noreferrer'
                );
              }}
              style={{
                flex: 1,
                background: '#dc2626',
                color: 'white',
                padding: 13,
                border: 0,
                borderRadius: 8,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              - Withdraw
            </button>
          </div>
          {msg && (
            <div
              role="status"
              aria-live="polite"
              style={{
                marginTop: 12,
                padding: 10,
                background: '#f8fafc',
                borderRadius: 8,
                fontSize: 13,
                color: msg.toLowerCase().includes('successful')
                  ? '#047857'
                  : msg.toLowerCase().includes('refreshed')
                    ? '#047857'
                    : '#b91c1c',
                overflowWrap: 'anywhere',
              }}
            >
              {msg}
            </div>
          )}
          <button
            onClick={refresh}
            disabled={loading}
            style={{
              width: '100%',
              marginTop: 12,
              padding: 11,
              borderRadius: 8,
              border: '1px solid #ddd',
              background: 'white',
              cursor: 'pointer',
            }}
          >
            Refresh Balance
          </button>
        </div>
        {/* Random transaction history */}
        <div style={{ marginTop: 28 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <h3 style={{ margin: 0 }}>Transaction History</h3>
            <span
              style={{
                fontSize: 11,
                color: '#64748b',
              }}
            >
              {transactions.length} records
            </span>
          </div>
          {transactions.map((tx) => (
            <div
              key={tx.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 0',
                borderBottom: '1px solid #e5e7eb',
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>
                  {tx.type}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: '#64748b',
                    marginTop: 4,
                  }}
                >
                  {tx.date}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: '#64748b',
                    marginTop: 3,
                  }}
                >
                  Simulated transaction
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>
                  ${tx.amount.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    marginTop: 4,
                    color:
                      tx.status === 'Completed'
                        ? '#059669'
                        : '#d97706',
                  }}
                >
                  {tx.status}
                </div>
              </div>
            </div>
          ))}
          <p
            style={{
              fontSize: 11,
              color: '#64748b',
              marginTop: 14,
              lineHeight: 1.5,
            }}
          >
            Educational demo: transaction records are randomly generated
            and do not represent actual financial activity.
          </p>
        </div>
      </div>
    </div>
  );
}
