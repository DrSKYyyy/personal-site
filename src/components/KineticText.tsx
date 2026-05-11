import { cn } from "../lib/utils";

interface KineticTextProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
}

export default function KineticText({ text, className, as: Tag = "h1" }: KineticTextProps) {
  return (
    <Tag className={cn("flex flex-wrap font-light", className)}>
      {text.split("").map((char, i) => (
        <span
          key={i}
          className="kinetic-char"
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </Tag>
  );
}
