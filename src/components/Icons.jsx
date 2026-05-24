const Icon = ({ d, size = 20, stroke = 'currentColor', sw = 1.6, fill = 'none', children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {d ? <path d={d} /> : children}
  </svg>
);

export const IconHeart = ({ filled, ...p }) => (
  <Icon {...p} fill={filled ? (p.stroke || 'currentColor') : 'none'}
    d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9Z" />
);
export const IconSearch = (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></Icon>;
export const IconMenu = (p) => <Icon {...p}><path d="M4 7h16M4 12h16M4 17h10"/></Icon>;
export const IconBack = (p) => <Icon {...p} d="M15 19l-7-7 7-7" />;
export const IconHome = (p) => <Icon {...p} d="M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z" />;
export const IconCar = (p) => (
  <Icon {...p}>
    <path d="M5 17h14M5 17v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-2M19 17v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2M3 17l1.5-6a2 2 0 0 1 2-1.5h11a2 2 0 0 1 2 1.5L21 17M3 17h18M7 13h10"/>
    <circle cx="7" cy="17" r="1.3"/><circle cx="17" cy="17" r="1.3"/>
  </Icon>
);
export const IconWhatsapp = ({ size = 20, fill = '#fff' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
    <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.2-.7.2-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.5-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.5c-.2 0-.5.1-.7.4-.3.3-1 1-1 2.4 0 1.4 1 2.8 1.2 3 .1.2 2 3 4.8 4.2 1.7.7 2.3.8 3.1.7.5-.1 1.7-.7 1.9-1.3.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3z"/>
    <path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.5A10 10 0 1 0 12 2zm0 18.2c-1.5 0-2.9-.4-4.1-1.1l-.3-.2-3.1.9.9-3-.2-.3a8.2 8.2 0 1 1 6.8 3.7z"/>
  </svg>
);
export const IconFilter = (p) => <Icon {...p} d="M3 5h18M6 12h12M10 19h4" />;
export const IconClose = (p) => <Icon {...p} d="M6 6l12 12M18 6L6 18" />;
export const IconChevron = (p) => <Icon {...p} d="M9 6l6 6-6 6" />;
export const IconLocation = (p) => (
  <Icon {...p}><path d="M12 22s-7-7-7-12a7 7 0 0 1 14 0c0 5-7 12-7 12z"/><circle cx="12" cy="10" r="2.5"/></Icon>
);
export const IconGauge = (p) => (
  <Icon {...p}><path d="M12 14l4-4M3 13a9 9 0 0 1 18 0"/><circle cx="12" cy="14" r="1.2" fill="currentColor"/></Icon>
);
export const IconFuel = (p) => (
  <Icon {...p}><path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M3 21h14M15 9h2a2 2 0 0 1 2 2v6a1.5 1.5 0 0 0 3 0V9l-3-3"/></Icon>
);
export const IconGear = (p) => (
  <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></Icon>
);
export const IconCalendar = (p) => (
  <Icon {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></Icon>
);
export const IconShield = (p) => <Icon {...p} d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />;
export const IconBolt = (p) => <Icon {...p} d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />;
export const IconShare = (p) => (
  <Icon {...p}><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8 11l8-4M8 13l8 4"/></Icon>
);
export const IconCheck = (p) => <Icon {...p} d="M5 13l4 4 10-12" />;
export const IconClock = (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>;
export const IconCalc = (p) => (
  <Icon {...p}><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h2M12 11h2M16 11h0M8 15h2M12 15h2M16 15h0M8 19h6"/></Icon>
);
export const IconStar = ({ filled, ...p }) => (
  <Icon {...p} fill={filled ? p.stroke || 'currentColor' : 'none'}
    d="M12 3l2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8-5.4 2.8 1-6L3.3 9.4l6-.9z" />
);
export const IconGavel = (p) => (
  <Icon {...p}><path d="M14 4l6 6M11 7l6 6M7 11l6 6M3 21l6-6M14 14l3 3M19 13l-3-3"/></Icon>
);
export const IconHandshake = (p) => (
  <Icon {...p}><path d="M3 12l4-4 5 5-4 4-5-5zM12 13l5-5 4 4-5 5-4-4zM8 8l4-4 4 4M11 17l3 3"/></Icon>
);
export const IconArrowRight = (p) => <Icon {...p} d="M5 12h14M12 5l7 7-7 7" />;
export const IconMoon = (p) => <Icon {...p} d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />;
export const IconSun = (p) => (
  <Icon {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></Icon>
);
export const IconPhone = (p) => (
  <Icon {...p}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7A2 2 0 0 1 22 16.9z"/></Icon>
);
