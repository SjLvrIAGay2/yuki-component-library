import { useState } from 'react';
import { Button, RedirectPage } from '@yuki-ui/react';

export default function ScheduledRedirect() {
  const [attempt, setAttempt] = useState(0);
  return attempt === 0 ? <Button variant="outline" onClick={() => setAttempt(1)}>预览倒计时</Button> : (
    <RedirectPage key={attempt} href="#/tokens" autoRedirect delay={10}
      targetDescription="十秒后前往设计令牌，可以立即跳转或取消。"
      onCancel={() => setAttempt(0)} onNavigate={href => { window.location.hash = href; }} />
  );
}
