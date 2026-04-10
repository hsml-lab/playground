import { compileContentWithDiagnostics, convertHtml, formatContent } from 'hsml';

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

export interface CompileOptions {
  pretty?: boolean;
  indentSize?: number;
}

export function compile(source: string, options: CompileOptions = {}): HsmlCompileResult {
  return compileContentWithDiagnostics(source, options) as HsmlCompileResult;
}

export function format(
  source: string,
  options: { indentSize?: number; printWidth?: number } = {},
): string {
  return formatContent(source, options);
}

export function htmlToHsml(html: string): string {
  return convertHtml(html);
}
