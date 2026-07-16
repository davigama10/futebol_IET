import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthShellProps {
  title: string;
  children: React.ReactNode;
}

export function AuthShell({ title, children }: AuthShellProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary/10 via-background to-background p-6">
      <Card className="w-full max-w-sm border-primary/10 shadow-xl">
        <CardHeader className="items-center justify-items-center text-center">
          <span className="mb-2 flex size-14 items-center justify-center rounded-full bg-primary/10 text-3xl">
            ⚽
          </span>
          <CardTitle className="text-2xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}
