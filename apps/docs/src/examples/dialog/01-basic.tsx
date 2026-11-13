import { useState } from 'react';
import { Button, Dialog, DialogClose, Input } from '@yuki-ui/react';

export default function EditProject() {
  const [project, setProject] = useState('设计系统');
  const [draft, setDraft] = useState(project);
  return (
    <Dialog
      title="项目名称"
      description="保存后将更新项目列表中的名称。"
      trigger={<Button variant="outline">重命名「{project}」</Button>}
      onOpenChange={(open) => { if (open) setDraft(project); }}
      footer={
        <DialogClose asChild>
          <Button disabled={!draft.trim()} onClick={() => setProject(draft.trim())}>保存</Button>
        </DialogClose>
      }
    >
      <Input aria-label="项目名称" value={draft} onChange={setDraft} />
    </Dialog>
  );
}
