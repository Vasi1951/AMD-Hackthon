import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { AuthProvider } from '../contexts/AuthContext';
import { ToastProvider } from '../contexts/ToastContext';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="dark w-full h-screen bg-midnight">
          <RouterProvider router={router} />
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}
