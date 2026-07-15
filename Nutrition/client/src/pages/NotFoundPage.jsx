import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return <div className="not-found"><div className="brand-mark big"><i className="bi bi-flower1" /></div><h1>Page not found</h1><p>That page wandered off the meal plan.</p><Link className="btn btn-primary" to="/">Back to dashboard</Link></div>;
}
