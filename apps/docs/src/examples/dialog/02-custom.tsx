import { Button, Dialog, DialogClose, Input } from '@yuki-ui/react';

export default function KeepDraft() {
  return (
    <Dialog title="团队备注" description="关闭后重新打开仍可编辑草稿。" size="sm"
      contentProps={{ forceMount: true }} trigger={<Button variant="outline">编辑备注</Button>}
      footer={<DialogClose asChild><Button>保留草稿并关闭</Button></DialogClose>}>
      <Input aria-label="团队备注" placeholder="填写备注" />
    </Dialog>
  );
}
