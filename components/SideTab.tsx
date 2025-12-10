// components/SideTab.tsx
import React, { useState } from 'react';

export type SideTabOption = 'drishti' | 'falcon' | null;

interface SideTabProps {
  onSelect?: (opt: SideTabOption) => void;
}

const SideTab: React.FC<SideTabProps> = ({ onSelect }) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<SideTabOption>(null);

  const handleSelect = (opt: SideTabOption) => {
    setSelected(opt);
    onSelect?.(opt);
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        top: '120px',
        zIndex: 1200,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        pointerEvents: 'auto',
        transition: 'all 0.25s ease',
      }}
    >
      {/* Handle */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          background: '#1f2937',
          width: '36px',
          height: '96px',
          borderRadius: '0 8px 8px 0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
          marginRight: '8px',
        }}
      >
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: '18px',
              height: '2px',
              background: '#cbd5e1',
              margin: '3px 0',
              borderRadius: '2px',
            }}
          />
        ))}
      </div>

      {/* Sliding panel */}
      <div
        style={{
          width: open ? '260px' : '0px',
          overflow: 'hidden',
          background: '#ffffff',
          borderRadius: '0 8px 8px 0',
          boxShadow: open ? '0 6px 24px rgba(15,23,42,0.15)' : 'none',
          transition: 'all 0.25s ease',
          padding: open ? '12px' : '0px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #e5e7eb',
            paddingBottom: '8px',
            marginBottom: '10px',
          }}
        >
          <strong style={{ fontSize: '15px' }}>Tools</strong>
          <button
            onClick={() => setOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => handleSelect('drishti')}
            style={{
              padding: '10px',
              borderRadius: '6px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              background:
                selected === 'drishti'
                  ? 'linear-gradient(90deg, #eef2ff, #f4f9ff)'
                  : '#f8fafc',
              border:
                selected === 'drishti'
                  ? '1px solid #c7e0ff'
                  : '1px solid transparent',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontWeight: 600, fontSize: '14px' }}>
              Drishti Vision
            </div>
            <div style={{ fontSize: '12px', color: '#475569' }}>
              Image analysis (coming soon)
            </div>
          </button>

          <button
            onClick={() => handleSelect('falcon')}
            style={{
              padding: '10px',
              borderRadius: '6px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              background:
                selected === 'falcon'
                  ? 'linear-gradient(90deg, #eef2ff, #f4f9ff)'
                  : '#f8fafc',
              border:
                selected === 'falcon'
                  ? '1px solid #c7e0ff'
                  : '1px solid transparent',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontWeight: 600, fontSize: '14px' }}>Falcon</div>
            <div style={{ fontSize: '12px', color: '#475569' }}>
              Text model (coming soon)
            </div>
          </button>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: '12px',
            paddingTop: '8px',
            borderTop: '1px solid #e5e7eb',
            fontSize: '12px',
            color: '#64748b',
          }}
        >
          Selected: {selected ? ` ${selected}` : ' None'}
        </div>
      </div>
    </div>
  );
};

export default SideTab;
