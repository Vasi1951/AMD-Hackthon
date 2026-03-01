import { createBrowserRouter, Navigate } from "react-router-dom";
import React from "react";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import AppLayout from "./pages/app/AppLayout";
import Home from "./pages/app/Home";
import AIChat from "./pages/app/AIChat";
import SymptomScan from "./pages/app/SymptomScan";
import MentalWellbeing from "./pages/app/MentalWellbeing";
import CityIntelligence from "./pages/app/CityIntelligence";
import Profile from "./pages/app/Profile";
import FoodDiary from "./pages/app/FoodDiary";
import HealthAnalytics from "./pages/app/HealthAnalytics";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('swasthai_token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  { path: "/", Component: Landing },
  { path: "/login", Component: Login },
  { path: "/signup", Component: Signup },
  { path: "/onboarding", element: <ProtectedRoute><Onboarding /></ProtectedRoute> },
  {
    path: "/app",
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { index: true, Component: Home },
      { path: "chat", Component: AIChat },
      { path: "symptoms", Component: SymptomScan },
      { path: "scan", Component: SymptomScan }, // alias
      { path: "mind", Component: MentalWellbeing },
      { path: "mental", Component: MentalWellbeing }, // alias
      { path: "map", Component: CityIntelligence },
      { path: "city", Component: CityIntelligence }, // alias
      { path: "profile", Component: Profile },
      { path: "food", Component: FoodDiary },
      { path: "analytics", Component: HealthAnalytics },
    ],
  },
]);
