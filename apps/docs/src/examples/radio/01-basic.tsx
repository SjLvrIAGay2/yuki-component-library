import { Radio, RadioGroup } from '@yuki-ui/react';

export default function BasicRadio() {
  return (
    <RadioGroup defaultValue="pro" name="plan">
      <Radio value="free">免费版</Radio>
      <Radio value="pro">专业版</Radio>
      <Radio value="enterprise">企业版</Radio>
    </RadioGroup>
  );
}
