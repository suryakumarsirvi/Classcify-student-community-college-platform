const checkTokenExpiration = () => {
  const token = localStorage.getItem('studentToken');
  if (token) {
    const decoded = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) {
      console.warn("⚠️ Token expired, but staying logged in.");
      // ❌ Logout mat karo, sirf warning do
    }
  }
};

useEffect(() => {
  checkTokenExpiration();
  const interval = setInterval(checkTokenExpiration, 60000);
  return () => clearInterval(interval);
}, []);
