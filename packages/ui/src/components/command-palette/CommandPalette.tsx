import { useEffect, useId, useRef, useState, type ReactElement, type ReactNode } from 'react';
import { Dialog, type DialogProps } from '../dialog';
import { Input } from '../input';
import { useControllableState } from '../../hooks';
import { useLocale } from '../../theme';

export interface CommandItem {
  id: string;
  label: string;
  keywords?: readonly string[];
  group?: string;
  disabled?: boolean;
  icon?: ReactNode;
}

export interface CommandPaletteProps {
  items: readonly CommandItem[];
  onSelect: (item: CommandItem) => void;
  trigger?: ReactElement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  placeholder?: string;
  empty?: ReactNode;
  className?: string;
  portalContainer?: DialogProps['portalContainer'];
}

function CommandList({ items, onSelect, inputLabel, empty }: Pick<CommandPaletteProps, 'items' | 'onSelect' | 'empty'> & { inputLabel: string }) {
  const id = useId();
  const list = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState<string>();
  const words = query.toLowerCase().trim().split(/\s+/);
  const groups = new Map<string, CommandItem[]>();
  for (const item of items) {
    const text = [item.label, item.group, ...(item.keywords ?? [])].join(' ').toLowerCase();
    if (!words.every(word => text.includes(word))) continue;
    const group = item.group ?? '';
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group)!.push(item);
  }
  const enabled = [...groups.values()].flat().filter(item => !item.disabled);
  const active = enabled.find(item => item.id === highlight) ?? enabled[0];
  const optionId = (item: CommandItem) => id + '-option-' + encodeURIComponent(item.id);
  useEffect(() => {
    list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView?.({ block: 'nearest' });
  }, [active?.id]);

  return <div className="yuki-command-palette">
    <Input role="combobox" aria-label={inputLabel} placeholder={inputLabel} autoComplete="off"
      aria-autocomplete="list" aria-expanded aria-controls={id}
      aria-activedescendant={active && optionId(active)} value={query}
      onChange={value => { setQuery(value); setHighlight(undefined); }}
      onKeyDown={event => {
        if (event.nativeEvent.isComposing || event.keyCode === 229 || !active) return;
        const index = enabled.indexOf(active);
        let next: CommandItem | undefined;
        switch (event.key) {
          case 'ArrowDown': next = enabled[(index + 1) % enabled.length]; break;
          case 'ArrowUp': next = enabled[(index + enabled.length - 1) % enabled.length]; break;
          case 'Enter': event.preventDefault(); onSelect(active); return;
          default: return;
        }
        event.preventDefault();
        setHighlight(next?.id);
      }} />
    <div id={id} ref={list} role="listbox" aria-label={inputLabel} className="yuki-command-palette__list">
      {[...groups].map(([group, options]) =>
        <div key={group} role={group ? 'group' : undefined} aria-label={group || undefined}>
          {group && <div className="yuki-command-palette__group" aria-hidden="true">{group}</div>}
          {options.map(item => <div key={item.id} id={optionId(item)} role="option"
            className="yuki-command-palette__option" aria-selected={item.id === active?.id}
            aria-disabled={item.disabled || undefined}
            onPointerMove={() => { if (!item.disabled) setHighlight(item.id); }}
            onMouseDown={event => event.preventDefault()}
            onClick={() => { if (!item.disabled) onSelect(item); }}>
            {item.icon && <span aria-hidden="true">{item.icon}</span>}{item.label}
          </div>)}
        </div>)}
    </div>
    {groups.size === 0 && <div role="status" className="yuki-command-palette__empty">{empty}</div>}
  </div>;
}

/** Searchable actions with focus management and a theme-aware dialog portal. */
export function CommandPalette({ items, onSelect, open, defaultOpen = false, onOpenChange,
  trigger, title, placeholder, empty, className, portalContainer }: CommandPaletteProps) {
  const { t } = useLocale();
  const [visible, setVisible] = useControllableState({ value: open, defaultValue: defaultOpen, onChange: onOpenChange });
  return <Dialog open={visible} onOpenChange={setVisible} trigger={trigger} portalContainer={portalContainer}
    title={title ?? t('commandTitle')} className={className}
    contentProps={{ onOpenAutoFocus(event) {
      const input = (event.currentTarget as HTMLElement | null)?.querySelector<HTMLInputElement>('[role="combobox"]');
      if (input) { event.preventDefault(); input.focus(); }
    } }}>
    {visible && <CommandList items={items} inputLabel={placeholder ?? t('commandSearch')}
      empty={empty ?? t('commandEmpty')} onSelect={item => { setVisible(false); onSelect(item); }} />}
  </Dialog>;
}
