import { Link } from "react-router-dom";

export default function PageNotFound() {
  return (
    <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
      <h1>404</h1>
      <h2>Page not found</h2>
      <p>The page you requested does not exist or has moved.</p>
      <Link to="/">Go to the home page</Link>
    </div>
  );
}