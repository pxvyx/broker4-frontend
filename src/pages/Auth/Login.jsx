import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authApi from "../../services/authApi";
import { AuthContext } from "../../contexts/AuthContext";
import { firebaseEnabled, auth } from "../../services/firebaseConfig";
import { signInWithFirebaseEmail } from "../../services/firebaseAuth";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Vui lòng nhập email và mật khẩu.");
      return;
    }

    try {
      setLoading(true);
      let firebaseToken = null;
      if (firebaseEnabled && auth) {
        firebaseToken = await signInWithFirebaseEmail(email, password);
      }
      const data = await authApi.login({ email, password });
      if (firebaseToken) {
        localStorage.setItem("broker_firebase_token", firebaseToken);
      }
      login({ token: data.access_token, user: data.user });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Đăng nhập không thành công. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Đăng nhập</h1>
        <p className="mt-2 text-sm text-gray-500">
          Đăng nhập bằng email và mật khẩu để tiếp tục sử dụng Broker 4.0.
        </p>

        {error && (
          <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              placeholder="your@email.com"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Mật khẩu</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              placeholder="••••••••"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Chưa có tài khoản?{' '}
          <Link to="/auth/register" className="font-semibold text-blue-600 hover:text-blue-700">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
