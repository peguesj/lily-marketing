import React, { useState, createContext, useContext } from 'react';
import WaitlistModal from './WaitlistModal';
import DemoModal from './DemoModal';

type ModalType = 'waitlist' | 'demo' | null;

interface ModalContextType {
  openWaitlist: (audience?: string) => void;
  openDemo: () => void;
  close: () => void;
}

const ModalCtx = createContext<ModalContextType>({
  openWaitlist: () => {},
  openDemo: () => {},
  close: () => {},
});

export const useModal = () => useContext(ModalCtx);

export default function ModalProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState<ModalType>(null);
  const [audience, setAudience] = useState("member");

  const openWaitlist = (a = "member") => { setAudience(a); setActive("waitlist"); };
  const openDemo = () => setActive("demo");
  const close = () => setActive(null);

  return (
    <ModalCtx.Provider value={{ openWaitlist, openDemo, close }}>
      {children}
      {active === "waitlist" && <WaitlistModal initialAudience={audience} onClose={close} />}
      {active === "demo" && <DemoModal onClose={close} />}
    </ModalCtx.Provider>
  );
}
