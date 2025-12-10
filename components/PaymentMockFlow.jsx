import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from '../context/CartContext';
import "./PaymentMockFlow.css";
// generateInvoicePdf yanına getInvoiceBase64 eklendi
import { generateInvoicePdf, getInvoiceBase64 } from "./invoiceUtils";

export default function PaymentMockFlow({
  amount,
  currency = "TRY",
  cartItems = [],
  order = null,
  onSuccess,
  onCancel,
}) {
  const navigate = useNavigate();
  const { setNotification } = useCart();
  const [step, setStep] = useState("card"); 
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [orderId, setOrderId] = useState(null);

  // Email gönderme fonksiyonunda PDF oluşturma mantığı eklendi
  // Not: Backend'e göndermek için 'fullOrderData' parametresini ekliyoruz
  async function sendOrderEmail(orderId, amount, fullOrderData) {
    try {
      let userEmail = localStorage.getItem('user_email') || 'almiraaygun@gmail.com';
      if (!userEmail.includes('@gmail.com') && !userEmail.includes('@sabanciuniv.edu')) {
        userEmail = 'almiraaygun@gmail.com';
      }
      const userName = localStorage.getItem('user_name') || 'Müşteri';
      
      // PDF Base64 verisini oluştur
      let pdfData = null;
      if (fullOrderData) {
        try {
           pdfData = getInvoiceBase64(fullOrderData);
        } catch (pdfErr) {
           console.error("PDF generation failed for email:", pdfErr);
        }
      }

      const response = await fetch('http://localhost:8000/api/send-order-email/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: userEmail,
          user_name: userName,
          order_id: orderId,
          amount: amount,
          currency: currency,
          items: cartItems.map(item => ({
            name: item.name || item.product_name,
            quantity: item.quantity || 1,
            price: item.price || 0
          })),
          // Backend'e PDF verisini gönderiyoruz
          pdf_base64: pdfData 
        })
      });
      
      if (response.ok) {
        if (setNotification) {
            setNotification('✅ Faturanız email adresinize gönderildi!');
        }
      } else {
        if (setNotification) {
            setNotification('⚠️ Sipariş alındı fakat email gönderilemedi.');
        }
      }
    } catch (error) {
      console.error('⚠️ Email hatası:', error);
      if (setNotification) {
          setNotification('⚠️ Email servisinde geçici bir sorun oluştu.');
      }
    }
  }

  const maskedCard = cardNumber
    ? "**** **** **** " + (cardNumber.slice(-4) || "0000")
    : "**** **** **** 0000";

  function handleCardSubmit(e) {
    e.preventDefault();
    if (!cardName || !cardNumber || !expiry || !cvv) {
      setError("Please fill in all fields.");
      return;
    }
    if (cardNumber.replace(/\s/g, "").length < 12) {
      setError("Card number looks too short.");
      return;
    }
    if (cvv.length < 3) {
      setError("CVV must be at least 3 digits.");
      return;
    }
    setError("");
    setStep("3ds");
  }

  async function handle3DSConfirm(e) {
    e.preventDefault();
    if (code !== "123456") {
      setError("Incorrect code.");
      return;
    }
    setError("");
    
    try {
      const userEmail = localStorage.getItem('user_email') || 'almiraaygun@gmail.com';
      const userName = localStorage.getItem('user_name') || 'Müşteri';
      const deliveryAddress = localStorage.getItem('user_address') || 'Sabancı University, Istanbul, Turkey';
      
      if (!cartItems || cartItems.length === 0) {
        setError("Cart is empty.");
        return;
      }
      
      // Tüm ürünleri tek bir sipariş olarak birleştir
      const totalQuantity = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
      const productNames = cartItems.map(item => 
        `${item.name || item.product_name || 'Product'} (x${item.quantity || 1})`
      ).join(', ');
      
      // İlk ürünün ID'sini kullan (veya 0)
      const firstProductId = cartItems.length > 0 ? (cartItems[0].id || cartItems[0].product_id || 0) : 0;
      
      // DEBUG: Console'a yazdır (stok kontrolü için)
      console.log('📦 Order Data:', {
        product_id: firstProductId,
        quantity: totalQuantity,
        cartItems: cartItems.map(item => ({ id: item.id, name: item.name }))
      });
      
      const orderData = {
        customer_name: userName,
        customer_email: userEmail,
        product_name: productNames, // Tüm ürünlerin birleşik adı
        product_id: firstProductId,
        quantity: totalQuantity, // Toplam miktar
        total_price: amount, // Toplam fiyat
        delivery_address: deliveryAddress
      };
      
      const orderResponse = await fetch('http://localhost:8000/orders/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });
      
      let mainOrderId;
      if (orderResponse.ok) {
        const orderResult = await orderResponse.json();
        mainOrderId = orderResult.order?.delivery_id || orderResult.delivery_id;
      } else {
        console.error('Order creation failed');
        mainOrderId = `INV-${Math.floor(Math.random() * 900000 + 100000)}`;
      }
      
      setOrderId(mainOrderId);
      
      // Fatura için gerekli veri objesini hazırla
      // NOT: Gerçek projede vergi ve subtotal hesaplaması daha hassas yapılmalı.
      const subtotalVal = amount / 1.18; 
      const taxVal = amount - subtotalVal;
      
      const fullOrderData = {
        id: mainOrderId,
        date: new Date().toLocaleDateString('tr-TR'),
        customerName: userName,
        paymentMethod: "Credit Card",
        address: {
            line1: deliveryAddress,
            city: "Istanbul",
            country: "Turkey"
        },
        items: cartItems.map(i => ({
            name: i.name || i.product_name,
            quantity: i.quantity || 1,
            price: i.price || 0
        })),
        subtotal: subtotalVal,
        tax: taxVal,
        total: amount
      };

      // Modal kapanmasın, başarı ekranına geçsin
      setStep("success");
      
      // Email işlemini (PDF ekleyerek) başlat
      // React state güncellemesi asenkron olduğu için 'order' prop'u yerine
      // burada oluşturduğumuz 'fullOrderData'yı kullanıyoruz.
      sendOrderEmail(mainOrderId, amount, fullOrderData);
      
      // Trigger event to refresh products (stock updated)
      window.dispatchEvent(new Event('orderSuccess'));
      // Also set a flag in localStorage so Products component can check on mount
      localStorage.setItem('orderSuccess', Date.now().toString());
      
    } catch (error) {
      console.error('Error creating order:', error);
      setError('An error occurred. Please try again.');
    }
  }

  function handleClose() {
    if (step === "success") {
      if (onSuccess) onSuccess(orderId);
      else if (onCancel) onCancel();
      return;
    }
    if (onCancel) onCancel();
  }

  function handleContinueToProfile() {
    if (onSuccess) onSuccess(orderId);
    navigate('/profile');
  }

  function handleDownloadInvoice() {
    // Eğer dışarıdan gelen order prop'u yoksa, son işlemdeki veriyi kullanmak gerekebilir
    // Ancak basitlik adına mevcut order prop'unu veya başarı ekranındaki veriyi kullanıyoruz.
    if (!order) return;
    try {
      generateInvoicePdf(order);
    } catch (err) {
      console.error("Failed to generate invoice PDF", err);
    }
  }

  return (
    <div className="pm-overlay">
      <div className="pm-modal">
        <div className="pm-header">
          <h2>Payment Gateway</h2>
          <button className="pm-close" onClick={handleClose}>×</button>
        </div>

        <div className="pm-amount">
          <span>Amount:</span>
          <strong>
            {amount?.toFixed ? amount.toFixed(2) : amount} {currency}
          </strong>
        </div>

        {step === "card" && (
          <form className="pm-form" onSubmit={handleCardSubmit}>
            <h3>Enter Card Details</h3>
            <label>
              Cardholder Name
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="Merve Gün"
              />
            </label>

            <label>
              Card Number
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="4242 4242 4242 4242"
              />
            </label>

            <div className="pm-row">
              <label>
                Expiry (MM/YY)
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  placeholder="12/29"
                />
              </label>
              <label>
                CVV
                <input
                  type="password"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  placeholder="123"
                />
              </label>
            </div>

            {error && <div className="pm-error">{error}</div>}

            <button type="submit" className="pm-primary">
              Continue to 3D Secure
            </button>
          </form>
        )}

        {step === "3ds" && (
          <form className="pm-form" onSubmit={handle3DSConfirm}>
            <h3>3D Secure Verification</h3>
            <p className="pm-bank-title">Mock Bank • 3D Secure</p>
            <div className="pm-3ds-box">
              <p>We sent a one-time password (OTP) to your phone.</p>
              <p>
                <strong>Card:</strong> {maskedCard}
              </p>
              <p>
                <strong>Amount:</strong> {amount} {currency}
              </p>
            </div>

            <label>
              Enter 6-digit code:
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                placeholder="••••••"
              />
            </label>

            {error && <div className="pm-error">{error}</div>}

            <button type="submit" className="pm-primary">
              Confirm Payment
            </button>
          </form>
        )}

        {step === "success" && (
          <div className="pm-success">
            <div className="pm-success-icon">✔</div>
            <h3>Payment successful</h3>
            {/* GÜNCELLEME: İstenilen yazı değişikliği */}
            <p>Your order details and invoice have been sent to your email address.</p>
            
            <p className="pm-success-order">
              Order number: <span>{orderId}</span>
            </p>
            <p className="pm-success-amount">
              Amount paid: <strong>{amount} {currency}</strong>
            </p>

            {order && (
              <div className="pm-invoice-preview">
                <h4>Invoice Summary</h4>
                <p>
                  <strong>Customer:</strong> {order.customerName || "-"}
                </p>
                <p>
                  <strong>Date:</strong> {order.date || "-"}
                </p>
                <p>
                  <strong>Payment method:</strong> {order.paymentMethod || "-"}
                </p>

                <div className="pm-invoice-items">
                  {(order.items || []).map((item, idx) => (
                    <div key={idx} className="pm-invoice-item">
                      <span>{item.name}</span>
                      <span>x{item.quantity ?? 1}</span>
                      <span>
                        {(item.price ?? 0).toFixed(2)} TRY
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pm-invoice-totals">
                  <div>
                    Subtotal:{" "}
                    <strong>
                      {(order.subtotal ?? 0).toFixed(2)} TRY
                    </strong>
                  </div>
                  <div>
                    Tax:{" "}
                    <strong>
                      {(order.tax ?? 0).toFixed(2)} TRY
                    </strong>
                  </div>
                  <div>
                    Total:{" "}
                    <strong>
                      {(order.total ?? 0).toFixed(2)} TRY
                    </strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="pm-primary pm-invoice-download"
                  onClick={handleDownloadInvoice}
                >
                  Download Invoice (PDF)
                </button>
              </div>
            )}

            <button className="pm-primary" onClick={handleContinueToProfile}>
              Continue to Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}