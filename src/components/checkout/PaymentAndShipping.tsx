import { useState } from 'react';
import { CreditCard, Building2, Truck, Package, Check, ChevronRight, MapPin, Clock, User, Mail, Phone as PhoneIcon } from 'lucide-react';

interface PaymentAndShippingProps {
  totalPrice: number;
  totalGrams: number;
  onComplete: (paymentMethod: string, shippingMethod: string, customerData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    zip?: string;
    notes?: string;
  }) => void;
  loading?: boolean;
}

const FREE_SHIPPING_THRESHOLD = 1000;
const SHIPPING_COST = 79;
const COD_FEE = 30;
const PERSONAL_PICKUP_MIN_GRAMS = 10;

export default function PaymentAndShipping({ totalPrice, totalGrams, onComplete, loading }: PaymentAndShippingProps) {
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'card' | 'cash_on_delivery'>('bank_transfer');
  const [shippingMethod, setShippingMethod] = useState<'zasilkovna' | 'personal_pickup' | 'personal_invoice' | undefined>(undefined);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [notes, setNotes] = useState('');

  const canUsePersonalPickup = totalGrams > PERSONAL_PICKUP_MIN_GRAMS;

  const isFreeShipping = totalPrice >= FREE_SHIPPING_THRESHOLD;
  const isPersonalPickup = shippingMethod === 'personal_pickup';
  const isPersonalInvoice = shippingMethod === 'personal_invoice';
  const isZasilkovna = shippingMethod === 'zasilkovna';

  const shippingCost = !shippingMethod ? 0 : (isPersonalPickup || isPersonalInvoice ? 0 : (isFreeShipping ? 0 : SHIPPING_COST));
  const codFee = paymentMethod === 'cash_on_delivery' && !isPersonalPickup && !isPersonalInvoice && shippingMethod ? COD_FEE : 0;
  const finalTotal = totalPrice + shippingCost + codFee;

  const scrollToField = (fieldId: string) => {
    const element = document.getElementById(fieldId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => element.focus(), 300);
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);

    if (!firstName) {
      scrollToField('checkout-firstName');
      return;
    }
    if (!lastName) {
      scrollToField('checkout-lastName');
      return;
    }
    if (!email) {
      scrollToField('checkout-email');
      return;
    }
    if (!phone) {
      scrollToField('checkout-phone');
      return;
    }
    if (!shippingMethod) {
      scrollToField('checkout-shipping');
      return;
    }
    if (shippingMethod === 'zasilkovna') {
      if (!address) {
        scrollToField('checkout-address');
        return;
      }
      if (!city) {
        scrollToField('checkout-city');
        return;
      }
      if (!zip) {
        scrollToField('checkout-zip');
        return;
      }
    }
    if (!termsAccepted) {
      scrollToField('checkout-terms');
      return;
    }

    onComplete(paymentMethod, shippingMethod, {
      firstName,
      lastName,
      email,
      phone,
      address: shippingMethod === 'zasilkovna' ? address : undefined,
      city: shippingMethod === 'zasilkovna' ? city : undefined,
      zip: shippingMethod === 'zasilkovna' ? zip : undefined,
      notes,
    });
  };

  const isFormValid = firstName && lastName && email && phone && shippingMethod && termsAccepted &&
    (shippingMethod !== 'zasilkovna' || (address && city && zip));

  return (
    <div className="animate-fadeSlideIn">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Způsob platby a doručení</h1>
        <p className="text-gray-400 mb-3">Vyplňte kontaktní údaje a vyberte způsob platby a dopravy</p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <Check className="w-4 h-4 text-emerald-400" />
          <p className="text-sm text-emerald-300 font-medium">Registrace není nutná - můžete objednat jako host</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white/5 rounded-xl p-6 border border-emerald-500/20">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <User className="w-6 h-6 text-emerald-400" />
            Kontaktní údaje
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Jméno <span className="text-red-400">*</span>
              </label>
              <input
                id="checkout-firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className={`w-full px-4 py-3 bg-black/30 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all ${submitted && !firstName ? 'border-red-500/60 bg-red-500/5' : 'border-emerald-500/30'}`}
                placeholder="Vaše jméno"
              />
              {submitted && !firstName && <p className="mt-1 text-xs text-red-400">Vyplnte jmeno</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Příjmení <span className="text-red-400">*</span>
              </label>
              <input
                id="checkout-lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className={`w-full px-4 py-3 bg-black/30 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all ${submitted && !lastName ? 'border-red-500/60 bg-red-500/5' : 'border-emerald-500/30'}`}
                placeholder="Vaše příjmení"
              />
              {submitted && !lastName && <p className="mt-1 text-xs text-red-400">Vyplnte prijmeni</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="checkout-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full pl-11 pr-4 py-3 bg-black/30 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all ${submitted && !email ? 'border-red-500/60 bg-red-500/5' : 'border-emerald-500/30'}`}
                  placeholder="vas@email.cz"
                />
              </div>
              {submitted && !email && <p className="mt-1 text-xs text-red-400">Vyplnte emailovou adresu</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Telefon <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="checkout-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className={`w-full pl-11 pr-4 py-3 bg-black/30 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all ${submitted && !phone ? 'border-red-500/60 bg-red-500/5' : 'border-emerald-500/30'}`}
                  placeholder="+420 123 456 789"
                />
              </div>
              {submitted && !phone && <p className="mt-1 text-xs text-red-400">Vyplnte telefonni cislo</p>}
            </div>
          </div>

          {shippingMethod === 'zasilkovna' && (
            <div className="mt-6 pt-6 border-t border-emerald-500/20">
              <h3 className="text-lg font-bold text-white mb-4">Dodací adresa</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ulice a číslo popisné <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="checkout-address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className={`w-full px-4 py-3 bg-black/30 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all ${submitted && !address ? 'border-red-500/60 bg-red-500/5' : 'border-emerald-500/30'}`}
                    placeholder="např. Hlavní 123"
                  />
                  {submitted && !address && <p className="mt-1 text-xs text-red-400">Vyplnte ulici a cislo</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Město <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="checkout-city"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      className={`w-full px-4 py-3 bg-black/30 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all ${submitted && !city ? 'border-red-500/60 bg-red-500/5' : 'border-emerald-500/30'}`}
                      placeholder="Praha"
                    />
                    {submitted && !city && <p className="mt-1 text-xs text-red-400">Vyplnte mesto</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      PSČ <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="checkout-zip"
                      type="text"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      required
                      className={`w-full px-4 py-3 bg-black/30 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all ${submitted && !zip ? 'border-red-500/60 bg-red-500/5' : 'border-emerald-500/30'}`}
                      placeholder="120 00"
                    />
                    {submitted && !zip && <p className="mt-1 text-xs text-red-400">Vyplnte PSC</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-emerald-500/20">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Poznámka k objednávce (volitelné)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-black/30 border border-emerald-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all resize-none"
              placeholder="Máte nějaké speciální požadavky? Napište nám..."
            />
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-6 border border-emerald-500/20">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-400" />
            Způsob platby
          </h2>

          <div className="space-y-3">
            <label
              className={`group relative block cursor-pointer transition-all duration-300 ${
                paymentMethod === 'bank_transfer'
                  ? 'ring-2 ring-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                  : ''
              }`}
              style={{
                borderRadius: '12px',
              }}
            >
              <div
                className={`p-4 rounded-xl border transition-all duration-300 ${
                  paymentMethod === 'bank_transfer'
                    ? 'bg-emerald-500/10 border-emerald-500/40'
                    : 'bg-white/5 border-emerald-500/20 hover:border-emerald-500/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 pt-1">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        paymentMethod === 'bank_transfer'
                          ? 'border-emerald-500 bg-emerald-500'
                          : 'border-gray-600 bg-transparent'
                      }`}
                    >
                      {paymentMethod === 'bank_transfer' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-white font-bold">Bankovní převod</h3>
                      {paymentMethod === 'bank_transfer' && (
                        <span className="ml-auto px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full">
                          DOPORUČENO
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mb-2">
                      Bezpečná a plně funkční platební metoda
                    </p>
                    <div className="flex items-start gap-2 text-xs text-gray-500">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Platba probíhá převodem na účet po dokončení objednávky</span>
                    </div>
                  </div>
                </div>
              </div>
              <input
                type="radio"
                name="payment"
                value="bank_transfer"
                checked={paymentMethod === 'bank_transfer'}
                onChange={() => setPaymentMethod('bank_transfer')}
                className="sr-only"
              />
            </label>

            <label className="group relative block cursor-not-allowed">
              <div className="p-4 rounded-xl border bg-white/5 border-emerald-500/10 opacity-60">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 pt-1">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-700 bg-transparent"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCard className="w-5 h-5 text-gray-600" />
                      <h3 className="text-gray-500 font-bold">Platba kartou</h3>
                      <div className="ml-auto flex items-center gap-1.5">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png"
                          alt="Visa"
                          className="h-4 opacity-30"
                        />
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                          alt="Mastercard"
                          className="h-4 opacity-30"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Dočasně nedostupná</p>
                    <div className="flex items-start gap-2 text-xs text-gray-600">
                      <span>Tuto možnost momentálně nelze zvolit</span>
                    </div>
                  </div>
                </div>
              </div>
              <input type="radio" disabled className="sr-only" />
            </label>

            <label
              className={`group relative block cursor-pointer transition-all duration-300 ${
                paymentMethod === 'cash_on_delivery'
                  ? 'ring-2 ring-emerald-500/40'
                  : ''
              }`}
              style={{
                borderRadius: '12px',
              }}
            >
              <div
                className={`p-4 rounded-xl border transition-all duration-300 ${
                  paymentMethod === 'cash_on_delivery'
                    ? 'bg-white/10 border-emerald-500/30'
                    : 'bg-white/5 border-emerald-500/20 hover:border-emerald-500/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 pt-1">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        paymentMethod === 'cash_on_delivery'
                          ? 'border-emerald-500 bg-emerald-500'
                          : 'border-gray-600 bg-transparent'
                      }`}
                    >
                      {paymentMethod === 'cash_on_delivery' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Truck className="w-5 h-5 text-gray-400" />
                      <h3 className="text-white font-bold">Dobírka</h3>
                      <span className="ml-auto text-xs text-gray-400">+ {COD_FEE} Kč</span>
                    </div>
                    <p className="text-sm text-gray-400">Platba při převzetí zásilky</p>
                  </div>
                </div>
              </div>
              <input
                type="radio"
                name="payment"
                value="cash_on_delivery"
                checked={paymentMethod === 'cash_on_delivery'}
                onChange={() => setPaymentMethod('cash_on_delivery')}
                className="sr-only"
              />
            </label>
          </div>
        </div>

        <div id="checkout-shipping" className="bg-white/5 rounded-xl p-6 border border-emerald-500/20">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-400" />
            Způsob dopravy
          </h2>

          <div className="space-y-3">
            <label
              className={`group relative block cursor-pointer transition-all duration-300 ${
                shippingMethod === 'personal_invoice'
                  ? 'ring-2 ring-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                  : ''
              }`}
              style={{ borderRadius: '12px' }}
            >
              <div
                className={`p-4 rounded-xl border transition-all duration-300 ${
                  shippingMethod === 'personal_invoice'
                    ? 'bg-emerald-500/10 border-emerald-500/40'
                    : 'bg-white/5 border-emerald-500/20 hover:border-emerald-500/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 pt-1">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        shippingMethod === 'personal_invoice'
                          ? 'border-emerald-500 bg-emerald-500'
                          : 'border-gray-600 bg-transparent'
                      }`}
                    >
                      {shippingMethod === 'personal_invoice' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-white font-bold">Osobní vyzvednutí po uhrazení faktury obratem</h3>
                      <span className="ml-auto text-sm font-semibold text-emerald-400">
                        Zdarma
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">
                      Domlouváme místo Praha - Beroun 24/7
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        24/7 dostupnost
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <input
                type="radio"
                name="shipping"
                value="personal_invoice"
                checked={shippingMethod === 'personal_invoice'}
                onChange={() => setShippingMethod('personal_invoice')}
                className="sr-only"
              />
            </label>

            <label
              className={`group relative block cursor-pointer transition-all duration-300 ${
                shippingMethod === 'zasilkovna'
                  ? 'ring-2 ring-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                  : ''
              }`}
              style={{ borderRadius: '12px' }}
            >
              <div
                className={`p-4 rounded-xl border transition-all duration-300 ${
                  shippingMethod === 'zasilkovna'
                    ? 'bg-emerald-500/10 border-emerald-500/40'
                    : 'bg-white/5 border-emerald-500/20 hover:border-emerald-500/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 pt-1">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        shippingMethod === 'zasilkovna'
                          ? 'border-emerald-500 bg-emerald-500'
                          : 'border-gray-600 bg-transparent'
                      }`}
                    >
                      {shippingMethod === 'zasilkovna' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-white font-bold">Zásilkovna</h3>
                      <span className="ml-auto text-sm font-semibold text-white">
                        {isFreeShipping ? (
                          <span className="text-emerald-400">Zdarma</span>
                        ) : (
                          `${SHIPPING_COST} Kč`
                        )}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">
                      Doručení na výdejní místo nebo adresu
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full">
                        {isFreeShipping ? 'Doprava zdarma' : `Doprava zdarma od ${FREE_SHIPPING_THRESHOLD} Kč`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <input
                type="radio"
                name="shipping"
                value="zasilkovna"
                checked={shippingMethod === 'zasilkovna'}
                onChange={() => setShippingMethod('zasilkovna')}
                className="sr-only"
              />
            </label>
          </div>

          {shippingMethod === 'personal_invoice' && (
            <div className="mt-4 p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-xl">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white font-semibold mb-1">Jak to probíhá</h4>
                  <p className="text-sm text-gray-300 mb-2">
                    Po dokončení objednávky vám zašleme fakturu. Po uhrazení obratem domlouváme místo předání v oblasti Praha - Beroun.
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300 font-medium">K dispozici 24/7 - flexibilní předání</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {submitted && !shippingMethod && (
            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400 text-center">Vyberte zpusob dopravy pro pokracovani</p>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl p-6 border border-emerald-500/30">
          <h3 className="text-white font-bold mb-4">Rekapitulace objednávky</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Cena zboží</span>
              <span className="text-white font-semibold">{totalPrice.toFixed(2)} Kč</span>
            </div>

            {paymentMethod === 'cash_on_delivery' && shippingMethod && !isPersonalPickup && !isPersonalInvoice && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Poplatek za dobírku</span>
                <span className="text-white font-semibold">{codFee.toFixed(2)} Kč</span>
              </div>
            )}

            <div className="border-t border-emerald-500/20 pt-3 mt-3">
              <div className="flex justify-between text-lg">
                <span className="text-white font-bold">Celkem k úhradě</span>
                <span className="text-emerald-400 font-bold text-xl">{finalTotal.toFixed(2)} Kč</span>
              </div>
            </div>

            <div className="flex justify-between text-sm pt-2">
              <span className="text-gray-400">Způsob platby</span>
              <span className="text-white font-semibold">
                {paymentMethod === 'bank_transfer' && 'Bankovní převod'}
                {paymentMethod === 'cash_on_delivery' && 'Dobírka'}
              </span>
            </div>
          </div>

          {!isFreeShipping && isZasilkovna && (
            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p className="text-sm text-amber-200 text-center">
                Přidejte zboží za {(FREE_SHIPPING_THRESHOLD - totalPrice).toFixed(2)} Kč a získáte dopravu zdarma
              </p>
            </div>
          )}

          {!shippingMethod && (
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-200 text-center">
                Vyberte způsob dopravy pro zobrazení konečné ceny
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div id="checkout-terms" className={`bg-white/5 rounded-xl p-4 border transition-all ${submitted && !termsAccepted ? 'border-red-500/40 bg-red-500/5' : 'border-emerald-500/20'}`}>
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="flex-shrink-0 pt-1">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-emerald-500/30 bg-black/30 text-emerald-500 focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-300 group-hover:text-white transition-colors">
                  Souhlasím s{' '}
                  <a href="#" className="text-emerald-400 hover:text-emerald-300 underline">
                    obchodními podmínkami
                  </a>
                  {' '}a{' '}
                  <a href="#" className="text-emerald-400 hover:text-emerald-300 underline">
                    zásadami ochrany osobních údajů
                  </a>
                </p>
                {submitted && !termsAccepted && (
                  <p className="mt-1 text-xs text-red-400">Muste souhlasit s obchodnimi podminkami</p>
                )}
              </div>
            </label>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="group relative w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:from-emerald-500 hover:to-teal-500 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            <span className="relative flex items-center justify-center gap-2">
              {loading ? 'Vytváření objednávky...' : (
                <>
                  Dokončit objednávku
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-fadeSlideIn {
          animation: fadeSlideIn 0.5s ease-out;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
