import { QRCode } from '@yuki-ui/react';

export default function BasicQRCode() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--yuki-space-6)' }}>
      <QRCode value="https://yuki-ui.dev" />
      <QRCode value="https://yuki-ui.dev" size={120} level="H" bordered />
    </div>
  );
}
