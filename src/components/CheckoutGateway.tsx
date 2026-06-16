import React from 'react';
import { motion } from 'motion/react';
import { Shield, Sparkles, X, RefreshCw, CheckSquare, Megaphone, CheckCircle, Check } from 'lucide-react';
import { Course, PurchaseOrder } from '../types';

export const KBZPayIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full rounded-lg shrink-0 shadow-xs inline-block">
    <rect width="100" height="100" rx="20" fill="#005bab" />
    <text x="12" y="44" fill="white" fontFamily="sans-serif" fontSize="28" fontWeight="900" letterSpacing="-1">KBZ</text>
    <polygon points="76,20 84,20 84,28" fill="white" />
    <polygon points="16,56 24,56 16,64" fill="white" />
    <text x="35" y="80" fill="white" fontFamily="sans-serif" fontSize="30" fontWeight="500">Pay</text>
  </svg>
);

export const WavePayIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full rounded-lg shrink-0 shadow-xs inline-block">
    <rect width="100" height="100" rx="20" fill="#df1f26" />
    <path d="M22,50 C22,30 38,18 50,18 C65,18 78,35 78,50 C78,68 62,82 50,82 C35,82 22,65 22,50" fill="none" stroke="white" strokeWidth="12" strokeLinecap="round" />
    <path d="M38,45 C45,35 55,35 62,45" fill="none" stroke="white" strokeWidth="8" strokeLinecap="round" />
  </svg>
);

export const CBPayIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full rounded-lg shrink-0 bg-white border border-gray-150 p-1 shadow-xs inline-block">
    <path d="M15 70 A35 35 0 0 1 85 70" fill="none" stroke="#e31b23" strokeWidth="7" strokeLinecap="round" />
    <path d="M22 70 A28 28 0 0 1 78 70" fill="none" stroke="#f39200" strokeWidth="7" strokeLinecap="round" />
    <path d="M29 70 A21 21 0 0 1 71 70" fill="none" stroke="#ffeb00" strokeWidth="7" strokeLinecap="round" />
    <path d="M36 70 A14 14 0 0 1 64 70" fill="none" stroke="#009640" strokeWidth="7" strokeLinecap="round" />
    <path d="M43 70 A7 7 0 0 1 57 70" fill="none" stroke="#009fe3" strokeWidth="7" strokeLinecap="round" />
  </svg>
);

export const TrueMoneyIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full rounded-lg shrink-0 bg-white border border-gray-150 p-1 shadow-xs inline-block">
    <path d="M15,22 L35,22 L45,63 L30,63 Z" fill="#ea1a2a" />
    <path d="M35,22 L45,63 L65,63 L55,35 Z" fill="#ffc20e" />
    <path d="M55,35 L65,63 L80,63 L88,27 L70,27 Z" fill="#f37021" />
    <text x="50%" y="85" textAnchor="middle" fontFamily="sans-serif" fontSize="10.5" fontWeight="900" fill="#ea1a2a">
      true<tspan fill="#f37021">money</tspan>
    </text>
  </svg>
);

export const PromptPayIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full rounded-lg shrink-0 shadow-xs inline-block">
    <rect width="100" height="100" rx="20" fill="#002d62" />
    <rect x="25" y="25" width="50" height="50" rx="12" fill="none" stroke="white" strokeWidth="8" />
    <line x1="50" y1="20" x2="50" y2="80" stroke="white" strokeWidth="8" strokeLinecap="round" />
    <line x1="20" y1="50" x2="80" y2="50" stroke="white" strokeWidth="8" strokeLinecap="round" />
    <circle cx="50" cy="50" r="10" fill="#002d62" stroke="white" strokeWidth="6" />
    <polygon points="70,70 85,85 85,55" fill="#00a79d" />
  </svg>
);

interface CheckoutGatewayProps {
  isGatewayOpen: boolean;
  setIsGatewayOpen: (open: boolean) => void;
  gatewayCourse: Course | null;
  checkoutName: string;
  setCheckoutName: (name: string) => void;
  gatewayEmail: string;
  setGatewayEmail: (email: string) => void;
  gatewayPhone: string;
  setGatewayPhone: (phone: string) => void;
  gatewayStep: number;
  setGatewayStep: (step: number) => void;
  gatewayPaymentMethod: 'kbzpay' | 'wavepay' | 'cbpay' | 'truemoney' | 'promptpay';
  setGatewayPaymentMethod: (method: 'kbzpay' | 'wavepay' | 'cbpay' | 'truemoney' | 'promptpay') => void;
  gatewayOtp: string;
  setGatewayOtp: (otp: string) => void;
  gatewayTimer: number;
  setGatewayTimer: (time: number) => void;
  gatewayProcessing: boolean;
  setGatewayProcessing: (proc: boolean) => void;
  currentUser: string | null;
  setCurrentUser: (user: string | null) => void;
  setIsLoggedIn: (isLogged: boolean) => void;
  addSystemLog: (user: string, message: string) => void;
  setOrders: React.Dispatch<React.SetStateAction<any[]>>;
  setIsCourseStoreExpanded: (expanded: boolean) => void;
}

export const CheckoutGateway: React.FC<CheckoutGatewayProps> = ({
  isGatewayOpen,
  setIsGatewayOpen,
  gatewayCourse,
  checkoutName,
  setCheckoutName,
  gatewayEmail,
  setGatewayEmail,
  gatewayPhone,
  setGatewayPhone,
  gatewayStep,
  setGatewayStep,
  gatewayPaymentMethod,
  setGatewayPaymentMethod,
  gatewayOtp,
  setGatewayOtp,
  gatewayTimer,
  setGatewayTimer,
  gatewayProcessing,
  setGatewayProcessing,
  currentUser,
  setCurrentUser,
  setIsLoggedIn,
  addSystemLog,
  setOrders,
  setIsCourseStoreExpanded,
}) => {
  if (!isGatewayOpen || !gatewayCourse) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-[99999] overflow-y-auto">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white border border-gray-100 rounded-xl sm:rounded-2xl max-w-sm sm:max-w-md w-full text-brand-dark shadow-2xl relative overflow-hidden flex flex-col max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-2.5rem)]"
      >
        {/* SSL secured banner */}
        <div className="bg-gray-50 px-3.5 py-1 flex items-center justify-between border-b border-gray-100 text-[7px] font-mono tracking-wider text-brand-muted shrink-0">
          <span className="flex items-center gap-1 text-emerald-600 uppercase font-bold">
            <Shield className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
            SSL SECURED CONNECTION (128-BIT)
          </span>
          <span>SECURED ESCROW</span>
        </div>

        {/* Modal Header */}
        <div className="px-3.5 py-2 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-brand-purple/10 p-1 rounded-lg text-brand-purple shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-brand-purple" />
            </div>
            <div>
              <h3 className="text-[11px] font-sans font-black uppercase tracking-tight text-brand-dark flex items-center gap-1 leading-none">
                Tuition & Course Portal
              </h3>
              <p className="text-[8px] text-brand-muted font-bold font-sans mt-0.5">
                Purchase course and get student account instantly!
              </p>
            </div>
          </div>

          <button 
            onClick={() => setIsGatewayOpen(false)}
            className="p-1 hover:bg-gray-100 hover:text-red-500 rounded-full cursor-pointer transition-colors"
            title="Cancel Transaction"
          >
            <X className="w-3.5 h-3.5 text-brand-dark" />
          </button>
        </div>

        {/* Selected Program Overview */}
        <div className="bg-brand-purple/5 px-3.5 py-2 border-b border-gray-100 text-left flex justify-between items-center gap-2 shrink-0">
          <div>
            <span className="text-[7px] font-mono text-brand-muted block uppercase font-black leading-none">Selected Program</span>
            <span className="text-[10px] font-sans font-black text-brand-dark leading-tight mt-0.5 block">{gatewayCourse.name}</span>
            <span className="text-[8.5px] italic text-brand-purple leading-tight font-bold block mt-0.5">{gatewayCourse.nameMm}</span>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[7px] font-mono text-brand-muted block uppercase font-black leading-none mb-0.5">Tuition Fee</span>
            <span className="text-[10.5px] font-black font-mono text-brand-purple bg-brand-purple/10 px-2 py-0.5 rounded block">
              {gatewayCourse.priceAmount.toLocaleString()} MMK
            </span>
          </div>
        </div>

        {/* Active Dynamic Steps */}
        <div className="p-3 sm:p-3.5 space-y-3 text-left font-sans text-xs overflow-y-auto flex-1">
          
          {/* STEP 1: BILLING DETAILS */}
          {gatewayStep === 1 && (
            <div className="space-y-3 animate-fade-in">
              <div className="bg-brand-purple/5 p-2 rounded-lg border border-brand-purple/10 flex items-start gap-1.5">
                <span className="text-xs shrink-0">🚀</span>
                <div className="space-y-0.5">
                  <p className="text-[8.5px] text-brand-muted font-medium leading-tight">
                    Purchase premium course & get student account instantly!
                  </p>
                  <p className="text-[8.5px] text-brand-purple font-semibold leading-tight">
                    မည်သည့်ပရီမီယံသင်တန်းကိုမဆို ဝယ်ယူပြီး ကျောင်းသားအကောင့်တစ်ခု ချက်ချင်းရယူလိုက်ပါ။
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="block text-[8px] font-sans font-black text-brand-muted uppercase tracking-wider mb-0.5">
                    Student Name (ကျောင်းသားအမည်)
                  </label>
                  <input
                    type="text"
                    required
                    value={checkoutName}
                    onChange={(e) => setCheckoutName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 focus:border-brand-purple rounded-lg text-xs font-bold text-brand-dark focus:outline-none transition-all"
                    placeholder="e.g. ko_nay_min"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8px] font-sans font-black text-brand-muted uppercase tracking-wider mb-0.5">
                      Contact Email (အီးမေးလ်)
                    </label>
                    <input
                      type="email"
                      required
                      value={gatewayEmail}
                      onChange={(e) => setGatewayEmail(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 focus:border-brand-purple rounded-lg text-xs font-semibold text-brand-dark focus:outline-none transition-all"
                      placeholder="student@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-sans font-black text-brand-muted uppercase tracking-wider mb-0.5">
                      Mobile Phone (ဖုန်းနံပါတ်)
                    </label>
                    <input
                      type="text"
                      required
                      value={gatewayPhone}
                      onChange={(e) => setGatewayPhone(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 focus:border-brand-purple rounded-lg text-xs font-mono font-bold text-brand-dark focus:outline-none transition-all"
                      placeholder="e.g. 09-987654321"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (!checkoutName || !gatewayPhone) {
                      alert("Please fill in Student Name and Mobile contact details to continue.");
                      return;
                    }
                    setGatewayStep(2);
                  }}
                  className="w-full bg-brand-purple hover:bg-brand-purple/90 text-white font-sans font-black text-[11px] py-2 rounded-lg transition-all flex items-center justify-center gap-1 shadow-md cursor-pointer border-b-2 border-brand-purple-shadow"
                >
                  Proceed to Payment Options • ငွေပေးချေမှု ရွေးချယ်ရန်
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CHOOSE PAYMENT METHOD */}
          {gatewayStep === 2 && (
            <div className="space-y-3 animate-fade-in text-left">
              <span className="text-[8px] font-sans font-black text-brand-muted uppercase tracking-wider block leading-none">
                Choose Payment Method • ငွေပေးချေမှုစနစ် ရွေးချယ်ရန်
              </span>

              {/* Horizontal Payment selectors */}
              <div className="grid grid-cols-5 gap-1">
                {[
                  { id: 'kbzpay', label: 'KBZPay', icon: <KBZPayIcon />, color: 'border-brand-purple bg-brand-purple/5 text-brand-purple' },
                  { id: 'wavepay', label: 'WavePay', icon: <WavePayIcon />, color: 'border-brand-purple bg-brand-purple/5 text-brand-purple' },
                  { id: 'cbpay', label: 'CBPay', icon: <CBPayIcon />, color: 'border-brand-purple bg-brand-purple/5 text-brand-purple' },
                  { id: 'truemoney', label: 'TrueMoney', icon: <TrueMoneyIcon />, color: 'border-brand-purple bg-brand-purple/5 text-brand-purple' },
                  { id: 'promptpay', label: 'PromptPay', icon: <PromptPayIcon />, color: 'border-brand-purple bg-brand-purple/5 text-brand-purple' }
                ].map((meth) => {
                  const isSelected = gatewayPaymentMethod === meth.id;
                  return (
                    <button
                      key={meth.id}
                      type="button"
                      onClick={() => {
                        setGatewayPaymentMethod(meth.id as any);
                        setGatewayTimer(180); // reset clock timer
                      }}
                      className={`p-1 border rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                        isSelected ? `${meth.color} scale-102 border-2` : 'border-gray-100 bg-white text-brand-dark hover:border-gray-200'
                      }`}
                    >
                      <div className="w-5 h-5 flex items-center justify-center scale-75">{meth.icon}</div>
                      <span className="text-[7.5px] font-sans font-bold leading-none scale-90">{meth.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Integrated Sub-View based on Payment choice */}
              <div className="bg-gray-50 p-2 border border-gray-150 space-y-1.5 text-left rounded-lg">
                {/* KBZPAY, WAVEPAY & CBPAY UI */}
                {(gatewayPaymentMethod === 'kbzpay' || gatewayPaymentMethod === 'wavepay' || gatewayPaymentMethod === 'cbpay') && (
                  <div className="space-y-1 animate-fade-in text-brand-dark">
                    <h5 className="text-[9px] font-sans font-black uppercase text-brand-purple flex items-center gap-1 leading-none">
                      <div className="w-4 h-4 flex items-center justify-center scale-50">{gatewayPaymentMethod === 'kbzpay' ? <KBZPayIcon /> : gatewayPaymentMethod === 'wavepay' ? <WavePayIcon /> : <CBPayIcon />}</div>
                      <span>
                        {gatewayPaymentMethod === 'kbzpay' ? 'KBZPay' : gatewayPaymentMethod === 'wavepay' ? 'WavePay' : 'CBPay'} Wallet Instant Settlement
                      </span>
                    </h5>
                    <p className="text-[8px] text-brand-muted leading-tight font-semibold">
                      Once you click "Authorize Payment", a remote billing request token is sent to your {gatewayPaymentMethod === 'kbzpay' ? 'KBZPay' : gatewayPaymentMethod === 'wavepay' ? 'WavePay' : 'CBPay'} user app. Ensure your application is open to authorize.
                    </p>
                    <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                      <div>
                        <label className="block text-[7px] text-brand-muted font-black uppercase mb-0.5">Wallet Phone Number</label>
                        <input 
                          type="text" 
                          value={gatewayPhone} 
                          onChange={(e) => setGatewayPhone(e.target.value)} 
                          className="w-full bg-white border border-gray-200 focus:border-brand-purple text-[10px] px-1.5 py-0.5 rounded font-mono text-brand-dark focus:outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[7px] text-brand-muted font-black uppercase mb-0.5">Simulated Payment ID</label>
                        <div className="bg-white border border-gray-200 px-1.5 py-0.5 rounded text-[10px] font-mono text-brand-muted font-bold truncate">
                          TXN-{gatewayCourse.id.toUpperCase()}-SEC
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TRUEMONEY WALLET UI */}
                {gatewayPaymentMethod === 'truemoney' && (
                  <div className="space-y-1 animate-fade-in text-brand-dark">
                    <h5 className="text-[9px] font-sans font-black uppercase text-orange-600 flex items-center gap-1 leading-none">
                      <div className="w-4 h-4 flex items-center justify-center scale-50"><TrueMoneyIcon /></div>
                      <span>TrueMoney Wallet Integration (Thailand Gateway)</span>
                    </h5>
                    <p className="text-[8px] text-brand-muted leading-tight font-semibold">
                      Verify using your Thailand TrueMoney Account. We will request a secure OTP pin prior to finalizing your tuition registration fees.
                    </p>
                    <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                      <div>
                        <label className="block text-[7px] text-brand-muted font-black uppercase mb-0.5">TrueMoney Mobile Number</label>
                        <input 
                          type="text" 
                          value={gatewayPhone} 
                          onChange={(e) => setGatewayPhone(e.target.value)} 
                          className="w-full bg-white border border-gray-200 focus:border-brand-purple text-[10px] px-1.5 py-0.5 rounded font-mono text-brand-dark focus:outline-none transition-all"
                          placeholder="66-xxxxxxxxx"
                        />
                      </div>
                      <div>
                        <label className="block text-[7px] text-brand-muted font-black uppercase mb-0.5">Fee Currency Rates</label>
                        <div className="bg-white border border-gray-200 px-1.5 py-0.5 rounded text-[10px] font-mono text-brand-dark font-black">
                          ~ {Math.round(gatewayCourse.priceAmount / 70).toLocaleString()} THB
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* PROMPTPAY QR CODE */}
                {gatewayPaymentMethod === 'promptpay' && (
                  <div className="flex items-center gap-2.5 animate-fade-in text-left">
                    <div className="shrink-0 bg-white p-1 rounded-lg flex flex-col items-center justify-center border border-brand-purple/20">
                      <div className="bg-brand-purple w-full text-white text-[5px] font-sans font-black uppercase text-center py-0.5 tracking-tight rounded-t">
                        Prompt Pay
                      </div>
                      {/* Visual QR Grid lines */}
                      <div className="w-12 h-12 bg-gray-50 flex flex-col items-center justify-center p-0.5 relative my-0.5 overflow-hidden">
                        <div className="grid grid-cols-5 gap-0.5 opacity-90">
                          {[...Array(25)].map((_, i) => (
                             <div 
                               key={i} 
                               className={`w-1.5 h-1.5 rounded-xs ${
                                 i % 3 === 0 || i % 7 === 0 || i < 5 || i % 5 === 0 || i > 20 ? 'bg-slate-850' : 'bg-transparent'
                               }`} 
                             />
                          ))}
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-brand-purple text-[4px] font-extrabold text-white flex items-center justify-center rounded-xs select-none">
                          QR
                        </div>
                      </div>
                      <span className="text-[5px] font-mono text-brand-dark uppercase font-black tracking-tight leading-none scale-90">
                        SCAN TO PAY
                      </span>
                    </div>

                    {/* Right details */}
                    <div className="space-y-0.5 text-brand-dark flex-1">
                      <h5 className="text-[9px] font-sans font-black uppercase text-brand-purple flex items-center gap-1 leading-none">
                        <div className="w-4 h-4 flex items-center justify-center scale-50"><PromptPayIcon /></div>
                        <span>Thai PromptPay Instant QR Payment</span>
                      </h5>
                      <p className="text-[7.5px] text-brand-muted leading-tight font-semibold">
                        Open your Thai banking app (SCB, K-Bank, BBL), scanner QR, upload image. Settled in THB.
                      </p>
                      
                      <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-gray-100">
                        <div>
                          <span className="text-[6.5px] block text-brand-muted uppercase font-black leading-none">THB VALUE AMOUNT</span>
                          <span className="text-[10px] font-mono font-black text-brand-purple">
                            ฿{Math.round(gatewayCourse.priceAmount / 70).toLocaleString()} THB
                          </span>
                        </div>
                        <div className="text-right font-bold">
                          <span className="text-[6.5px] block text-brand-muted uppercase font-black leading-none">SESSION TIMEOUT</span>
                          <span className="text-[10px] font-mono font-black text-amber-500 animate-pulse block">
                            ⏱ {Math.floor(gatewayTimer / 60)}:{(gatewayTimer % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setGatewayProcessing(true);
                    addSystemLog('System', `Payment settlement progress started via ${gatewayPaymentMethod.toUpperCase()} channel.`);
                    
                    // Trigger processing simulation
                    setTimeout(() => {
                      setGatewayProcessing(false);
                      if (gatewayPaymentMethod === 'truemoney') {
                        // true money passes through OTP entry state (Step 3)
                        setGatewayOtp(Math.floor(100000 + Math.random() * 900000).toString());
                        setGatewayStep(3);
                      } else {
                        const buyerUsername = (checkoutName || currentUser || 'Student_' + Math.floor(100 + Math.random() * 900)).trim();
                        
                        // Auto-signup logic if guest
                        if (!currentUser) {
                          setIsLoggedIn(true);
                          setCurrentUser(buyerUsername);
                          localStorage.setItem('thai_user_logged_in', 'true');
                          localStorage.setItem('thai_current_user', buyerUsername);
                          addSystemLog('System', `Automatically provisioned premium account for new course buyer "${buyerUsername}"`);
                        }

                        // other instant networks transition straight to payment success step 4
                        const id = "ORD-" + Math.floor(10000 + Math.random() * 90000);
                        const newOrder: PurchaseOrder = {
                          id,
                          username: buyerUsername,
                          itemName: `🎓 [Course] ${gatewayCourse.name}`,
                          itemType: 'course',
                          priceAmount: gatewayCourse.priceAmount,
                          currency: 'MMK',
                          status: 'completed',
                          orderDate: new Date().toISOString().split('T')[0]
                        };
                        setOrders(prev => [newOrder, ...prev]);
                        addSystemLog(buyerUsername, `Purchased course "${gatewayCourse.name}" (Bill ID: ${id})`);
                        setGatewayStep(4);
                      }
                    }, 1800);
                  }}
                  disabled={gatewayProcessing}
                  className="flex-1 bg-brand-purple hover:bg-brand-purple/90 disabled:opacity-50 text-white font-sans font-black text-[10px] py-1.5 rounded-lg transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer uppercase border-b-2 border-brand-purple-shadow"
                >
                  {gatewayProcessing ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Establishing Connection...
                    </>
                  ) : (
                    <>
                      <CheckSquare className="w-3.5 h-3.5" />
                      Confirm & Settle Tuition Payment
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setGatewayStep(1)}
                  className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-brand-dark rounded-lg font-sans font-extrabold text-[10px] transition-colors cursor-pointer border-b-2 border-gray-200"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: OTP VERIFICATION IN ACTION */}
          {gatewayStep === 3 && (
            <div className="space-y-2 animate-fade-in text-left">
              <div className="bg-brand-purple/5 p-2 rounded-lg border border-brand-purple/10 flex items-center gap-1.5">
                <Megaphone className="w-3.5 h-3.5 text-brand-purple shrink-0" />
                <div>
                  <h6 className="text-[9px] font-sans font-black text-brand-dark uppercase leading-none">SMS Authorization Pin Code Needed</h6>
                  <p className="text-[8px] text-brand-muted mt-0.5 leading-normal">
                    A simulated SMS verification pin was generated to authorize transaction protocols.
                  </p>
                </div>
              </div>

              <div className="space-y-0.5 bg-gray-50 p-2 rounded-lg border border-gray-200 text-center">
                <span className="text-[6.5px] text-brand-muted font-extrabold uppercase tracking-widest block">YOUR PIN CODE SENT IS</span>
                <span className="text-base font-mono font-black text-brand-purple tracking-widest select-all">{gatewayOtp}</span>
                <p className="text-[8px] text-brand-muted font-semibold leading-normal">Enter simulated code below to unlock payment transfer.</p>
              </div>

              <div>
                <label className="block text-[8px] font-sans font-black text-brand-muted uppercase tracking-wider mb-0.5">
                  6-Digit Security PIN (နံပါတ် ၆ လုံး ရိုက်ထည့်ရန်)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  className="w-full text-center px-1.5 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-mono font-black text-brand-dark tracking-widest focus:border-brand-purple focus:outline-none"
                  placeholder="______"
                  onChange={(e) => {
                    if (e.target.value === gatewayOtp) {
                      setGatewayProcessing(true);
                      setTimeout(() => {
                        setGatewayProcessing(false);
                        const buyerUsername = (checkoutName || currentUser || 'Student_' + Math.floor(100 + Math.random() * 900)).trim();
                        
                        // Auto-signup logic if guest
                        if (!currentUser) {
                          setIsLoggedIn(true);
                          setCurrentUser(buyerUsername);
                          localStorage.setItem('thai_user_logged_in', 'true');
                          localStorage.setItem('thai_current_user', buyerUsername);
                          addSystemLog('System', `Automatically provisioned premium account for new course buyer "${buyerUsername}"`);
                        }

                        const id = "ORD-" + Math.floor(10000 + Math.random() * 90000);
                        const newOrder: PurchaseOrder = {
                          id,
                          username: buyerUsername,
                          itemName: `🎓 [TrueMoney] ${gatewayCourse.name}`,
                          itemType: 'course',
                          priceAmount: gatewayCourse.priceAmount,
                          currency: 'MMK',
                          status: 'completed',
                          orderDate: new Date().toISOString().split('T')[0]
                        };
                        setOrders(prev => [newOrder, ...prev]);
                        addSystemLog(buyerUsername, `Purchased course "${gatewayCourse.name}" via TrueMoney verification (Ref: ${id})`);
                        setGatewayStep(4);
                      }, 1200);
                    }
                  }}
                />
                {gatewayProcessing && (
                  <div className="text-center text-[8px] text-brand-purple font-black animate-pulse mt-0.5 flex items-center justify-center gap-1">
                    <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Verifying security PIN code...
                  </div>
                )}
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setGatewayStep(2)}
                  className="w-full py-1.5 bg-gray-100 hover:bg-gray-200 text-brand-dark rounded-lg font-sans font-extrabold text-[9px] text-center cursor-pointer transition-colors border animate-fade-in"
                >
                  Change Payment Mode / Cancel OTP
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS RECEIPT AND CONGRATULATORY CARD */}
          {gatewayStep === 4 && (
            <div className="space-y-2 animate-fade-in text-center">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle className="w-5 h-5" />
              </div>

              <div className="space-y-0.5">
                <h4 className="text-xs font-sans font-black text-brand-dark uppercase tracking-tight">
                  Approved Successfully!
                </h4>
                <p className="text-[9px] text-emerald-600 font-extrabold leading-none">
                  Enrollment Key: Ref-TXN-{Math.floor(100000 + Math.random() * 900000)}
                </p>
                <p className="text-[8.5px] text-brand-muted font-medium leading-normal mt-0.5">
                  Payment of {gatewayCourse.priceAmount.toLocaleString()} MMK processed. Registered account `{currentUser}` is now auto-provisioned with premium Course Curriculum access!
                </p>
              </div>

              {/* Course syllabus features unlocks overview */}
              <div className="bg-gray-50 p-2 border border-gray-150 rounded-xl text-left space-y-1">
                <span className="text-[7.5px] font-black text-brand-purple uppercase tracking-wider block leading-none">Access Key Privileges Unlocked:</span>
                <div className="space-y-0.5 font-sans text-[8px] text-brand-dark font-medium leading-tight">
                  <div className="flex items-center gap-1">
                    <Check className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                    <span>Lifetime Access to HD Lectures & Worksheets</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Check className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                    <span>Direct Message Support Channel with Kru Jane</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Check className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                    <span>Personalized PDF Homework handbooks & Vocab Sheets</span>
                  </div>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsGatewayOpen(false);
                    setIsCourseStoreExpanded(false);
                  }}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-sans font-black text-[10px] py-1.5 rounded-lg transition-all shadow-md uppercase cursor-pointer border-b-2 border-emerald-600"
                >
                  Open My Classroom Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Secure footer trust badge */}
        <div className="bg-gray-50 px-3.5 py-1.5 border-t border-gray-100 text-[8.5px] text-brand-muted flex items-center justify-between shrink-0">
          <span className="flex items-center gap-1 font-bold">
            <span className="text-xs text-brand-purple">🔒</span> Secured checkout handshake
          </span>
          <span className="font-mono font-bold">VERIFIED & INTEGRATED</span>
        </div>
      </motion.div>
    </div>
  );
};
