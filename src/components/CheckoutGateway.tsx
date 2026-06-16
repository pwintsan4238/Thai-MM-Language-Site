import React from 'react';
import { motion } from 'motion/react';
import { Shield, Sparkles, X, RefreshCw, CheckSquare, Megaphone, CheckCircle, Check } from 'lucide-react';
import { Course, PurchaseOrder } from '../types';

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
  gatewayPaymentMethod: 'kbzpay' | 'cbpay' | 'truemoney' | 'promptpay';
  setGatewayPaymentMethod: (method: 'kbzpay' | 'cbpay' | 'truemoney' | 'promptpay') => void;
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[99999] overflow-y-auto">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        className="bg-white border-2 border-gray-100 rounded-3xl max-w-lg w-full text-brand-dark shadow-2xl relative overflow-hidden"
      >
        {/* SSL secured banner */}
        <div className="bg-gray-50 px-4 py-2 flex items-center justify-between border-b border-gray-100 text-[9px] font-mono tracking-wider text-brand-muted">
          <span className="flex items-center gap-1 text-emerald-600 uppercase font-black">
            <Shield className="w-3 h-3 animate-pulse text-emerald-500" />
            SSL SECURED CONNECTION (128-BIT ENCRYPTION)
          </span>
          <span>SECURED TRANSFER POINT</span>
        </div>

        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="bg-brand-purple/10 p-1.5 rounded-lg text-brand-purple shrink-0">
              <Sparkles className="w-5 h-5 text-brand-purple" />
            </div>
            <div>
              <h3 className="text-sm font-sans font-black uppercase tracking-tight text-brand-dark flex items-center gap-1">
                Tuition & Course Portal
              </h3>
              <p className="text-[10px] text-brand-muted font-bold font-sans">
                Enroll securely onto premium study programs
              </p>
            </div>
          </div>

          <button 
            onClick={() => setIsGatewayOpen(false)}
            className="p-1 hover:bg-gray-100 hover:text-red-500 rounded-full cursor-pointer transition-colors"
            title="Cancel Transaction"
          >
            <X className="w-5 h-5 text-brand-dark" />
          </button>
        </div>

        {/* Selected Program Overview */}
        <div className="bg-brand-purple/5 p-4 border-b border-gray-100 text-left flex flex-col sm:flex-row justify-between sm:items-center gap-2.5">
          <div>
            <span className="text-[8px] font-mono text-brand-muted block uppercase font-black">Selected Program</span>
            <h4 className="text-xs font-sans font-black text-brand-dark">{gatewayCourse.name}</h4>
            <p className="text-[9.5px] italic text-brand-purple mt-0.5 font-bold leading-normal">{gatewayCourse.nameMm}</p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[8px] font-mono text-brand-muted block uppercase font-black">Total Tuition Fee</span>
            <span className="text-sm font-black font-mono text-brand-purple">
              {gatewayCourse.priceAmount.toLocaleString()} MMK
            </span>
          </div>
        </div>

        {/* Active Dynamic Steps */}
        <div className="p-5 space-y-4 text-left font-sans text-xs min-h-[290px]">
          
          {/* STEP 1: BILLING DETAILS */}
          {gatewayStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-brand-purple/5 p-3 rounded-xl border border-brand-purple/10 space-y-1">
                <span className="text-[8.5px] font-black text-brand-purple uppercase tracking-wider block">Important Enrollment Notice:</span>
                <p className="text-[10px] text-brand-muted font-medium leading-relaxed">
                  To register, verify and bind your student credentials correctly across devices, please supply your contact info. This records your subscription dispatch.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[9px] font-sans font-black text-brand-muted uppercase tracking-wider mb-1">
                    Student Name (ကျောင်းသားအမည်)
                  </label>
                  <input
                    type="text"
                    required
                    value={checkoutName}
                    onChange={(e) => setCheckoutName(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 focus:border-brand-purple rounded-xl text-xs font-bold text-brand-dark focus:outline-none transition-all"
                    placeholder="e.g. ko_nay_min"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-sans font-black text-brand-muted uppercase tracking-wider mb-1">
                      Contact Email (အီးမေးလ်လိပ်စာ)
                    </label>
                    <input
                      type="email"
                      required
                      value={gatewayEmail}
                      onChange={(e) => setGatewayEmail(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 focus:border-brand-purple rounded-xl text-xs font-semibold text-brand-dark focus:outline-none transition-all"
                      placeholder="student@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-sans font-black text-brand-muted uppercase tracking-wider mb-1">
                      Mobile Phone Number (ဖုန်းနံပါတ်)
                    </label>
                    <input
                      type="text"
                      required
                      value={gatewayPhone}
                      onChange={(e) => setGatewayPhone(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 focus:border-brand-purple rounded-xl text-xs font-mono font-bold text-brand-dark focus:outline-none transition-all"
                      placeholder="e.g. 09-987654321"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!checkoutName || !gatewayPhone) {
                      alert("Please fill in Student Name and Mobile contact details to continue.");
                      return;
                    }
                    setGatewayStep(2);
                  }}
                  className="w-full bg-brand-purple hover:bg-brand-purple/90 text-white font-sans font-black text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1 shadow-md cursor-pointer border-b-2 border-brand-purple-shadow"
                >
                  Proceed to Payment Options • ငွေပေးချေမှု ရွေးချယ်ရန်
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CHOOSE PAYMENT METHOD */}
          {gatewayStep === 2 && (
            <div className="space-y-4 animate-fade-in text-left">
              <span className="text-[9.5px] font-sans font-black text-brand-muted uppercase tracking-wider block">
                Choose Payment Method
              </span>

              {/* Horizontal Payment selectors */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'kbzpay', label: 'KBZPay', icon: '📱', color: 'border-brand-purple bg-brand-purple/5 text-brand-purple' },
                  { id: 'cbpay', label: 'CBPay', icon: '🏦', color: 'border-brand-purple bg-brand-purple/5 text-brand-purple' },
                  { id: 'truemoney', label: 'TrueMoney', icon: '🟠', color: 'border-brand-purple bg-brand-purple/5 text-brand-purple' },
                  { id: 'promptpay', label: 'PromptPay', icon: '🇹🇭', color: 'border-brand-purple bg-brand-purple/5 text-brand-purple' }
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
                      className={`p-2.5 border-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        isSelected ? `${meth.color} scale-102 shadow-xs` : 'border-gray-100 bg-white text-brand-dark hover:border-gray-200'
                      }`}
                    >
                      <span className="text-base leading-none">{meth.icon}</span>
                      <span className="text-[10px] font-sans font-black">{meth.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Integrated Sub-View based on Payment choice */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 space-y-3 min-h-[140px] flex flex-col justify-between text-left">
                {/* KBZPAY & CBPAY UI */}
                {(gatewayPaymentMethod === 'kbzpay' || gatewayPaymentMethod === 'cbpay') && (
                  <div className="space-y-2 animate-fade-in text-brand-dark">
                    <h5 className="text-[10px] font-sans font-black uppercase text-brand-purple flex items-center gap-1">
                      📱 {gatewayPaymentMethod === 'kbzpay' ? 'KBZPay' : 'CBPay'} Wallet Instant Settlement
                    </h5>
                    <p className="text-[9.5px] text-brand-muted leading-normal font-semibold">
                      Once you click "Authorize Payment", a remote billing request token is sent to your {gatewayPaymentMethod === 'kbzpay' ? 'KBZPay' : 'CBPay'} user app. Ensure your application is open to authorize.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1.5">
                      <div>
                        <label className="block text-[8px] text-brand-muted font-black uppercase mb-0.5">Wallet Phone Number</label>
                        <input 
                          type="text" 
                          value={gatewayPhone} 
                          onChange={(e) => setGatewayPhone(e.target.value)} 
                          className="w-full bg-white border border-gray-200 focus:border-brand-purple text-xs px-2.5 py-1.5 rounded-lg font-mono text-brand-dark focus:outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] text-brand-muted font-black uppercase mb-0.5">Simulated Payment ID</label>
                        <div className="bg-white border border-gray-200 px-2.5 py-1.5 rounded-lg text-xs font-mono text-brand-muted font-bold truncate">
                          TXN-{gatewayCourse.id.toUpperCase()}-SEC
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TRUEMONEY WALLET UI */}
                {gatewayPaymentMethod === 'truemoney' && (
                  <div className="space-y-2 animate-fade-in text-brand-dark">
                    <h5 className="text-[10px] font-sans font-black uppercase text-orange-600 flex items-center gap-1">
                      🟠 TrueMoney Wallet Integration (Thailand Gateway)
                    </h5>
                    <p className="text-[9.5px] text-brand-muted leading-normal font-semibold">
                      Verify using your Thailand TrueMoney Account. We will request a secure OTP pin prior to finalizing your tuition registration fees.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="block text-[8px] text-brand-muted font-black uppercase mb-0.5">TrueMoney Mobile Number</label>
                        <input 
                          type="text" 
                          value={gatewayPhone} 
                          onChange={(e) => setGatewayPhone(e.target.value)} 
                          className="w-full bg-white border border-gray-200 focus:border-brand-purple text-xs px-2.5 py-1.5 rounded-lg font-mono text-brand-dark focus:outline-none transition-all"
                          placeholder="66-xxxxxxxxx"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] text-brand-muted font-black uppercase mb-0.5">Fee Currency Rates</label>
                        <div className="bg-white border border-gray-200 px-2.5 py-1.5 rounded-lg text-xs font-mono text-brand-dark font-black">
                          ~ {Math.round(gatewayCourse.priceAmount / 70).toLocaleString()} THB (Net Value)
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* PROMPTPAY QR CODE */}
                {gatewayPaymentMethod === 'promptpay' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center animate-fade-in text-left">
                    <div className="sm:col-span-1 bg-white p-2 rounded-xl flex flex-col items-center justify-center border-2 border-brand-purple/20">
                      <div className="bg-brand-purple w-full text-white text-[7px] font-sans font-black uppercase text-center py-0.5 tracking-tight rounded-t">
                        Prompt Pay
                      </div>
                      {/* Visual QR Grid lines */}
                      <div className="w-20 h-20 bg-gray-50 flex flex-col items-center justify-center p-1.5 relative my-1 overflow-hidden">
                        <div className="grid grid-cols-5 gap-1.5 opacity-90">
                          {[...Array(25)].map((_, i) => (
                            <div 
                              key={i} 
                              className={`w-2.5 h-2.5 rounded-xs ${
                                i % 3 === 0 || i % 7 === 0 || i < 5 || i % 5 === 0 || i > 20 ? 'bg-slate-850' : 'bg-transparent'
                              }`} 
                            />
                          ))}
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-brand-purple text-[6px] font-extrabold text-white flex items-center justify-center rounded-xs select-none">
                          QR
                        </div>
                      </div>
                      <span className="text-[6.5px] font-mono text-brand-dark uppercase font-black tracking-tight leading-none">
                        SCAN TO PAY • THB
                      </span>
                    </div>

                    {/* Right details */}
                    <div className="sm:col-span-2 space-y-1 text-brand-dark">
                      <h5 className="text-[10px] font-sans font-black uppercase text-brand-purple flex items-center gap-1 leading-none">
                        🇹🇭 Thai PromptPay Secure Instant QR Payment
                      </h5>
                      <p className="text-[9px] text-brand-muted leading-normal font-semibold">
                        Open your Thai banking app (SCB, K-Bank, Bangkok Bank, Krungthai), select QR Code Scanner, and upload this image. Amount is settled in THB.
                      </p>
                      
                      <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-gray-100">
                        <div>
                          <span className="text-[7.5px] block text-brand-muted uppercase font-black leading-none">THB VALUE AMOUNT</span>
                          <span className="text-xs font-mono font-black text-brand-purple">
                            ฿{Math.round(gatewayCourse.priceAmount / 70).toLocaleString()} THB
                          </span>
                        </div>
                        <div className="text-right font-bold">
                          <span className="text-[7.5px] block text-brand-muted uppercase font-black leading-none">SESSION TIME LIMIT</span>
                          <span className="text-xs font-mono font-black text-amber-500 animate-pulse block">
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
                  className="flex-1 bg-brand-purple hover:bg-brand-purple/90 disabled:opacity-50 text-white font-sans font-black text-xs py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer uppercase border-b-2 border-brand-purple-shadow"
                >
                  {gatewayProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Establishing Secure Connection...
                    </>
                  ) : (
                    <>
                      <CheckSquare className="w-4 h-4" />
                      Confirm & Complete Tuition Payment
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setGatewayStep(1)}
                  className="px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-brand-dark rounded-xl font-sans font-extrabold text-xs transition-colors cursor-pointer border-b-2 border-gray-200"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: OTP VERIFICATION IN ACTION */}
          {gatewayStep === 3 && (
            <div className="space-y-4 animate-fade-in text-left">
              <div className="bg-brand-purple/5 p-3 rounded-xl border border-brand-purple/10 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-brand-purple shrink-0" />
                <div>
                  <h6 className="text-[10px] font-sans font-black text-brand-dark uppercase leading-none">SMS Authorization Pin Code Needed</h6>
                  <p className="text-[9px] text-brand-muted mt-1 leading-normal">
                    A simulation SMS with verification PIN code was successfully generated to mimic real transaction authorization protocols.
                  </p>
                </div>
              </div>

              <div className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
                <span className="text-[8px] text-brand-muted font-extrabold uppercase tracking-widest block">YOUR PIN CODE SENT IS</span>
                <span className="text-xl font-mono font-black text-brand-purple tracking-widest select-all">{gatewayOtp}</span>
                <p className="text-[9px] text-brand-muted font-semibold leading-normal">Enter this simulated code token down below to unlock and settle transaction.</p>
              </div>

              <div>
                <label className="block text-[9px] font-sans font-black text-brand-muted uppercase tracking-wider mb-1">
                  6-Digit Security PIN (နံပါတ် ၆ လုံး ရိုက်ထည့်ရန်)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  className="w-full text-center px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-lg font-mono font-black text-brand-dark tracking-widest focus:border-brand-purple focus:outline-none"
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
                  <div className="text-center text-[10px] text-brand-purple font-black animate-pulse mt-2 flex items-center justify-center gap-1.5">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Verifying security PIN code...
                  </div>
                )}
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setGatewayStep(2)}
                  className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-brand-dark rounded-lg font-sans font-extrabold text-[10px] text-center cursor-pointer transition-colors border animate-fade-in"
                >
                  Change Payment Mode / Cancel OTP
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS RECEIPT AND CONGRATULATORY CARD */}
          {gatewayStep === 4 && (
            <div className="space-y-4 animate-fade-in text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-1 animate-bounce">
                <CheckCircle className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-sans font-black text-brand-dark uppercase tracking-tight">
                  Transaction Approved Successfully!
                </h4>
                <p className="text-[11px] text-emerald-600 font-extrabold">
                  Secured Enrollment Ref: TXN-{Math.floor(100000 + Math.random() * 900000)}
                </p>
                <p className="text-[10px] text-brand-muted font-medium">
                  Your payment of {gatewayCourse.priceAmount.toLocaleString()} MMK has been processed. Your registered account `{currentUser}` has been certified and granted Course Curriculum status automatically!
                </p>
              </div>

              {/* Course syllabus features unlocks overview */}
              <div className="bg-gray-50 p-4 border border-gray-150 rounded-2xl text-left space-y-2.5">
                <span className="text-[8.5px] font-black text-brand-purple uppercase tracking-wider block">Access Key Privileges Unlocked:</span>
                <div className="space-y-1.5 font-sans text-[10px] text-brand-dark font-semibold">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Lifetime Online Access to HD Lectures & Worksheets</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Direct Message Support Channel with Kru Jane on active study questions</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Personalized PDF Homework handbooks & Vocab Sheets</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsGatewayOpen(false);
                    setIsCourseStoreExpanded(false);
                  }}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-sans font-black text-xs py-3 rounded-xl transition-all shadow-md uppercase cursor-pointer border-b-2 border-emerald-600"
                >
                  Open My Classroom Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Secure footer trust badge */}
        <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 text-[10px] text-brand-muted flex items-center justify-between">
          <span className="flex items-center gap-1 font-bold">
            <span className="text-xs text-brand-purple">🔒</span> Secured checkout handshake
          </span>
          <span className="font-mono font-bold">VERIFIED & ENCRYPTED</span>
        </div>
      </motion.div>
    </div>
  );
};
