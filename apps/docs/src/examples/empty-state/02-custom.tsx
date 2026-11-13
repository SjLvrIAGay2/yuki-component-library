import { EmptyState, Icon } from '@yuki-ui/react';

export default function CompletedReview() {
  return <EmptyState title="审阅已完成" icon={<Icon name="check-circle" />}
    description="处理过的文件可以在交付记录中找到。" />;
}
