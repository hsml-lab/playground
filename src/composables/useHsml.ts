import { compileContentWithDiagnostics, formatContent } from 'hsml';

export interface HsmlDiagnostic {
  severity: 'error' | 'warning';
  message: string;
  code: string | null;
  location: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  } | null;
}

export interface HsmlCompileResult {
  success: boolean;
  html: string | null;
  diagnostics: HsmlDiagnostic[];
}

export function compile(source: string): HsmlCompileResult {
  return compileContentWithDiagnostics(source) as HsmlCompileResult;
}

export function format(
  source: string,
  options: { indentSize?: number; printWidth?: number } = {},
): string {
  return formatContent(source, options);
}
