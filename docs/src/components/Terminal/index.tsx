import type {ReactNode} from 'react';

type CodeLine = {
  type: 'command' | 'output' | 'success';
  text: string;
  arg?: string;
};

type CodeBlockProps = {
  title?: string;
  lines: CodeLine[];
};

export default function CodeBlock({title, lines}: CodeBlockProps): ReactNode {
  return (
    <div className="bs-code">
      {title && (
        <div className="bs-code__header">
          <span className="bs-code__title">{title}</span>
        </div>
      )}
      <div className="bs-code__body">
        {lines.map((line, idx) => {
          if (line.type === 'command') {
            return (
              <span key={idx} className="bs-code__line">
                <span className="bs-code__prompt">$ </span>
                <span className="bs-code__cmd">{line.text}</span>
                {line.arg && <span className="bs-code__arg"> {line.arg}</span>}
              </span>
            );
          }
          const cls = line.type === 'success' ? 'bs-code__ok' : 'bs-code__muted';
          return (
            <span key={idx} className={`bs-code__line ${cls}`}>
              {line.text}
            </span>
          );
        })}
      </div>
    </div>
  );
}
