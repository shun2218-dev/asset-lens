import type { Meta, StoryObj } from "@storybook/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShortcutHelpDialog } from "./shortcut-help-dialog";

const SHORTCUT_GROUPS = [
  {
    title: "一般",
    shortcuts: [
      { keys: ["⌘", "K"], description: "取引をすばやく記録" },
      { keys: ["?"], description: "ショートカット一覧を表示" },
    ],
  },
  {
    title: "ナビゲーション",
    shortcuts: [
      { keys: ["G", "D"], description: "ダッシュボードへ移動" },
      { keys: ["G", "T"], description: "取引一覧へ移動" },
      { keys: ["G", "S"], description: "設定へ移動" },
    ],
  },
];

const meta: Meta<typeof ShortcutHelpDialog> = {
  title: "Features/Shortcuts/ShortcutHelpDialog",
  component: ShortcutHelpDialog,
  parameters: {
    docs: {
      description: {
        component: `キーボードショートカットのヘルプダイアログ。

## 表示方法
- **キーボード**: \`?\` キーを押す（入力フィールド以外の場所で）

## 利用可能なショートカット
| キー | 機能 |
|------|------|
| \`⌘ + K\` | 取引をすばやく記録 |
| \`?\` | ショートカット一覧を表示 |
| \`G → D\` | ダッシュボードへ移動 |
| \`G → T\` | 取引一覧へ移動 |
| \`G → S\` | 設定へ移動 |

## 注意事項
- テキスト入力中はショートカットは無効
- ダイアログはトグル動作（再度 \`?\` で閉じる）`,
      },
    },
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof ShortcutHelpDialog>;

/** ダイアログが閉じた状態。`?` キーで開きます。 */
export const Default: Story = {
  render: () => <ShortcutHelpDialog />,
};

/** ダイアログが開いた状態のプレビュー */
export const Open: Story = {
  render: () => (
    <Dialog open>
      <DialogContent className="sm:max-w-[480px]" id="shortcut-help-dialog">
        <DialogHeader>
          <DialogTitle>キーボードショートカット</DialogTitle>
          <DialogDescription>
            利用可能なキーボードショートカットの一覧です
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.description}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, i) => (
                        <span key={`${shortcut.description}-${key}-${i}`}>
                          {i > 0 && (
                            <span className="text-muted-foreground mx-0.5 text-xs">
                              then
                            </span>
                          )}
                          <kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-1.5 bg-muted border border-border rounded-md text-xs font-mono font-medium shadow-sm">
                            {key}
                          </kbd>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "ダイアログが開いた状態。全てのショートカットがグループ別に表示されます。",
      },
    },
  },
};
