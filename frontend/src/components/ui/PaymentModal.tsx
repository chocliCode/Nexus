import React, { useState, useEffect } from 'react';
import { Modal } from './index';
import { QrCode, Smartphone, Loader2, CheckCircle2 } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onConfirm: () => void;
  title?: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, amount, onConfirm, title = "Pago con Yape" }) => {
  const [step, setStep] = useState<'qr' | 'processing' | 'success'>('qr');

  useEffect(() => {
    if (isOpen) {
      setStep('qr');
    }
  }, [isOpen]);

  const handlePayment = () => {
    setStep('processing');
    // Simulate network request
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onConfirm();
      }, 1500);
    }, 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={step === 'processing' ? () => {} : onClose} title={title}>
      <div className="flex flex-col items-center justify-center py-4 px-2 space-y-6">
        {step === 'qr' && (
          <>
            <div className="text-center">
              <p className="text-sm text-neutral-500 mb-1">Escanea el código QR con tu app de Yape para pagar:</p>
              <h3 className="text-4xl font-black text-neutral-800 tracking-tight">S/ {amount.toFixed(2)}</h3>
            </div>

            <div className="w-56 h-56 bg-white border-4 border-[#742384] rounded-3xl flex flex-col items-center justify-center p-4 shadow-xl shadow-[#742384]/20 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-8 bg-[#742384] flex items-center justify-center">
                <span className="text-white text-xs font-bold tracking-widest">YAPE</span>
              </div>
              <QrCode className="w-40 h-40 text-[#742384] mt-6" />
            </div>

            <div className="w-full flex flex-col gap-3">
              <button onClick={handlePayment} className="w-full py-3.5 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg" style={{ backgroundColor: '#742384' }}>
                <Smartphone className="w-5 h-5" />
                Simular "Ya yapeé"
              </button>
              <button onClick={onClose} className="w-full py-3 rounded-xl font-medium text-neutral-500 hover:bg-neutral-100 transition-colors">
                Cancelar
              </button>
            </div>
          </>
        )}

        {step === 'processing' && (
          <div className="py-12 flex flex-col items-center justify-center text-center animate-fade-in space-y-4">
            <Loader2 className="w-16 h-16 text-[#742384] animate-spin" />
            <h4 className="text-xl font-bold text-neutral-800">Verificando pago...</h4>
            <p className="text-sm text-neutral-500">Estamos validando tu transacción con Yape.</p>
          </div>
        )}

        {step === 'success' && (
          <div className="py-12 flex flex-col items-center justify-center text-center animate-fade-in space-y-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h4 className="text-2xl font-bold text-neutral-800">¡Pago Exitoso!</h4>
            <p className="text-sm text-neutral-500">Tu membresía está siendo activada...</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PaymentModal;
