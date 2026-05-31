import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MoneyFlowLink, MoneyFlowNode } from "@/app/actions/analysis/get-money-flow";

interface SankeyTableFallbackProps {
  nodes: MoneyFlowNode[];
  links: MoneyFlowLink[];
}

/**
 * Accessible / no-JS mirror of the Sankey ribbons. Lists every category-leaf
 * link with its yen amount. Wrapped in <details> so it stays out of the way
 * for sighted users while remaining fully readable for screen readers.
 */
export function SankeyTableFallback({ nodes, links }: SankeyTableFallbackProps) {
  const labelById = new Map(nodes.map((n) => [n.id, n.label]));
  const leafLinks = links.filter((l) => {
    const target = nodes.find((n) => n.id === l.target);
    return target?.level === 2;
  });

  if (leafLinks.length === 0) return null;

  return (
    <details className="mt-4 text-sm">
      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
        表形式で表示
      </summary>
      <div className="mt-2 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>カテゴリ</TableHead>
              <TableHead>項目</TableHead>
              <TableHead className="text-right">金額</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leafLinks.map((link) => (
              <TableRow key={`${link.source}->${link.target}`}>
                <TableCell>{labelById.get(link.source)}</TableCell>
                <TableCell>{labelById.get(link.target)}</TableCell>
                <TableCell className="text-right tabular-nums">
                  ¥{link.value.toLocaleString("ja-JP")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </details>
  );
}
