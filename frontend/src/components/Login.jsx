import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL_V2}/auth/login`, { email, password });
            login(data);
            navigate('/nextgen');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="vh-100 d-flex align-items-center justify-content-center bg-light">
            <div className="card shadow-sm border-0 p-4" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 className="text-center mb-4 fw-bold text-primary">Sign In</h2>
                {error && <div className="alert alert-danger p-2 small">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label small fw-bold">Email</label>
                        <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="mb-4">
                        <label className="form-label small fw-bold">Password</label>
                        <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-primary w-100 fw-bold py-2 mb-3">Continue</button>
                </form>
                <p className="text-center small text-muted">
                    New here? <Link to="/register" className="text-decoration-none text-primary fw-bold">Create an account</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;