import { useState } from 'react';
import { Button, Space, Tour } from '@yuki-ui/react';

const steps = [
  {
    target: '#tour-custom-card',
    title: '卡片区域',
    description: '关闭遮罩后仍会显示高亮描边，适合嵌入式提示。',
    placement: 'bottom' as const,
  },
  {
    target: '#tour-custom-more',
    title: '偏好设置',
    description: '支持左右方向键切换步骤、Esc 跳过。',
    placement: 'right' as const,
  },
];

export default function CustomTour() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const [mask, setMask] = useState(true);

  return (
    <Space direction="vertical" size="5">
      <Space wrap size="3">
        <Button
          onClick={() => {
            setCurrent(0);
            setOpen(true);
          }}
        >
          开始自定义导览
        </Button>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--yuki-space-2)' }}>
          <input type="checkbox" checked={mask} onChange={(event) => setMask(event.target.checked)} />
          显示遮罩
        </label>
      </Space>

      <div
        id="tour-custom-card"
        style={{
          padding: 'var(--yuki-space-5)',
          border: '1px solid var(--yuki-color-border-subtle)',
          borderRadius: 'var(--yuki-radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--yuki-space-4)',
          maxWidth: 480,
        }}
      >
        <span style={{ fontSize: 'var(--yuki-font-size-sm)' }}>接收产品更新邮件</span>
        <input id="tour-custom-more" type="checkbox" aria-label="接收产品更新邮件" />
      </div>

      <Tour
        open={open}
        onOpenChange={setOpen}
        steps={steps}
        current={current}
        onCurrentChange={setCurrent}
        mask={mask}
        arrow={false}
        skipText="稍后再说"
        prevText="回退"
        nextText="继续"
        finishText="我知道了"
        onFinish={() => setOpen(false)}
      />
    </Space>
  );
}
