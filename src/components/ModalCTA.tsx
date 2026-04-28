import React, { useState } from 'react';
import Btn from './Btn';
import WaitlistModal from './WaitlistModal';
import DemoModal from './DemoModal';

interface Props {
  modal: 'waitlist' | 'demo';
  audience?: string;
  kind?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  children: React.ReactNode;
}

export default function ModalCTA({ modal, audience = "member", kind = "primary", size = "lg", icon, children }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Btn kind={kind} size={size} icon={icon} onClick={() => setOpen(true)}>
        {children}
      </Btn>
      {open && modal === "waitlist" && <WaitlistModal initialAudience={audience} onClose={() => setOpen(false)} />}
      {open && modal === "demo" && <DemoModal onClose={() => setOpen(false)} />}
    </>
  );
}
