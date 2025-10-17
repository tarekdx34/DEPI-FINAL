import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import authIllustration from "@/assets/auth-travel-illustration.jpg";
import registerIllustration from "@/assets/auth-register-illustration.jpg";
import { z } from "zod";

const emailSchema = z.string().email("Invalid email address").max(255, "Email too long");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters").max(100, "Password too long");
const firstNameSchema = z.string().min(2, "First name must be at least 2 characters");
const lastNameSchema = z.string().min(2, "Last name must be at least 2 characters");
const ageSchema = z.number().min(18, "You must be at least 18 years old").max(120, "Please enter a valid age");

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validateInputs = () => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      
      if (!isLogin) {
        firstNameSchema.parse(firstName);
        lastNameSchema.parse(lastName);
        ageSchema.parse(parseInt(age));
      }
      
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInputs()) return;

    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Invalid email or password");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Welcome back!");
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              first_name: firstName,
              last_name: lastName,
              age: parseInt(age),
            },
          },
        });

        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("This email is already registered. Please login instead.");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Account created! You can now login.");
          setIsLogin(true);
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="grid lg:grid-cols-2">
          {/* Left Side - Form */}
          <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-gradient-to-br from-slate-50 to-blue-50/30">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-slate-800 mb-2">
                {isLogin ? "Login" : "Register"}
              </h1>
              <p className="text-slate-600">
                {isLogin
                  ? "If You Are Already A Member, Easily Log In"
                  : "Create An Account To Get Started"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        disabled={isLoading}
                        className="h-14 bg-white border-slate-200 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        disabled={isLoading}
                        className="h-14 bg-white border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Input
                      id="age"
                      type="number"
                      placeholder="Age"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      required
                      min="18"
                      max="120"
                      disabled={isLoading}
                      className="h-14 bg-white border-slate-200 rounded-xl"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-14 bg-white border-slate-200 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-14 bg-white border-slate-200 rounded-xl pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 text-base bg-slate-700 hover:bg-slate-800 text-white rounded-xl font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Please wait..." : isLogin ? "Login" : "Register"}
              </Button>
            </form>

            {isLogin && (
              <button
                type="button"
                className="text-sm text-slate-600 hover:text-slate-800 mt-4 text-center w-full"
              >
                Forgot my password
              </button>
            )}

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-slate-50 px-4 text-slate-500 font-medium">
                  OR
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-14 text-base border-slate-200 bg-white hover:bg-slate-50 rounded-xl font-medium"
              disabled={isLoading}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Login with Google
            </Button>

            <div className="mt-6 text-center text-sm text-slate-600">
              {isLogin ? "If You Don't Have An Account, " : "Already Have An Account? "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                disabled={isLoading}
                className="text-slate-800 font-semibold hover:underline"
              >
                {isLogin ? "Register" : "Login"}
              </button>
            </div>
          </div>

          {/* Right Side - Illustration */}
          <div
            className="hidden lg:block bg-cover bg-center relative rounded-r-3xl overflow-hidden"
            style={{
              backgroundImage: `url(${isLogin ? authIllustration : registerIllustration})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 to-blue-900/40"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
