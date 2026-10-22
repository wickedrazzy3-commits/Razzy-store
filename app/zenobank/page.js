'use client';
import { useState } from 'react';
export default function DemoBank() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [msg, setMsg] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const getSupabase = async () => {
    try {
      const m = await import('../lib/supabase');
      return m.supabase;
    } catch {
      return null;
    }
  };
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
  const refresh = async () => {
    const sb = await getSupabase();
    if (!sb || !user) {
      setMsg('Unable to connect to Supabase');
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
  const transact = async (type) => {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setMsg('Enter a valid amount');
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
      if (type === 'withdraw' && value > balance) {
        setMsg('Insufficient balance');
        return;
      }
      const newBalance =
        type === 'deposit'
          ? balance + value
          : balance - value;
      const result = await sb
        .from('demo_users')
        .update({ balance: Number(newBalance.toFixed(2)) })
        .eq('id', user.id)
        .select('*')
        .single();
      if (result.error || !result.data) {
        setMsg('Transaction failed');
        return;
      }
      setUser(result.data);
      setAmount('');
      setMsg(
        type === 'deposit'
          ? `Deposit successful: $${value.toFixed(2)}`
          : `Withdrawal successful: $${value.toFixed(2)}`
      );
    } catch {
      setMsg('Something went wrong');
    } finally {
      setLoading(false);
    }
  };
  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        fontFamily: 'sans-serif'
      }}>
        <div style={{
          background: 'white',
          padding: 24,
          borderRadius: 16,
          width: 360,
          maxWidth: '100%'
        }}>
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
            onChange={e => setUsername(e.target.value)}
            placeholder="Username"
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 8,
              border: '1px solid #ddd',
              marginTop: 12,
              boxSizing: 'border-box'
            }}
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 8,
              border: '1px solid #ddd',
              marginTop: 8,
              boxSizing: 'border-box'
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
              fontWeight: 800
            }}
          >
            Login
          </button>
          {msg && (
            <div style={{
              marginTop: 10,
              fontSize: 12,
              color: 'red',
              textAlign: 'center'
            }}>
              {msg}
            </div>
          )}
          <div style={{
            marginTop: 14,
            fontSize: 10,
            color: '#888',
            textAlign: 'center'
          }}>
            Zenobank simulation
          </div>
        </div>
      </div>
    );
  }
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f1f5f9',
      padding: 16,
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        background: 'white',
        padding: 20,
        borderRadius: 16,
        marginTop: 12,
        maxWidth: 500,
        marginInline: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
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
              borderRadius: 6
            }}
          >
            Logout
          </button>
        </div>
        <div style={{
          marginTop: 16,
          background: '#0f172a',
          color: 'white',
          padding: 20,
          borderRadius: 12
        }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            AVAILABLE BALANCE
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, marginTop: 8 }}>
            ${Number(user.balance || 0).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </div>
        </div>
        <div style={{ marginTop: 22 }}>
          <h3>Deposit or Withdraw</h3>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="Enter amount in USD"
            style={{
              width: '100%',
              padding: 13,
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              boxSizing: 'border-box',
              fontSize: 16
            }}
          />
          <div style={{
            display: 'flex',
            gap: 10,
            marginTop: 12
          }}>
            <button
              disabled={loading}
              onClick={() => transact('deposit')}
              style={{
                flex: 1,
                background: '#059669',
                color: 'white',
                padding: 13,
                border: 0,
                borderRadius: 8,
                fontWeight: 700
              }}
            >
              {loading ? 'Processing...' : '+ Deposit'}
            </button>
            <button
              disabled={loading}
              onClick={() => transact('withdraw')}
              style={{
                flex: 1,
                background: '#dc2626',
                color: 'white',
                padding: 13,
                border: 0,
                borderRadius: 8,
                fontWeight: 700
              }}
            >
              {loading ? 'Processing...' : '- Withdraw'}
            </button>
          </div>
          {msg && (
            <p style={{
              marginTop: 12,
              fontSize: 13,
              color: msg.includes('successful')
                ? '#047857'
                : '#b91c1c'
            }}>
              {msg}
            </p>
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
              background: 'white'
            }}
          >
            Refresh Balance
          </button>
        </div>
        <div style={{
          marginTop: 20,
          padding: 10,
          background: '#fffbeb',
          color: '#92400e',
          borderRadius: 8,
          fontSize: 11
        }}>
          Demo mode: deposits and withdrawals update simulated balances only.
          No real money is transferred.
        </div>
      </div>
    </div>
  );
}
