import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'

const GOOGLE_CLIENT_ID = '765922098744-muhekk0quv3k34tc4oljbi3b09k9in9u.apps.googleusercontent.com'

function getPasswordStrength(pw) {
  if (!pw) return null
  let s = 0
  if (pw.length >= 8)           s += 25
  if (pw.length >= 12)          s += 15
  if (/[A-Z]/.test(pw))         s += 20
  if (/[0-9]/.test(pw))         s += 20
  if (/[^A-Za-z0-9]/.test(pw))  s += 20
  if (s <= 33) return { label: 'Weak',   barColor: 'bg-red-500',    labelColor: 'text-red-500',    widthClass: 'w-1/3'  }
  if (s <= 66) return { label: 'Medium', barColor: 'bg-yellow-400', labelColor: 'text-yellow-600', widthClass: 'w-2/3'  }
  return               { label: 'Strong', barColor: 'bg-[#009A44]',  labelColor: 'text-[#009A44]',  widthClass: 'w-full' }
}

const EyeOpenIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const EyeClosedIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.477 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
)

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

const AppleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
)

function InputField({ label, id, type = 'text', value, onChange, placeholder, required, optional, rightElement }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {optional && <span className="text-gray-400 font-normal">(optional)</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#009A44] focus:border-transparent transition-shadow"
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
    </div>
  )
}

export default function SignInPage() {
  const navigate = useNavigate()
  const { signIn, register, googleSignIn } = useAuth()

  const [mode, setMode] = useState('signin')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Sign In fields
  const [siEmail, setSiEmail] = useState('')
  const [siPassword, setSiPassword] = useState('')
  const [showSiPw, setShowSiPw] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  // Register fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [showRegPw, setShowRegPw] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [phone, setPhone] = useState('')
  const [dob, setDob] = useState('')
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [subscribeOffers, setSubscribeOffers] = useState(false)

  const strength = getPasswordStrength(regPassword)

  function decodeJWT(token) {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(window.atob(base64))
  }

  function handleGoogleResponse(response) {
    try {
      const payload = decodeJWT(response.credential)
      const name = payload.given_name || payload.name || 'User'
      const email = payload.email || ''
      googleSignIn(name, email)
      navigate('/store-select')
    } catch {
      setError('Google sign-in failed. Please try again.')
    }
  }

  useEffect(() => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      })
    }
  }, [])
  function handleGoogleButtonClick() {
    const clientId = '765922098744-muhekk0quv3k34tc4oljbi3b09k9in9u.apps.googleusercontent.com'
    const redirectUri = encodeURIComponent('https://subway-ai-9gfb.vercel.app/signin')
    const scope = encodeURIComponent('email profile openid')
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}&prompt=select_account`
    window.location.href = authUrl
  }
  function switchMode(m) {
    setMode(m)
    setError('')
  }

  function handleSignIn(e) {
    e.preventDefault()
    setError('')
    if (!siEmail || !siPassword) { setError('Please enter your email and password.'); return }
    setLoading(true)
    const result = signIn(siEmail, siPassword)
    setLoading(false)
    if (result.success) navigate('/store-select')
    else setError(result.error)
  }

  function handleRegister(e) {
    e.preventDefault()
    setError('')
    if (!firstName || !lastName || !regEmail || !regPassword || !confirmPassword) {
      setError('Please fill in all required fields.')
      return
    }
    if (regPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (!agreeToTerms) {
      setError('You must agree to the Terms and Conditions.')
      return
    }
    setLoading(true)
    const result = register(firstName, lastName, regEmail, regPassword)
    setLoading(false)
    if (result.success) navigate('/store-select')
    else setError(result.error)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="bg-[#009A44] rounded px-3 py-1.5">
              <span className="text-white font-black text-2xl tracking-tight">SUBWAY</span>
            </div>
          </div>

          {/* Error alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm mb-5 flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* ── SIGN IN FORM ── */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} noValidate>
              <h1 className="text-xl font-black text-gray-900 mb-6 text-center">Welcome back</h1>

              <div className="space-y-4">
                <InputField
                  label="Email address" id="si-email" type="email"
                  value={siEmail} onChange={e => setSiEmail(e.target.value)}
                  placeholder="you@example.com" required
                />
                <InputField
                  label="Password" id="si-password"
                  type={showSiPw ? 'text' : 'password'}
                  value={siPassword} onChange={e => setSiPassword(e.target.value)}
                  placeholder="••••••••" required
                  rightElement={
                    <button type="button" onClick={() => setShowSiPw(!showSiPw)} className="text-gray-400 hover:text-gray-600">
                      {showSiPw ? <EyeClosedIcon /> : <EyeOpenIcon />}
                    </button>
                  }
                />
              </div>

              <div className="flex items-center justify-between mt-4 mb-6">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="accent-[#009A44] w-4 h-4" />
                  Remember me
                </label>
                <button type="button" className="text-sm text-[#009A44] hover:underline font-medium">
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#009A44] text-white font-bold py-3 rounded-full hover:bg-[#007A36] transition-colors disabled:opacity-60 text-sm"
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-gray-400 text-xs">or continue with</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Social buttons */}
              <div className="space-y-3">
                <button type="button" onClick={handleGoogleButtonClick} className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-full py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm transition-colors">
                  <GoogleIcon />
                  Continue with Google
                </button>
                <button type="button" className="w-full flex items-center justify-center gap-3 bg-black text-white rounded-full py-2.5 px-4 hover:bg-gray-900 font-medium text-sm transition-colors">
                  <AppleIcon />
                  Continue with Apple
                </button>
              </div>

              <p className="text-center text-sm text-gray-500 mt-6">
                Don't have an account?{' '}
                <button type="button" onClick={() => switchMode('register')} className="text-[#009A44] font-semibold hover:underline">
                  Join Now
                </button>
              </p>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} noValidate>
              <h1 className="text-xl font-black text-gray-900 mb-6 text-center">Create your account</h1>

              <div className="space-y-4">
                {/* Name row */}
                <div className="grid grid-cols-2 gap-3">
                  <InputField
                    label="First name" id="reg-first"
                    value={firstName} onChange={e => setFirstName(e.target.value)}
                    placeholder="Krishna" required
                  />
                  <InputField
                    label="Last name" id="reg-last"
                    value={lastName} onChange={e => setLastName(e.target.value)}
                    placeholder="Patel" required
                  />
                </div>

                <InputField
                  label="Email address" id="reg-email" type="email"
                  value={regEmail} onChange={e => setRegEmail(e.target.value)}
                  placeholder="you@example.com" required
                />

                {/* Password with strength */}
                <div>
                  <label htmlFor="reg-pw" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      id="reg-pw"
                      type={showRegPw ? 'text' : 'password'}
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      required
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#009A44] focus:border-transparent"
                    />
                    <button type="button" onClick={() => setShowRegPw(!showRegPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showRegPw ? <EyeClosedIcon /> : <EyeOpenIcon />}
                    </button>
                  </div>
                  {regPassword.length > 0 && strength && (
                    <div className="mt-1.5">
                      <div className="bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-300 ${strength.barColor} ${strength.widthClass}`} />
                      </div>
                      <p className={`text-xs mt-1 font-medium ${strength.labelColor}`}>{strength.label}</p>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <InputField
                  label="Confirm password" id="reg-confirm"
                  type={showConfirmPw ? 'text' : 'password'}
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password" required
                  rightElement={
                    <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="text-gray-400 hover:text-gray-600">
                      {showConfirmPw ? <EyeClosedIcon /> : <EyeOpenIcon />}
                    </button>
                  }
                />

                {confirmPassword.length > 0 && regPassword !== confirmPassword && (
                  <p className="text-xs text-red-500 -mt-2">Passwords do not match</p>
                )}

                <InputField
                  label="Phone number" id="reg-phone" type="tel"
                  value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+1 (416) 555-0100" optional
                />

                <InputField
                  label="Date of birth" id="reg-dob" type="date"
                  value={dob} onChange={e => setDob(e.target.value)}
                  optional
                />
                <p className="text-xs text-gray-400 -mt-2">Used for your birthday reward 🎂</p>
              </div>

              {/* Checkboxes */}
              <div className="mt-5 space-y-3">
                <label className="flex items-start gap-2.5 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={agreeToTerms} onChange={e => setAgreeToTerms(e.target.checked)} className="accent-[#009A44] w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>I agree to the <span className="text-[#009A44] font-medium hover:underline cursor-pointer">Terms and Conditions</span> and <span className="text-[#009A44] font-medium hover:underline cursor-pointer">Privacy Policy</span></span>
                </label>
                <label className="flex items-start gap-2.5 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={subscribeOffers} onChange={e => setSubscribeOffers(e.target.checked)} className="accent-[#009A44] w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Sign me up for exclusive offers, deals, and Subway Rewards news</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-[#009A44] text-white font-bold py-3 rounded-full hover:bg-[#007A36] transition-colors disabled:opacity-60 text-sm"
              >
                {loading ? 'Creating account…' : 'Create Account'}
              </button>

              <p className="text-center text-sm text-gray-500 mt-5">
                Already have an account?{' '}
                <button type="button" onClick={() => switchMode('signin')} className="text-[#009A44] font-semibold hover:underline">
                  Sign In
                </button>
              </p>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
