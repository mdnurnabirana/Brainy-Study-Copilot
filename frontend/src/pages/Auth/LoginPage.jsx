import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "./../context/AuthContext";
import authService from "./../services/authService";
import { BrainCircuit, Mail, Lock, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [email, setEmail] = useState("alex@itmetoprogram.com");
  const [password, setPassword] = useState("Test@123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authService.login(email, password);
      login(result.data.user, result.data.token);
      toast.success("Logged in successfully!");
      navigate("/dashboard");
    } catch (err) {
      const errorMessage =
        err.error ||
        err.message ||
        "Failed to login. Please check your credentials.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return <div>LoginPage</div>;
};

export default LoginPage;