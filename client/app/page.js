"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // "login" or "register"
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [terms, setTerms] = useState(false);
  const [remember, setRemember] = useState(false);

  // Card stack state
  const [currentStack, setCurrentStack] = useState([]);
  const [animatingCard, setAnimatingCard] = useState(null);

  const features = [
    { id: 1, title: "Document Management", icon: "fa-file-lines", desc: "Centralized repository for secure file storage and instant retrieval." },
    { id: 2, title: "Secure Access Control", icon: "fa-shield-halved", desc: "Granular permissions ensuring sensitive data remains protected." },
    { id: 3, title: "Workflow Automation", icon: "fa-code-branch", desc: "Automate repetitive tasks and approval chains dynamically." },
  ];

  useEffect(() => {
    setCurrentStack([...features]);
  }, []);

  const openLogin = () => {
    setAuthMode("login");
    setShowAuthModal(true);
    setError("");
  };

  const openRegister = () => {
    setAuthMode("register");
    setShowAuthModal(true);
    setError("");
  };

  const closeModal = () => {
    setShowAuthModal(false);
    setError("");
  };

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(loginData);
      if (data.user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!terms) {
      setError("You must agree to the terms");
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...userData } = registerData;
      await register(userData);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Card stack animation
  const popTopCard = () => {
    if (currentStack.length <= 1 || animatingCard !== null) {
      if (currentStack.length <= 1) {
        setCurrentStack([...features]);
      }
      return;
    }

    setAnimatingCard(0);
    
    setTimeout(() => {
      setCurrentStack(prev => {
        const newStack = [...prev];
        const removed = newStack.shift();
        newStack.push(removed);
        return newStack;
      });
      setAnimatingCard(null);
    }, 500);
  };

  const resetStack = () => {
    setCurrentStack([...features]);
    setAnimatingCard(null);
  };

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Operations Director",
      company: "TechCorp Inc.",
      image: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=366189&color=fff",
      quote: "Docflow transformed how we manage documents. The workflow automation alone saved us 20+ hours per week.",
    },
    {
      name: "Michael Chen",
      role: "IT Manager",
      company: "Global Finance Ltd.",
      image: "https://ui-avatars.com/api/?name=Michael+Chen&background=2c5270&color=fff",
      quote: "The security features and audit trails give us complete confidence in compliance. Highly recommended!",
    },
    {
      name: "Emily Rodriguez",
      role: "Department Head",
      company: "University of State",
      image: "https://ui-avatars.com/api/?name=Emily+Rodriguez&background=4a7ca5&color=fff",
      quote: "Managing academic documents has never been easier. Our faculty loves the intuitive interface.",
    },
  ];

  return (
    <div className="bg-gray-50 text-gray-900 overflow-x-hidden min-h-screen">
      {/* Header */}
      <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
        <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-layer-group text-2xl text-[#366189]"></i>
            <span className="text-2xl font-bold text-gray-900">Docflow</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-[#366189] transition">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-[#366189] transition">How It Works</a>
            <a href="#testimonials" className="text-gray-600 hover:text-[#366189] transition">Testimonials</a>
            <a href="#contact" className="text-gray-600 hover:text-[#366189] transition">Contact</a>
          </div>
          <div className="flex gap-4">
            <button
              onClick={openLogin}
              className="px-6 py-2 text-gray-700 font-medium hover:text-[#366189] transition cursor-pointer"
            >
              Login
            </button>
            <button
              onClick={openRegister}
              className="px-6 py-2 bg-[#366189] text-white rounded-md hover:bg-[#2c5270] font-medium transition-colors cursor-pointer"
            >
              Sign up
            </button>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section - Content Left, Image Right */}
        <section className="container mx-auto px-6 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block px-4 py-1.5 bg-blue-50 text-[#366189] rounded-full text-sm font-semibold tracking-wide border border-blue-100">
                Enterprise Document & Workflow Management
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900 tracking-tight">
                Streamline Your Documents
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-lg">
                Manage, track, and secure critical enterprise assets with intelligent workflows and centralized access.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <button
                  onClick={openRegister}
                  className="px-8 py-3.5 bg-[#366189] text-white rounded-md hover:bg-[#2c5270] font-semibold text-lg shadow-lg shadow-blue-900/20 transition-all cursor-pointer"
                >
                  Get Started
                </button>
                <button className="px-8 py-3.5 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-semibold text-lg transition-all cursor-pointer">
                  View Demo
                </button>
              </div>
            </div>
            <div className="flex justify-center md:justify-end">
              <div className="relative w-full max-w-md">
                <div className="absolute inset-0 bg-gradient-to-r from-[#366189]/20 to-[#2c5270]/20 rounded-3xl blur-3xl"></div>
                <Image
                  src="/assets/document.png"
                  alt="Document Management"
                  width={400}
                  height={400}
                  className="relative z-10 w-full h-auto drop-shadow-2xl rounded-3xl grayscale-[30%] hover:grayscale-0 transition-all duration-500"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section with Card Stack */}
        <section id="features" className="bg-white py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Core Features</h2>
                <p className="text-lg text-gray-600">
                  Click the top card to cycle through the platform capabilities and explore the toolset.
                </p>
                <button 
                  onClick={resetStack}
                  className="text-[#366189] font-medium hover:underline flex items-center gap-2 cursor-pointer"
                >
                  <i className="fa-solid fa-rotate-right"></i> Reset Stack
                </button>
              </div>

              {/* Card Stack */}
              <div className="relative h-[300px] w-full perspective-[1000px]">
                {[...currentStack].reverse().map((feature, index) => {
                  const stackPosition = currentStack.length - 1 - index;
                  const isAnimating = animatingCard === stackPosition;
                  
                  let transform = "";
                  let zIndex = 10 - stackPosition;
                  let opacity = 1;
                  let shadow = "shadow-xl";

                  if (isAnimating) {
                    transform = "translateX(120%) translateY(-20px) rotate(10deg) scale(0.9)";
                    opacity = 0;
                    zIndex = 20;
                  } else if (stackPosition === 0) {
                    transform = "translateY(0) scale(1)";
                    shadow = "shadow-2xl";
                  } else if (stackPosition === 1) {
                    transform = "translateY(20px) translateX(15px) scale(0.95)";
                    shadow = "shadow-lg";
                  } else if (stackPosition === 2) {
                    transform = "translateY(40px) translateX(30px) scale(0.90)";
                    shadow = "shadow-md";
                  }

                  return (
                    <div
                      key={feature.id}
                      onClick={() => stackPosition === 0 && popTopCard()}
                      className={`absolute top-0 left-0 w-full h-full bg-white rounded-2xl border border-gray-200 ${shadow} p-8 flex flex-col justify-center transition-all duration-500 ease-in-out ${
                        stackPosition === 0 ? "cursor-pointer hover:shadow-2xl" : ""
                      }`}
                      style={{
                        zIndex,
                        transform,
                        opacity,
                      }}
                    >
                      <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-6">
                        <i className={`fa-solid ${feature.icon} text-2xl text-[#366189]`}></i>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                      
                      {stackPosition === 0 && !isAnimating && (
                        <div className="absolute bottom-6 right-8 text-sm text-gray-400 font-medium tracking-widest">
                          <i className="fa-solid fa-hand-pointer mr-2"></i> CLICK TO ADVANCE
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
              <p className="text-lg text-gray-600">A seamless flow from ingestion to execution.</p>
            </div>
            <div className="grid md:grid-cols-4 gap-8 relative">
              {/* Pipeline connector */}
              <div className="hidden md:block absolute top-8 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-gray-200 via-[#366189]/30 to-gray-200"></div>

              {[
                { icon: "fa-cloud-arrow-up", title: "Upload", desc: "Securely import documents into the centralized repository." },
                { icon: "fa-folder-tree", title: "Organize", desc: "Sort into structured folders and categorize by meta-tags." },
                { icon: "fa-gears", title: "Set Rules", desc: "Establish conditional logic and automated routing protocols." },
                { icon: "fa-chart-line", title: "Track Progress", desc: "Monitor approval stages and audit trails in real-time." },
              ].map((step, index) => (
                <div key={index} className="relative z-10 flex flex-col items-center text-center space-y-4 group">
                  <div className="w-16 h-16 bg-white rounded-full border-4 border-gray-100 flex items-center justify-center shadow-sm group-hover:border-[#366189] transition-colors duration-300">
                    <i className={`fa-solid ${step.icon} text-2xl text-gray-400 group-hover:text-[#366189] transition-colors`}></i>
                  </div>
                  <h3 className="font-bold text-xl text-gray-900">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Built for Scale Section */}
        <section className="bg-white py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-gray-50 to-white p-12 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 text-center border-b border-gray-100 pb-8 mb-8">
                Built for Scale
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center px-4 space-y-3">
                  <i className="fa-solid fa-building text-3xl text-[#366189] mb-2"></i>
                  <h3 className="text-xl font-bold text-gray-900">Businesses & Enterprise</h3>
                </div>
                <div className="text-center px-4 space-y-3 md:border-x border-gray-100">
                  <i className="fa-solid fa-landmark text-3xl text-[#366189] mb-2"></i>
                  <h3 className="text-xl font-bold text-gray-900">Government Offices</h3>
                </div>
                <div className="text-center px-4 space-y-3">
                  <i className="fa-solid fa-graduation-cap text-3xl text-[#366189] mb-2"></i>
                  <h3 className="text-xl font-bold text-gray-900">Schools & Universities</h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Clients Say</h2>
              <p className="text-lg text-gray-600">Trusted by organizations worldwide</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-14 h-14 rounded-full"
                    />
                    <div>
                      <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                      <p className="text-sm text-[#366189]">{testimonial.company}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div className="flex gap-1 mt-4">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className="fa-solid fa-star text-yellow-400 text-sm"></i>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Get in Touch</h2>
                <p className="text-lg text-gray-600">Have questions? We&apos;d love to hear from you.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-envelope text-[#366189]"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Email</h4>
                      <p className="text-gray-600">support@docflow.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-phone text-[#366189]"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Phone</h4>
                      <p className="text-gray-600">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-location-dot text-[#366189]"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Address</h4>
                      <p className="text-gray-600">123 Business Avenue<br />Suite 100, New York, NY 10001</p>
                    </div>
                  </div>
                </div>
                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#366189]/20 focus:border-[#366189] outline-none transition"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#366189]/20 focus:border-[#366189] outline-none transition"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <textarea
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#366189]/20 focus:border-[#366189] outline-none transition resize-none"
                      placeholder="Your message..."
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-[#366189] text-white rounded-lg hover:bg-[#2c5270] font-semibold transition-colors cursor-pointer"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <i className="fa-solid fa-layer-group text-2xl text-white"></i>
                <span className="text-xl font-bold text-white">Docflow</span>
              </div>
              <p className="text-sm">Enterprise Document & Workflow Management System</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#contact" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Connect</h4>
              <div className="flex gap-4">
                <a href="#" className="hover:text-white transition"><i className="fa-brands fa-twitter"></i></a>
                <a href="#" className="hover:text-white transition"><i className="fa-brands fa-linkedin"></i></a>
                <a href="#" className="hover:text-white transition"><i className="fa-brands fa-github"></i></a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Docflow EDWMS. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative z-10 w-full max-w-md mx-4">
            <button
              onClick={closeModal}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-2xl"></i>
            </button>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            
            {authMode === "login" ? (
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Login</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#366189]/20 focus:border-[#366189] outline-none transition"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#366189]/20 focus:border-[#366189] outline-none transition"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="w-4 h-4 text-[#366189] border-gray-300 rounded focus:ring-[#366189]"
                      />
                      <span className="text-gray-600">Remember me</span>
                    </label>
                    <span className="text-[#366189] cursor-pointer hover:underline">Forgot password?</span>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-3 bg-[#366189] text-white rounded-lg hover:bg-[#2c5270] font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </button>
                </form>
                <p className="text-center text-sm text-gray-600 mt-6">
                  Don&apos;t have an account?{" "}
                  <button
                    onClick={() => setAuthMode("register")}
                    className="text-[#366189] font-medium hover:underline cursor-pointer"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Create Account</h2>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={registerData.name}
                      onChange={handleRegisterChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#366189]/20 focus:border-[#366189] outline-none transition"
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#366189]/20 focus:border-[#366189] outline-none transition"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#366189]/20 focus:border-[#366189] outline-none transition"
                      placeholder="Create a password"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={registerData.confirmPassword}
                      onChange={handleRegisterChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#366189]/20 focus:border-[#366189] outline-none transition"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                  <div className="flex items-center text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={terms}
                        onChange={(e) => setTerms(e.target.checked)}
                        className="w-4 h-4 text-[#366189] border-gray-300 rounded focus:ring-[#366189]"
                      />
                      <span className="text-gray-600">I agree to the terms and conditions</span>
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-3 bg-[#366189] text-white rounded-lg hover:bg-[#2c5270] font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Creating account..." : "Create Account"}
                  </button>
                </form>
                <p className="text-center text-sm text-gray-600 mt-6">
                  Already have an account?{" "}
                  <button
                    onClick={() => setAuthMode("login")}
                    className="text-[#366189] font-medium hover:underline cursor-pointer"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
