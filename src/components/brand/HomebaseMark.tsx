interface HomebaseMarkProps {
  className?: string;
  title?: string;
}

export function HomebaseMark({ className = "size-7", title = "Homebase" }: HomebaseMarkProps) {
  return (
    <svg className={className} viewBox="0 0 128 128" role="img" aria-label={title}>
      <path
        fill="currentColor"
        d="M19 42 51 23v19L36 51v24L19 85V42Zm90 0v43L92 75V51l-15-9V23l32 19ZM27 96l17-10 20 12 20-12 17 10-37 21-37-21Z"
      />
      <circle cx="64" cy="64" r="15" fill="currentColor" />
    </svg>
  );
}
